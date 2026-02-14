"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveConnector,
  testConnectorConnection,
  syncFromConnector,
  deleteConnector,
  updateSyncSchedule,
} from "@/lib/actions/connectors";
import type { ConnectorConfig } from "@/lib/connectors";

interface ConnectorSetupProps {
  platform: string;
  config: ConnectorConfig;
  existingConnector: {
    id: string;
    status: string;
    lastSyncAt: string | null;
    lastError: string | null;
    syncSchedule: string | null;
  } | null;
}

export function ConnectorSetup({
  platform,
  config,
  existingConnector,
}: ConnectorSetupProps) {
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Form fields based on auth type
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const credentials: Record<string, string> = {};
    if (config.authType === "api_key") {
      if (!apiKey) {
        setError("API key is required");
        setSaving(false);
        return;
      }
      credentials.apiKey = apiKey;
      if (apiSecret) credentials.apiSecret = apiSecret;
      if (subdomain) credentials.subdomain = subdomain;
    } else if (config.authType === "basic") {
      if (!username || !password || !subdomain) {
        setError("Username, password, and subdomain are required");
        setSaving(false);
        return;
      }
      credentials.username = username;
      credentials.password = password;
      credentials.subdomain = subdomain;
    } else if (config.authType === "oauth2") {
      // For OAuth, we'd normally redirect to the platform's auth page
      // For MVP, we accept an access token directly
      if (!apiKey) {
        setError("Access token is required");
        setSaving(false);
        return;
      }
      credentials.accessToken = apiKey;
      if (subdomain) credentials.subdomain = subdomain;
    }

    const result = await saveConnector(platform, credentials);
    setSaving(false);

    if (result.error) {
      setError(result.error);
    } else if (result.connected) {
      setSuccess("Connected successfully!");
      router.refresh();
    } else {
      setError(
        "Credentials saved but could not connect. Please verify your credentials.",
      );
      router.refresh();
    }
  }

  async function handleTest() {
    if (!existingConnector) return;
    setTesting(true);
    setError(null);
    setSuccess(null);

    const result = await testConnectorConnection(existingConnector.id);
    setTesting(false);

    if (result.connected) {
      setSuccess("Connection test passed!");
      router.refresh();
    } else {
      setError(result.error || "Connection test failed");
    }
  }

  async function handleSync() {
    if (!existingConnector) return;
    setSyncing(true);
    setError(null);
    setSuccess(null);

    const result = await syncFromConnector(existingConnector.id);
    setSyncing(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(
        `Sync complete! Imported ${result.imported} records${result.errors ? ` with ${result.errors} errors` : ""}.`,
      );
      router.refresh();
    }
  }

  async function handleDelete() {
    if (!existingConnector) return;
    if (!confirm("Are you sure you want to disconnect this platform?")) return;

    await deleteConnector(existingConnector.id);
    router.push("/import/connectors");
  }

  async function handleScheduleChange(schedule: string) {
    if (!existingConnector) return;
    await updateSyncSchedule(existingConnector.id, schedule);
    router.refresh();
  }

  // Already connected — show management UI
  if (existingConnector) {
    return (
      <div className="max-w-xl space-y-6">
        {/* Status */}
        <div
          className={`rounded-lg p-4 border ${
            existingConnector.status === "connected"
              ? "border-green-800/50 bg-green-900/10"
              : existingConnector.status === "syncing"
                ? "border-amber-800/50 bg-amber-900/10"
                : "border-red-800/50 bg-red-900/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                existingConnector.status === "connected"
                  ? "bg-green-500"
                  : existingConnector.status === "syncing"
                    ? "bg-amber-500 animate-pulse"
                    : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-white capitalize">
              {existingConnector.status}
            </span>
          </div>
          {existingConnector.lastSyncAt && (
            <p className="text-xs text-zinc-500 mt-1">
              Last synced: {new Date(existingConnector.lastSyncAt).toLocaleString()}
            </p>
          )}
          {existingConnector.lastError && (
            <p className="text-xs text-red-400 mt-1">
              {existingConnector.lastError}
            </p>
          )}
        </div>

        {/* Sync schedule */}
        <div className="border border-zinc-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-2">
            Sync Schedule
          </h3>
          <select
            value={existingConnector.syncSchedule ?? "manual"}
            onChange={(e) => handleScheduleChange(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white w-full"
          >
            <option value="manual">Manual only</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>

        {/* Actions */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-900/30 border border-green-800 rounded-lg text-sm text-green-400">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            disabled={syncing}
            onClick={handleSync}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-sm transition-colors"
          >
            {syncing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">&#8987;</span>
                Syncing...
              </span>
            ) : (
              "Sync Now"
            )}
          </button>
          <button
            type="button"
            disabled={testing}
            onClick={handleTest}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:text-zinc-600 text-white rounded-lg text-sm transition-colors"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 rounded-lg text-sm transition-colors ml-auto"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Not connected — show setup form
  return (
    <div className="max-w-xl space-y-6">
      <div className="border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-3">
          {config.authType === "oauth2"
            ? "Connect with Access Token"
            : config.authType === "api_key"
              ? "API Key Authentication"
              : "Login Credentials"}
        </h3>

        <div className="space-y-3">
          {/* Subdomain field (if applicable) */}
          {(config.authType === "basic" ||
            platform === "breeze" ||
            platform === "rock_rms" ||
            platform === "fellowship_one" ||
            platform === "ministry_platform") && (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">
                {platform === "rock_rms"
                  ? "Server URL (e.g. rock.mychurch.com)"
                  : platform === "ministry_platform"
                    ? "Server URL (e.g. my.ministryplatform.com)"
                    : "Subdomain (e.g. mychurch)"}
              </label>
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder={
                  platform === "rock_rms"
                    ? "rock.mychurch.com"
                    : platform === "ccb"
                      ? "mychurch"
                      : "mychurch"
                }
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
              />
            </div>
          )}

          {/* API Key / Access Token */}
          {(config.authType === "api_key" || config.authType === "oauth2") && (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">
                {config.authType === "oauth2"
                  ? "Access Token"
                  : "API Key"}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
              />
              {config.authType === "oauth2" && (
                <p className="text-xs text-zinc-600 mt-1">
                  Generate a personal access token from your {config.displayName} account settings
                </p>
              )}
            </div>
          )}

          {/* API Secret (Planning Center uses app_id + secret) */}
          {platform === "planning_center" && (
            <div>
              <label className="text-xs text-zinc-500 block mb-1">
                Application Secret
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Create a Personal Access Token at api.planningcenteronline.com/oauth/applications
              </p>
            </div>
          )}

          {/* Username/Password (CCB) */}
          {config.authType === "basic" && (
            <>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  API Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-500 block mb-1">
                  API Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* What data will be imported */}
      <div className="border border-zinc-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">
          Data that will be imported
        </h3>
        <div className="flex flex-wrap gap-2">
          {config.capabilities.map((cap) => (
            <span
              key={cap}
              className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400 capitalize"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-900/30 border border-green-800 rounded-lg text-sm text-green-400">
          {success}
        </div>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-medium rounded-lg transition-colors"
      >
        {saving ? "Connecting..." : `Connect to ${config.displayName}`}
      </button>
    </div>
  );
}
