"use client";
import { Suspense, useState } from "react";
import { useParams } from "next/navigation";
import { JitsiMeeting } from "@jitsi/react-sdk";

function RoomContent() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!joined) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow space-y-4">
          <h1 className="text-xl font-bold text-slate-800">Join Class</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            disabled={!name.trim()}
            onClick={() => setJoined(true)}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white disabled:opacity-40"
          >
            Join
          </button>
          <button onClick={copyLink} className="w-full text-sm text-slate-500 underline">
            {copied ? "Link copied!" : "Copy invite link"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-white">
        <span className="text-sm">Room: {id}</span>
        <button onClick={copyLink} className="rounded bg-emerald-600 px-3 py-1 text-sm">
          {copied ? "Copied!" : "Copy invite link"}
        </button>
      </div>
      <div className="flex-1">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={id}
          userInfo={{ displayName: name, email: "" }}
          configOverwrite={{
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            disableDeepLinking: true,
          }}
          getIFrameRef={(el) => {
            el.style.height = "100%";
            el.style.width = "100%";
          }}
        />
      </div>
    </div>
  );
}

export default function Room() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-slate-50" />}>
      <RoomContent />
    </Suspense>
  );
}