import Link from "next/link";
import { db } from "@/lib/db";
import { getAllPlatforms } from "@/lib/connectors";

export default async function ConnectorsPage() {
  const connectors = await db.chmsConnector.findMany({
    orderBy: { createdAt: "desc" },
  });

  const platforms = getAllPlatforms();
  const connectedMap = new Map(connectors.map((c) => [c.platform, c]));

  return (
    <div>
      <div className="mb-6">
        <Link href="/import" className="text-xs text-zinc-500 hover:text-white">
          &larr; Back to imports
        </Link>
        <h1 className="text-2xl font-bold mt-2">Platform Connectors</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Connect to your existing ChMS to automatically pull your church data
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const connector = connectedMap.get(platform.platform);
          const isConnected = connector?.status === "connected";

          return (
            <Link
              key={platform.platform}
              href={`/import/connectors/${platform.platform}`}
              className={`border rounded-lg p-5 transition-colors hover:border-zinc-600 ${
                isConnected
                  ? "border-green-800/50 bg-green-900/5"
                  : "border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold">
                    {platform.displayName}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {platform.description}
                  </p>
                </div>
                {isConnected && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400 shrink-0">
                    Connected
                  </span>
                )}
                {connector?.status === "error" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 shrink-0">
                    Error
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 mt-3">
                <span className="text-xs text-zinc-600">
                  Auth: {platform.authType === "oauth2" ? "OAuth 2.0" : platform.authType === "api_key" ? "API Key" : platform.authType === "basic" ? "Username/Password" : "OAuth 1.0"}
                </span>
                <span className="text-xs text-zinc-600">
                  {platform.capabilities.join(", ")}
                </span>
              </div>

              {connector?.lastSyncAt && (
                <div className="mt-2 text-xs text-zinc-600">
                  Last sync: {new Date(connector.lastSyncAt).toLocaleString()}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
