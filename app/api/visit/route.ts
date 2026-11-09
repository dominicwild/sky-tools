import { createHash, randomBytes } from "node:crypto";

const STREAM_KEY = "visits";
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const SALT_LIFETIME_S = 2 * 24 * 60 * 60;
const MAX_LEAVE_MS = 7 * 24 * 60 * 60 * 1000;
const BOT_PATTERN = /bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|embedly|preview/i;

type ViewEvent = {
  kind: "view";
  view: string;
  path: string;
  title: string;
  referrer: string;
  screen: string;
  language: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
};

type LeaveEvent = { kind: "leave"; view: string; ms: number };

type VisitEvent = ViewEvent | LeaveEvent;

class InvalidEvent extends Error {}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function text(body: Record<string, unknown>, field: string, maxLength: number, pattern?: RegExp): string {
  const value = body[field];
  if (typeof value !== "string" || value.length > maxLength) throw new InvalidEvent(field);
  if (pattern && !pattern.test(value)) throw new InvalidEvent(field);
  return value;
}

function clippedText(body: Record<string, unknown>, field: string, maxLength: number): string {
  const value = body[field];
  if (typeof value !== "string") throw new InvalidEvent(field);
  return value.slice(0, maxLength);
}

function parseEvent(raw: unknown): VisitEvent {
  if (typeof raw !== "object" || raw === null) throw new InvalidEvent("body");
  const body = raw as Record<string, unknown>;
  const view = text(body, "view", 40, /^[0-9a-f-]{36}$/);

  if (body.kind === "leave") {
    const ms = body.ms;
    if (typeof ms !== "number" || !Number.isInteger(ms) || ms < 0 || ms > MAX_LEAVE_MS) throw new InvalidEvent("ms");
    return { kind: "leave", view, ms };
  }
  if (body.kind !== "view") throw new InvalidEvent("kind");

  return {
    kind: "view",
    view,
    path: text(body, "path", 500, /^\//),
    title: clippedText(body, "title", 300),
    referrer: clippedText(body, "referrer", 500),
    screen: text(body, "screen", 11, /^\d{1,5}x\d{1,5}$/),
    language: clippedText(body, "language", 35),
    utmSource: clippedText(body, "utmSource", 100),
    utmMedium: clippedText(body, "utmMedium", 100),
    utmCampaign: clippedText(body, "utmCampaign", 100),
  };
}

function header(request: Request, name: string): string {
  return request.headers.get(name) ?? "";
}

async function runCommand(command: string[]): Promise<unknown> {
  const response = await fetch(requireEnv("METRICS_REDIS_REST_URL"), {
    method: "POST",
    headers: { Authorization: `Bearer ${requireEnv("METRICS_REDIS_REST_TOKEN")}` },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error(`Metrics ${command[0]} failed: ${response.status} ${await response.text()}`);
  const body: unknown = await response.json();
  if (typeof body !== "object" || body === null || !("result" in body)) throw new Error(`Metrics ${command[0]} returned no result`);
  return body.result;
}

let cachedSalt: { day: string; salt: string } | undefined;

async function dailySalt(day: string): Promise<string> {
  if (cachedSalt?.day === day) return cachedSalt.salt;
  const candidate = randomBytes(32).toString("hex");
  const existing = await runCommand(["SET", `visitor-salt:${day}`, candidate, "NX", "GET", "EX", String(SALT_LIFETIME_S)]);
  if (existing !== null && typeof existing !== "string") throw new Error("Metrics salt is not a string");
  cachedSalt = { day, salt: existing ?? candidate };
  return cachedSalt.salt;
}

async function visitorHash(request: Request, userAgent: string): Promise<string> {
  const ip = header(request, "x-forwarded-for").replace(/,.*$/, "").trim();
  const salt = await dailySalt(new Date().toISOString().slice(0, 10));
  return createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex").slice(0, 16);
}

async function streamFields(event: VisitEvent, request: Request, userAgent: string): Promise<string[]> {
  const project = requireEnv("METRICS_PROJECT");
  if (event.kind === "leave") {
    return ["kind", "leave", "project", project, "view", event.view, "ms", String(event.ms)];
  }
  return [
    "kind", "view",
    "project", project,
    "view", event.view,
    "path", event.path,
    "title", event.title,
    "referrer", event.referrer,
    "screen", event.screen,
    "language", event.language,
    "utmSource", event.utmSource,
    "utmMedium", event.utmMedium,
    "utmCampaign", event.utmCampaign,
    "country", header(request, "x-vercel-ip-country"),
    "region", header(request, "x-vercel-ip-country-region"),
    "city", decodeURIComponent(header(request, "x-vercel-ip-city")),
    "asn", header(request, "x-vercel-ip-as-number"),
    "userAgent", userAgent,
    "visitor", await visitorHash(request, userAgent),
  ];
}

async function appendToStream(fields: string[]): Promise<void> {
  const oldestKept = String(Date.now() - RETENTION_MS);
  await runCommand(["XADD", STREAM_KEY, "MINID", "~", oldestKept, "*", ...fields]);
}

export async function POST(request: Request): Promise<Response> {
  const userAgent = header(request, "user-agent");
  if (BOT_PATTERN.test(userAgent)) return new Response(null, { status: 204 });

  let event: VisitEvent;
  try {
    event = parseEvent(await request.json());
  } catch (error) {
    if (error instanceof InvalidEvent || error instanceof SyntaxError) {
      return new Response(`Invalid visit event: ${error.message}`, { status: 400 });
    }
    throw error;
  }

  await appendToStream(await streamFields(event, request, userAgent));
  return new Response(null, { status: 204 });
}
