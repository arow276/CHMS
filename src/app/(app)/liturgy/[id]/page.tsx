import Link from "next/link";
import { notFound } from "next/navigation";
import { getLiturgy } from "@/lib/dal/liturgy";
import { getService, getTradition } from "@/lib/liturgy/traditions";
import { BulletinView } from "@/components/app/liturgy/bulletin-view";
import type { LiturgicalDay, LiturgyDocument } from "@/lib/liturgy/types";

export default async function LiturgyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const liturgy = await getLiturgy(id);
  if (!liturgy || !liturgy.document) notFound();

  const tradition = getTradition(liturgy.tradition);
  const service = tradition && getService(liturgy.tradition, liturgy.serviceType);

  return (
    <div>
      <div className="mb-6 print:hidden">
        <Link href="/liturgy" className="text-sm text-zinc-400 hover:text-white transition-colors">
          &larr; Back to Liturgy
        </Link>
      </div>

      <BulletinView
        id={liturgy.id}
        status={liturgy.status}
        dateIso={liturgy.date.toISOString()}
        traditionName={tradition?.name ?? liturgy.tradition}
        serviceName={service?.name ?? liturgy.serviceType}
        eventName={liturgy.event?.name ?? null}
        day={liturgy.liturgicalDay as unknown as LiturgicalDay}
        initialDocument={liturgy.document as unknown as LiturgyDocument}
      />
    </div>
  );
}
