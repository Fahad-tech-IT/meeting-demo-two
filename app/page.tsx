"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function VideoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="6" width="13" height="12" rx="3" fill="currentColor" />
      <path d="m16 10 5-3v10l-5-3v-4Z" fill="currentColor" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

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

  const joinMeeting = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJoinError("");

    try {
      const input = meetingLink.trim();
      const url = new URL(input.includes("://") ? input : `https://${input}`);
      const roomMatch = url.pathname.match(/\/room\/([a-zA-Z0-9_-]+)/);
      if (!roomMatch) throw new Error("Enter a valid meeting link.");

      setJoining(true);
      router.push(`/room/${roomMatch[1]}`);
    } catch {
      setJoinError("Enter a valid meeting link, such as https://your-site.com/room/meeting-id.");
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Meetly home" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
            <VideoMark />
          </span>
          <span className="text-[21px] font-semibold tracking-tight text-slate-700">Meetly</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-500 sm:gap-5">
          <span className="hidden sm:inline">Simple, secure video meetings</span>
          <span aria-hidden="true" className="hidden h-6 w-px bg-slate-200 sm:block" />
          <span className="font-medium text-slate-700">Meetings</span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700" aria-label="Your profile">M</span>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-76px)] max-w-[1440px] items-center gap-14 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-10 lg:px-12 lg:pb-20 lg:pt-0">
        <div className="mx-auto w-full max-w-[550px] lg:mx-0 lg:pb-2">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-blue-700">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            YOUR SPACE TO CONNECT
          </p>
          <h1 className="max-w-[540px] text-[42px] font-normal leading-[1.12] tracking-[-0.045em] text-slate-800 sm:text-[54px] lg:text-[62px]">
            Video calls made
            <br className="hidden sm:block" /> easy for everyone.
          </h1>
          <p className="mt-6 max-w-[470px] text-base leading-7 text-slate-500 sm:text-lg sm:leading-8">
            Bring your team together from anywhere. Start a meeting in seconds or join one with a link.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              onClick={createMeeting}
              disabled={creating}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-[0_8px_20px_-10px_rgba(37,99,235,0.7)] transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
            >
              <VideoMark className="h-5 w-5" />
              {creating ? "Creating your meeting…" : "Start a meeting"}
            </button>
            <span className="text-sm text-slate-400">No downloads needed</span>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="my-8 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400 sm:max-w-[480px]">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or join with a link</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={joinMeeting} className="flex max-w-[490px] flex-col gap-3 sm:flex-row">
            <label htmlFor="meeting-link" className="sr-only">Meeting link</label>
            <input
              id="meeting-link"
              type="text"
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              placeholder="Paste a meeting link"
              className="h-14 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={!meetingLink.trim() || joining}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {joining ? "Opening…" : "Join"}
              {!joining && <ArrowRightIcon />}
            </button>
          </form>
          {joinError && <p role="alert" className="mt-2 max-w-[490px] text-sm text-red-600">{joinError}</p>}

          <div className="mt-12 flex items-center gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <path d="M10 2.5 16 5v4.3c0 3.8-2.6 6.7-6 8.2-3.4-1.5-6-4.4-6-8.2V5l6-2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="m7.5 9.8 1.7 1.7 3.4-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span>Private by design. Only invited people can join your room.</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[650px] lg:ml-auto">
          <div className="absolute -right-4 -top-5 h-32 w-32 rounded-full bg-blue-100/70 blur-3xl sm:-right-8 sm:-top-8 sm:h-48 sm:w-48" />
          <div className="absolute -bottom-5 -left-6 h-36 w-36 rounded-full bg-violet-100/80 blur-3xl sm:-bottom-10 sm:-left-10 sm:h-52 sm:w-52" />
          <div className="relative overflow-hidden rounded-[26px] border border-slate-200 bg-[#eaf0fb] p-3 shadow-[0_26px_80px_-36px_rgba(15,23,42,0.28)] sm:rounded-[32px] sm:p-4">
            <div className="relative flex aspect-[1.17] flex-col overflow-hidden rounded-[20px] bg-gradient-to-br from-[#dce8f8] via-[#dce4f2] to-[#e9e9f4] sm:rounded-[25px]">
              <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-[10%] top-[15%] h-[80%] w-[55%] rounded-[48%] bg-white/40 blur-2xl" />
                <div className="absolute -right-[8%] -top-[22%] h-[80%] w-[55%] rounded-full bg-indigo-200/50 blur-3xl" />
                <div className="absolute -bottom-[45%] left-[12%] h-[85%] w-[90%] rounded-[50%] bg-blue-300/30 blur-3xl" />
                <div className="absolute bottom-0 h-[34%] w-full bg-gradient-to-t from-white/45 to-transparent" />
              </div>
              <div className="relative z-[1] flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-6">
                <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">Team sync</span>
                <span className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/65 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live preview
                </span>
              </div>

              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-end justify-center">
                <div className="relative h-[82%] w-[54%]">
                  <div className="absolute bottom-[-4%] left-1/2 h-[78%] w-[115%] -translate-x-1/2 rounded-t-[48%] bg-gradient-to-b from-[#7386ad] to-[#53678e] shadow-[inset_20px_0_35px_rgba(255,255,255,0.18)]" />
                  <div className="absolute bottom-[51%] left-1/2 h-[40%] w-[46%] -translate-x-1/2 rounded-[48%] bg-gradient-to-br from-[#efc8b3] via-[#e6b69f] to-[#c98876] shadow-[inset_8px_0_16px_rgba(255,255,255,0.25)]" />
                  <div className="absolute bottom-[82%] left-1/2 h-[25%] w-[50%] -translate-x-1/2 rounded-t-[55%] rounded-b-[42%] bg-gradient-to-r from-[#4d423f] via-[#6e5750] to-[#423938]" />
                  <div className="absolute bottom-[53%] left-[31%] h-[1.5%] w-[3%] rounded-full bg-[#665048]" />
                  <div className="absolute bottom-[53%] right-[31%] h-[1.5%] w-[3%] rounded-full bg-[#665048]" />
                  <div className="absolute bottom-[43%] left-1/2 h-[2%] w-[8%] -translate-x-1/2 rounded-full bg-[#b46e64]" />
                  <div className="absolute bottom-[52%] left-[22%] h-[7%] w-[8%] rotate-[-13deg] rounded-full bg-[#526481]" />
                  <div className="absolute bottom-[52%] right-[22%] h-[7%] w-[8%] rotate-[13deg] rounded-full bg-[#526481]" />
                  <div className="absolute bottom-[24%] left-[12%] h-[37%] w-[25%] rotate-[15deg] rounded-[45%] bg-gradient-to-b from-[#e7b69f] to-[#d69a88]" />
                  <div className="absolute bottom-[24%] right-[12%] h-[37%] w-[25%] rotate-[-15deg] rounded-[45%] bg-gradient-to-b from-[#e7b69f] to-[#d69a88]" />
                </div>
              </div>

              <div className="relative z-[1] mt-auto flex items-center justify-between p-4 sm:p-6">
                <div className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">You’re ready when they are</div>
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-10 sm:w-10">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><path d="M3.5 7.5h2.2l2.8-2v9l-2.8-2H3.5v-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11.5 7.5c1.7 1.3 1.7 3.7 0 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-10 sm:w-10">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4"><rect x="3" y="5" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m13 8 4-2v8l-4-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-white shadow-sm sm:h-10 sm:w-10">
                    <VideoMark className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-[0_12px_35px_-20px_rgba(15,23,42,0.35)] sm:-bottom-6 sm:left-10 sm:px-5 sm:py-4">
            <span className="flex -space-x-2">
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-rose-100 text-[10px] font-semibold text-rose-700">A</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-amber-100 text-[10px] font-semibold text-amber-700">J</span>
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-cyan-100 text-[10px] font-semibold text-cyan-700">S</span>
            </span>
            <span className="text-xs font-medium text-slate-600">Good conversations start here</span>
          </div>
        </div>
      </section>
    </main>
  );
}