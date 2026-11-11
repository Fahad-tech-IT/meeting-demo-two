import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createMeetingHostToken } from "@/lib/meeting-host-token";

export async function POST() {
  try {
    const room = `staff-${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const hostToken = createMeetingHostToken(room);

    return NextResponse.json({ room, hostToken });
  } catch (error) {
    console.error("Could not create meeting", error);
    return NextResponse.json(
      { error: "Meeting service is not configured" },
      { status: 500 },
    );
  }
}