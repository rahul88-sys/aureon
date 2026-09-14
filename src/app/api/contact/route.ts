import { NextResponse } from "next/server";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const name = asString(data.name);
  const email = asString(data.email);
  const message = asString(data.message);
  const company = asString(data.company);
  const service = asString(data.service);

  if (name.length < 2) {
    return NextResponse.json({ ok: false, error: "Please add your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Please add a valid email." }, { status: 400 });
  }
  if (message.length < 12) {
    return NextResponse.json(
      { ok: false, error: "Tell us a little more about the project." },
      { status: 400 },
    );
  }

  // Connect Resend, Nodemailer, or a CRM here.
  // The payload is validated and ready to forward.
  console.info("[aureon enquiry]", { name, email, company, service, message });

  return NextResponse.json({ ok: true });
}
