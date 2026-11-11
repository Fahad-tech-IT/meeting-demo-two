import "server-only";
import { createHash } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

function getHostTokenSecret(): Buffer {
  const privateKey = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!privateKey) {
    throw new Error("JAAS_PRIVATE_KEY is not configured");
  }

  return createHash("sha256")
    .update(`meeting-host-token:${privateKey}`)
    .digest();
}

export function createMeetingHostToken(room: string): string {
  return jwt.sign({ room, scope: "host" }, getHostTokenSecret(), {
    algorithm: "HS256",
    expiresIn: "3h",
  });
}

export function isMeetingHost(room: string, token: unknown): boolean {
  if (typeof token !== "string") return false;

  try {
    const payload = jwt.verify(token, getHostTokenSecret(), {
      algorithms: ["HS256"],
    }) as JwtPayload;

    return payload.room === room && payload.scope === "host";
  } catch {
    return false;
  }
}