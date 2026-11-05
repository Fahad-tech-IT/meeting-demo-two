"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const createMeeting = () => {
    const id = "sabiqoon-" + crypto.randomUUID().slice(0, 8);
    router.push(`/room/${id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 p-6">
      <h1 className="text-3xl font-bold text-slate-800">Sabiqoon Live Class</h1>
      <p className="text-slate-500 text-center">
        Create a meeting and share the link with your students.
      </p>
      <button
        onClick={createMeeting}
        className="rounded-xl bg-emerald-600 px-8 py-4 text-lg font-semibold text-white hover:bg-emerald-700"
      >
        Create Meeting
      </button>
    </main>
  );
}