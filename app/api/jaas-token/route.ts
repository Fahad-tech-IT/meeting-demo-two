import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { isMeetingHost } from "@/lib/meeting-host-token";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { room, name, hostToken } = body as {
    room?: unknown;
    name?: unknown;
    hostToken?: unknown;
  };

  if (
    typeof room !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(room) ||
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 100
  ) {
    return NextResponse.json({ error: "Room and name are required" }, { status: 400 });
  }

  const appId = process.env.JAAS_APP_ID;
  const keyId = process.env.JAAS_KEY_ID;
  const privateKey = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!appId || !keyId || !privateKey) {
    console.error("JaaS token service is missing required environment variables");
    return NextResponse.json(
      { error: "Meeting service is not configured" },
      { status: 500 },
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const isHost = isMeetingHost(room, hostToken);

  try {
    const token = jwt.sign(
      {
        aud: "jitsi",
        iss: "chat",
        sub: appId,
        room,
        nbf: now - 10,
        exp: now + 60 * 60 * 3,
        context: {
          user: {
            id: randomUUID(),
            name: name.trim().slice(0, 50),
            moderator: isHost,
          },
          features: {
            lobby: true,
            recording: "false",
            livestreaming: "false",
            transcription: "false",
            "outbound-call": "false",
          },
        },
      },
      privateKey,
      { algorithm: "RS256", keyid: keyId },
    );

    return NextResponse.json({ token, isHost });
  } catch (error) {
    console.error("Could not sign JaaS token", error);
    return NextResponse.json(
      { error: "Could not create meeting token" },
      { status: 500 },
    );
  }
}