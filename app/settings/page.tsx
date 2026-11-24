"use client";

import { useState, type ReactNode } from "react";
import { limits, schedules, type Settings } from "@/lib/briefing";
import { useClient, useInterests, useSettings } from "@/lib/store";
import { PageHead, button, label } from "../ui";

function Field({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className={label}>{title}</h2>
      {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const client = useClient();
  const [settings, setSettings] = useSettings();
  const [interests] = useInterests();
  const [copied, setCopied] = useState(false);
  if (!client) return null;

  const set = (patch: Partial<Settings>) => setSettings({ ...settings, ...patch });

  async function copy() {
    await navigator.clipboard.writeText(`${location.origin}/?t=${interests.map((i) => i.id).join(",")}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <PageHead title="Settings">
        <p>Choose how often you get a briefing and how much goes in it. Everything is saved in this browser.</p>
      </PageHead>

      <div className="max-w-2xl space-y-10">
        <Field title="Briefing schedule">
          <div className="divide-y divide-line rounded-md border border-line bg-surface">
            {schedules.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-raised">
                <input
                  type="radio"
                  name="schedule"
                  checked={settings.schedule === s.id}
                  onChange={() => set({ schedule: s.id })}
                  className="mt-1 accent-accent"
                />
                <span>
                  <span className="block text-sm text-ink">{s.label}</span>
                  <span className="block text-xs text-muted">{s.note}</span>
                </span>
              </label>
            ))}
          </div>
        </Field>

        <Field title="Most developments per briefing" note="A limit, not a target. If only two things happen, you get two.">
          <div className="inline-flex overflow-hidden rounded-md border border-line">
            {limits.map((n) => (
              <button
                key={n}
                onClick={() => set({ limit: n })}
                aria-pressed={settings.limit === n}
                className={`border-l border-line px-4 py-2 text-sm first:border-l-0 ${
                  settings.limit === n ? "bg-ink text-bg" : "bg-surface text-muted hover:text-ink"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Field>

        {settings.schedule !== "major" && (
          <Field title="Major developments">
            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line bg-surface px-4 py-3">
              <input type="checkbox" checked={settings.early} onChange={(e) => set({ early: e.target.checked })} className="mt-1 accent-accent" />
              <span>
                <span className="block text-sm text-ink">Show major developments right away</span>
                <span className="block text-xs text-muted">They appear at the top of your current briefing instead of waiting for the next one.</span>
              </span>
            </label>
          </Field>
        )}

        <Field title="Other devices" note="There's no account. Open this link on your phone or another computer to bring your interests along.">
          <button onClick={copy} disabled={!interests.length} className={button}>
            {copied ? "Link copied" : "Copy link with my interests"}
          </button>
        </Field>

        <Field title="Where developments come from">
          <p className="text-sm leading-relaxed text-muted">
            Once a day next time reads official sites, blogs, release notes and YouTube channels, plus Google News and Hacker News. An AI step
            keeps only things that actually happened, merges coverage of the same event, and writes what happened, what&apos;s new and why it
            matters. Opinions, rumors, leaks and reactions are left out, and every development links to its original sources.
          </p>
        </Field>
      </div>
    </>
  );
}
