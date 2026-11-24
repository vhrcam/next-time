"use client";

import { useState } from "react";
import { isMajor, type Entry } from "@/lib/briefing";
import { useBriefings, useClient, useInterests } from "@/lib/store";
import Card, { Grid } from "../card";
import Detail, { useDetail } from "../detail";
import { Block, Empty, PageHead, nameOf, plural, when } from "../ui";

export default function ArchivePage() {
  const client = useClient();
  const [briefings] = useBriefings();
  const [interests] = useInterests();
  const [openId, setOpenId] = useState<number | null>(null);
  const detail = useDetail();
  if (!client) return null;

  const nameFor = (e: Entry) => e.label || nameOf(e.topic, interests);
  const card = (e: Entry) => <Card key={e.id} entry={e} name={nameFor(e)} read={detail.read.includes(e.id)} onOpen={() => detail.open(e)} />;
  const shown = briefings.find((b) => b.id === openId);

  if (shown) {
    const majors = shown.stories.filter(isMajor).length;
    return (
      <>
        <button onClick={() => setOpenId(null)} className="mb-5 text-sm text-muted hover:text-ink">
          ← All briefings
        </button>
        <PageHead title={`Briefing · ${when(shown.issued, "weekday")}`}>
          <p>
            {shown.stories.length ? `${plural(shown.stories.length, "development")}${majors ? `, ${majors} major` : ""}.` : "No developments in this briefing."}
          </p>
        </PageHead>
        {shown.early.length > 0 && (
          <Block title="Arrived early">
            <Grid>{shown.early.map(card)}</Grid>
          </Block>
        )}
        {shown.stories.length > 0 && (
          <Block title="In this briefing">
            <Grid>{shown.stories.map(card)}</Grid>
          </Block>
        )}
        {shown.extra.length > 0 && (
          <Block title="Left out by the limit">
            <Grid>{shown.extra.map(card)}</Grid>
          </Block>
        )}
        {detail.entry && <Detail entry={detail.entry} name={nameFor(detail.entry)} onClose={detail.close} />}
      </>
    );
  }

  return (
    <>
      <PageHead title="Archive">
        <p>Every briefing you&apos;ve received, newest first.</p>
      </PageHead>
      {briefings.length ? (
        <ul className="divide-y divide-line rounded-md border border-line bg-surface">
          {briefings.map((b, i) => (
            <li key={b.id}>
              <button
                onClick={() => setOpenId(b.id)}
                className="grid w-full gap-x-6 gap-y-1 px-4 py-3.5 text-left transition-colors hover:bg-raised sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-baseline"
              >
                <span className="text-sm text-ink">{when(b.issued, "weekday")}</span>
                <span className="truncate text-sm text-muted">{b.stories[0]?.headline ?? "No developments"}</span>
                <span className="text-xs text-faint">
                  {plural(b.stories.length + b.early.length, "development")}
                  {i === 0 ? " · Current" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>Your past briefings will appear here.</Empty>
      )}
    </>
  );
}
