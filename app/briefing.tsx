"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { decide, isMajor, issue, nextDue, waiting, type Entry } from "@/lib/briefing";
import type { Story } from "@/lib/db";
import { keepBriefings, load, useBriefings, useClient, useInterests, useSettings, write, type Interest } from "@/lib/store";
import Card, { Grid } from "./card";
import Detail, { useDetail } from "./detail";
import { Block, Empty, PageHead, nameOf, plural, primary, when } from "./ui";

type Info = { id: string; name: string; stale: boolean; checking: boolean };
type Report = { topics: Info[]; stories: Story[]; at: number };

function Welcome() {
  return (
    <div className="mx-auto max-w-xl py-16 text-center">
      <p className="font-logo text-3xl text-ink">next time</p>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight">Stay informed without staying online.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Choose what you follow for work or for fun. next time reads official announcements, release notes and the news, keeps only real
        developments, and puts them in a short briefing you can finish.
      </p>
      <Link href="/interests" className={`${primary} mt-8`}>
        Choose your interests
      </Link>
    </div>
  );
}

export default function BriefingView() {
  const client = useClient();
  const [interests] = useInterests();
  const [settings] = useSettings();
  const [briefings] = useBriefings();
  const [report, setReport] = useState<Report | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [more, setMore] = useState(false);
  const detail = useDetail();
  const tried = useRef(new Set<string>());
  const ids = interests.map((i) => i.id).join(",");

  // Loads the shared developments for these interests, checks the ones not checked in 12 hours, then loads again.
  useEffect(() => {
    if (!ids) return;
    let live = true;
    const fetchReport = async () => {
      const res = await fetch(`/api/report?topics=${ids}`);
      if (!res.ok) throw new Error(String(res.status));
      const data: Report = { ...(await res.json()), at: Date.now() };
      if (live) setReport(data);
      return data;
    };
    (async () => {
      const first = await fetchReport();
      const stored = load<Interest[]>("interests", []);
      if (stored.some((i) => !i.name))
        write("interests", stored.map((i) => ({ ...i, name: i.name || first.topics.find((t) => t.id === i.id)?.name || "" })));
      const queue = first.topics.filter((t) => t.stale && !t.checking && !tried.current.has(t.id)).map((t) => t.id);
      queue.forEach((id) => tried.current.add(id));
      if (!live) return;
      setPending([...queue]);
      if (queue.length) {
        const worker = async () => {
          while (queue.length && live) {
            const id = queue.shift()!;
            await fetch(`/api/check?topic=${id}`, { method: "POST" }).catch(() => {});
            if (live) setPending((p) => p.filter((x) => x !== id));
          }
        };
        await Promise.all([worker(), worker()]);
        if (live) await fetchReport();
      }
      if (live) setReady(true);
    })().catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [ids]);

  const entries = useMemo<Entry[]>(() => {
    if (!report) return [];
    const names = new Map(report.topics.map((t) => [t.id, t.name]));
    return report.stories.map((s) => ({ ...s, label: names.get(s.topic), links: s.links.slice(0, 8) }));
  }, [report]);

  // With fresh developments in hand: start a new briefing when one is due, or add major developments early.
  useEffect(() => {
    if (!ready || !report) return;
    const next = decide(entries, briefings, ids.split(","), settings, report.at);
    if (next) keepBriefings(next);
  }, [ready, report, entries, briefings, ids, settings]);

  if (!client) return null;
  if (!interests.length) return <Welcome />;

  const current = briefings[0];
  const nameFor = (e: Entry) => e.label || nameOf(e.topic, interests);

  if (!current) {
    return (
      <>
        <PageHead title="Briefing">
          <p>
            {failed
              ? "Couldn't reach the server. Check your connection and reload the page."
              : ready
                ? "No major developments in your interests in the past week. When one happens, it will be here."
                : "Preparing your first briefing. The first check of an interest takes a few seconds."}
          </p>
        </PageHead>
        {!failed && !ready && (
          <ul className="max-w-md divide-y divide-line rounded-md border border-line bg-surface">
            {interests.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <span className="truncate text-ink">{i.name || "Shared interest"}</span>
                <span className="shrink-0 text-xs text-faint">{!report ? "Waiting" : pending.includes(i.id) ? "Checking sources…" : "Ready"}</span>
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  const manual = settings.schedule === "manual";
  const queued = manual && ready && report ? waiting(entries, briefings, ids.split(","), report.at) : [];
  const majors = current.stories.filter(isMajor);
  const others = current.stories.filter((s) => !isMajor(s));
  const due = nextDue(current, settings);
  const fields = new Set(current.stories.map((s) => s.topic)).size;
  const span = current.from ? `since ${when(current.from, "weekday")}` : "in the past week";
  const card = (e: Entry) => <Card key={e.id} entry={e} name={nameFor(e)} read={detail.read.includes(e.id)} onOpen={() => detail.open(e)} />;
  const getNew = () => report && keepBriefings([issue(queued, briefings, ids.split(","), settings, report.at), ...briefings]);

  return (
    <>
      <PageHead
        title="Briefing"
        aside={
          manual && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-faint">
                {!ready ? "Checking sources…" : queued.length ? `${plural(queued.length, "new development")} waiting` : "Nothing new yet"}
              </span>
              <button onClick={getNew} disabled={!queued.length} className={primary}>
                Get new briefing
              </button>
            </div>
          )
        }
      >
        <p className="text-faint">{when(current.issued, "full")}</p>
        <p>
          {current.stories.length
            ? `${plural(current.stories.length, "development")} across ${plural(fields, "interest")}${majors.length ? `, ${majors.length} major` : ""}, ${span}.`
            : `No developments ${span}.`}
          {due ? ` Next briefing ${when(due, "weekday")}.` : settings.schedule === "major" ? " A new briefing arrives when something major happens." : ""}
        </p>
      </PageHead>

      {(pending.length > 0 || failed) && (
        <p className="-mt-4 mb-6 text-xs text-faint">
          {failed ? "Couldn't check for new developments right now." : `Checking sources for ${plural(pending.length, "interest")}…`}
        </p>
      )}

      {current.early.length > 0 && (
        <Block title="Since this briefing" note="Major developments that arrived after this briefing.">
          <Grid>{current.early.map(card)}</Grid>
        </Block>
      )}

      {!current.stories.length ? (
        <Empty>You&apos;re caught up. Nothing meaningful happened in your interests {span}.</Empty>
      ) : majors.length && others.length ? (
        <>
          <Block title="Major">
            <Grid>{majors.map(card)}</Grid>
          </Block>
          <Block title="Also in this briefing">
            <Grid>{others.map(card)}</Grid>
          </Block>
        </>
      ) : (
        <Grid>{current.stories.map(card)}</Grid>
      )}

      {current.extra.length > 0 && (
        <div className="mt-10 border-t border-line pt-5">
          <button onClick={() => setMore(!more)} className="text-sm text-muted hover:text-ink">
            {more ? "Hide" : "Show"} {plural(current.extra.length, "smaller development")} left out by your limit
          </button>
          {more && (
            <div className="mt-4">
              <Grid>{current.extra.map(card)}</Grid>
            </div>
          )}
        </div>
      )}

      <p className="mt-12 border-t border-line pt-5 text-center text-xs text-faint">
        End of briefing.{due ? ` Your next one arrives ${when(due, "weekday")}.` : ""}
      </p>

      {detail.entry && <Detail entry={detail.entry} name={nameFor(detail.entry)} onClose={detail.close} />}
    </>
  );
}
