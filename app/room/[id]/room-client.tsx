"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const JaaSMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((sdk) => sdk.JaaSMeeting),
  {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading meeting…</div>,
  },
);

export default function RoomClient({ id }: { id: string }) {
  const [name, setName] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the meeting link. Please copy it from the address bar.");
    }
  };

  const join = async () => {
    setLoading(true);
    setError("");
    try {
      const hostToken = sessionStorage.getItem(`host:${id}`);
      const response = await fetch("/api/jaas-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: id, name, hostToken }),
      });
      if (!response.ok) throw new Error("Could not get meeting token");

      const data: { token?: unknown } = await response.json();
      if (typeof data.token !== "string") throw new Error("Invalid meeting token response");
      setToken(data.token);
    } catch {
      setError("Could not join. Please check the meeting settings and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow">
          <h1 className="text-xl font-bold text-slate-800">Join Meeting</h1>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            maxLength={100}
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            disabled={!name.trim() || loading}
            onClick={join}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white disabled:opacity-40"
          >
            {loading ? "Joining..." : "Join"}
          </button>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button onClick={copyLink} className="w-full text-sm text-slate-500 underline">
            {copied ? "Link copied!" : "Copy invite link"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-white">
        <span className="text-sm">Room: {id}</span>
        <button onClick={copyLink} className="rounded bg-emerald-600 px-3 py-1 text-sm">
          {copied ? "Copied!" : "Copy invite link"}
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <JaaSMeeting
          appId={process.env.NEXT_PUBLIC_JAAS_APP_ID ?? ""}
          roomName={id}
          jwt={token}
          userInfo={{ displayName: name, email: "" }}
          configOverwrite={{
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            disableDeepLinking: true,
          }}
          onReadyToClose={() => setToken(null)}
          getIFrameRef={(element) => {
            element.style.height = "100%";
            element.style.width = "100%";
          }}
        />
      </div>
    </div>
  );
}