"use server";

export type ContactActionState = {
  ok: boolean;
  error?: string;
};

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function submitContact(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const name = asString(formData.get("name"));
  const email = asString(formData.get("email"));
  const message = asString(formData.get("message"));
  const company = asString(formData.get("company"));
  const service = asString(formData.get("service"));

  if (name.length < 2) {
    return { ok: false, error: "Please add your name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please add a valid email." };
  }
  if (message.length < 12) {
    return { ok: false, error: "Tell us a little more about the project." };
  }

  console.info("[aureon enquiry:action]", {
    name,
    email,
    company,
    service,
    message,
  });

  return { ok: true };
}
