import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getPlatformConfig } from "@/lib/connectors";
import { ConnectorSetup } from "@/components/app/import/connector-setup";

export default async function PlatformConnectorPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const config = getPlatformConfig(platform);

  if (!config) notFound();

  const connector = await db.chmsConnector.findFirst({
    where: { platform },
  });

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/import/connectors"
          className="text-xs text-zinc-500 hover:text-white"
        >
          &larr; Back to connectors
        </Link>
        <h1 className="text-2xl font-bold mt-2">{config.displayName}</h1>
        <p className="text-sm text-zinc-500 mt-1">{config.description}</p>
      </div>

      <ConnectorSetup
        platform={platform}
        config={config}
        existingConnector={
          connector
            ? {
                id: connector.id,
                status: connector.status,
                lastSyncAt: connector.lastSyncAt?.toISOString() ?? null,
                lastError: connector.lastError,
                syncSchedule: connector.syncSchedule,
              }
            : null
        }
      />
    </div>
  );
}
