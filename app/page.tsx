"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const createMeeting = async () => {
    setCreating(true);
    setError("");
    try {
      const response = await fetch("/api/create-meeting", { method: "POST" });
      if (!response.ok) throw new Error("Could not create meeting");

      const { room, hostToken } = await response.json();
      sessionStorage.setItem(`host:${room}`, hostToken);
      router.push(`/room/${room}`);
    } catch {
      setError("Could not create a meeting. Please try again.");
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-6">
      <h1 className="text-3xl font-bold text-slate-800">Staff Meeting</h1>
      <p className="text-slate-500 text-center">
        Create a meeting and share the link with your team.
      </p>
      <button
        onClick={createMeeting}
        disabled={creating}
        className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-700"
      >
        {creating ? "Creating…" : "Create Meeting"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </main>
  );
}