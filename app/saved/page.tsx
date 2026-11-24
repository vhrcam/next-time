"use client";

import { useClient, useInterests, useSaved } from "@/lib/store";
import Card, { Grid } from "../card";
import Detail, { useDetail } from "../detail";
import { Empty, PageHead, nameOf } from "../ui";

export default function SavedPage() {
  const client = useClient();
  const [saved] = useSaved();
  const [interests] = useInterests();
  const detail = useDetail();
  if (!client) return null;

  return (
    <>
      <PageHead title="Saved">
        <p>Developments you kept. They stay here until you remove them.</p>
      </PageHead>
      {saved.length ? (
        <Grid>
          {saved.map((e) => (
            <Card key={e.id} entry={e} name={e.label || nameOf(e.topic, interests)} onOpen={() => detail.open(e)} />
          ))}
        </Grid>
      ) : (
        <Empty>Nothing saved yet. Open a development and choose Save to keep it here.</Empty>
      )}
      {detail.entry && <Detail entry={detail.entry} name={detail.entry.label || nameOf(detail.entry.topic, interests)} onClose={detail.close} />}
    </>
  );
}
