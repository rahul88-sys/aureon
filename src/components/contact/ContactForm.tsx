"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  submitContact,
  type ContactActionState,
} from "@/app/actions/contact";
import { useTheme } from "@/components/theme/ThemeToggle";
import { services } from "@/lib/site";
import { cn } from "@/lib/utils";

const initial: ContactActionState = { ok: false };

export function ContactForm() {
  const theme = useTheme();
  const modern = theme === "modern";
  const [state, action, pending] = useActionState(submitContact, initial);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (state.ok) setDone(true);
  }, [state]);

  if (done) {
    return (
      <div className="theme-panel border border-line bg-surface p-8 sm:p-10">
        <p className="ui-label text-ice">{modern ? "Sent" : "OK"}</p>
        <h3 className="display mt-4 text-2xl text-cream">
          Received. We will be in touch.
        </h3>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          A note is with the studio now. If the brief is a fit, you will hear
          from us within two working days.
        </p>
        {modern ? (
          <p className="mt-4 text-[12px] text-muted">
            Delivered via Next.js Server Action
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required autoComplete="name" modern={modern} />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          modern={modern}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Company"
          name="company"
          autoComplete="organization"
          modern={modern}
        />
        <label className="block">
          <span className="ui-label mb-2 block text-muted">Interest</span>
          <select
            name="service"
            defaultValue=""
            className={cn(
              "theme-control w-full appearance-none border border-line bg-ink-soft px-4 py-3 text-[13px] text-cream outline-none transition-colors focus:border-ice",
              modern ? "font-sans" : "font-mono",
            )}
          >
            <option value="" disabled>
              Select a service
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </label>
      </div>
      <label className="block">
        <span className="ui-label mb-2 block text-muted">Project</span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="What are you trying to build, and by when?"
          className={cn(
            "theme-control w-full resize-y border border-line bg-ink-soft px-4 py-3 text-[13px] text-cream outline-none transition-colors placeholder:text-muted/70 focus:border-ice",
            modern ? "font-sans leading-6" : "font-mono",
          )}
        />
      </label>
      {state.error ? <p className="text-sm text-red-300">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className={cn(
          "theme-control inline-flex items-center gap-2 border border-ice bg-transparent px-5 py-2.5 ui-label text-ice transition-colors hover:bg-ice hover:text-ink disabled:opacity-60",
        )}
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Sending
          </>
        ) : modern ? (
          "Send message"
        ) : (
          "Send_enquiry"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  modern,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  modern: boolean;
}) {
  return (
    <label className="block">
      <span className="ui-label mb-2 block text-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={cn(
          "w-full text-[14px] text-cream outline-none transition-colors focus:border-ice",
          modern
            ? "theme-control border border-line bg-ink-soft px-4 py-3"
            : "border-0 border-b border-line bg-transparent px-0 py-3",
        )}
      />
    </label>
  );
}
