import { Suspense } from "react";
import RoomClient from "./room-client";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<RoomLoading />}>
      <RoomContent params={params} />
    </Suspense>
  );
}

async function RoomContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomClient id={id} />;
}

function RoomLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-600">
      Loading meeting…
    </main>
  );
}
