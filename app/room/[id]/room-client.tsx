"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";

type KnockingParticipant = {
  id: string;
  name: string;
};

type MeetingApi = {
  addListener: (event: string, callback: (event: unknown) => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
};

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
  const [isHost, setIsHost] = useState(false);
  const [lobbyReady, setLobbyReady] = useState(false);
  const [knockingParticipants, setKnockingParticipants] = useState<KnockingParticipant[]>([]);
  const meetingApiRef = useRef<MeetingApi | null>(null);

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

      const data: { token?: unknown; isHost?: unknown } = await response.json();
      if (typeof data.token !== "string") throw new Error("Invalid meeting token response");
      setIsHost(data.isHost === true);
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
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-white">
        <span className="text-sm">Room: {id}</span>
        {isHost && lobbyReady && (
          <button onClick={copyLink} className="rounded bg-emerald-600 px-3 py-1 text-sm">
            {copied ? "Copied!" : "Copy invite link"}
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1">
        {error && (
          <p role="alert" className="bg-amber-100 px-4 py-2 text-sm text-amber-900">
            {error}
          </p>
        )}
        <JaaSMeeting
          appId={process.env.NEXT_PUBLIC_JAAS_APP_ID ?? ""}
          roomName={id}
          jwt={token}
          userInfo={{ displayName: name, email: "" }}
          configOverwrite={{
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            disableDeepLinking: true,
            lobby: { autoKnock: true, enableChat: true },
          }}
          onApiReady={(api) => {
            const meetingApi = api as MeetingApi;
            meetingApiRef.current = meetingApi;

            if (isHost) {
              meetingApi.addListener("lobbyModeChanged", (event) => {
                const enabled = (event as { enabled?: unknown }).enabled;
                setLobbyReady(enabled === true);
                if (enabled === true) {
                  setError("");
                } else {
                  setError("The meeting lobby could not be enabled. Check that lobby is supported for your JaaS app.");
                }
              });
              meetingApi.addListener("videoConferenceJoined", () => {
                meetingApi.executeCommand("toggleLobby", true);
              });
              meetingApi.addListener("knockingParticipant", (event) => {
                const participant = (event as { participant?: KnockingParticipant }).participant;
                if (!participant?.id) return;
                setKnockingParticipants((current) =>
                  current.some((item) => item.id === participant.id)
                    ? current
                    : [...current, { id: participant.id, name: participant.name || "Guest" }],
                );
              });
            }
          }}
          onReadyToClose={() => setToken(null)}
          getIFrameRef={(element) => {
            element.style.height = "100%";
            element.style.width = "100%";
          }}
        />
        {isHost && knockingParticipants.length > 0 && (
          <section className="fixed bottom-4 right-4 z-10 w-80 space-y-3 rounded-xl bg-white p-4 shadow-xl">
            <h2 className="font-semibold text-slate-900">Waiting to be admitted</h2>
            {knockingParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-slate-700">{participant.name}</span>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => {
                      meetingApiRef.current?.executeCommand(
                        "answerKnockingParticipant",
                        participant.id,
                        true,
                      );
                      setKnockingParticipants((current) =>
                        current.filter((item) => item.id !== participant.id),
                      );
                    }}
                    className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white"
                  >
                    Admit
                  </button>
                  <button
                    onClick={() => {
                      meetingApiRef.current?.executeCommand(
                        "answerKnockingParticipant",
                        participant.id,
                        false,
                      );
                      setKnockingParticipants((current) =>
                        current.filter((item) => item.id !== participant.id),
                      );
                    }}
                    className="rounded border px-2 py-1 text-xs font-medium text-slate-700"
                  >
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}