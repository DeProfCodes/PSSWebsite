"use client";

import { CheckCircle2, ChevronDown, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useId, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { contactTopics } from "@/data/contact";
import { trackEvent } from "@/lib/analytics";
import { CONTACT_TOPICS, HONEYPOT_FIELD, validateContactSubmission } from "@/lib/contact/validation";
import { cn } from "@/lib/utils";
import type { ContactField, ContactFieldErrors, ContactResponse, ContactTopic } from "@/types/contact";

type Status = "idle" | "submitting" | "success";

const FIELD_ORDER: ContactField[] = ["name", "company", "email", "phone", "topic", "message"];

const inputClass =
  "block w-full rounded-base border border-foreground/15 bg-white px-4 text-base text-foreground shadow-[0_1px_0_0_rgb(3_10_22/0.03)] transition-[border-color,box-shadow] placeholder:text-foreground/35 focus:border-accent focus:shadow-[0_0_0_4px_rgb(11_114_199/0.12)] focus:outline-none aria-[invalid=true]:border-danger";

function isTopic(value: string | null): value is ContactTopic {
  return value !== null && (CONTACT_TOPICS as readonly string[]).includes(value);
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: (describedBy: string | undefined) => React.ReactNode;
}

function Field({ id, label, optional, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between text-sm font-semibold text-foreground">
        {label}
        {optional ? <span className="text-xs font-normal text-muted-foreground">Optional</span> : null}
      </label>
      {children(error ? errorId : undefined)}
      {error ? (
        <p id={errorId} className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Enquiry form → POST /api/contact. Same validation rules as the server
 * (src/lib/contact/validation.ts); the server's answer is shown as-is —
 * success only when the email provider accepted the message.
 */
export function ContactForm({ initialTopic }: { initialTopic?: string | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const successRef = useRef<HTMLHeadingElement>(null);
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;

  const defaultTopic = isTopic(initialTopic ?? null) ? initialTopic : "";

  function focusFirstError(fieldErrors: ContactFieldErrors) {
    const first = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (first) document.getElementById(id(first))?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const validation = validateContactSubmission(data);
    if (!validation.success) {
      setErrors(validation.fieldErrors);
      setFormError(null);
      focusFirstError(validation.fieldErrors);
      return;
    }

    setErrors({});
    setFormError(null);
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.data, [HONEYPOT_FIELD]: data[HONEYPOT_FIELD] ?? "" }),
      });
      const result = (await response.json()) as ContactResponse;

      if (result.ok) {
        trackEvent("contact_submit", { form_id: "contact_page" });
        if (validation.data.topic === "consultation") trackEvent("book_consultation", { cta_location: "contact_form" });
        setSuccessMessage(result.message);
        setStatus("success");
        requestAnimationFrame(() => successRef.current?.focus());
        return;
      }

      setStatus("idle");
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
        focusFirstError(result.fieldErrors);
      }
      setFormError(result.message);
    } catch {
      setStatus("idle");
      setFormError("We couldn't send your message. Please check your connection and try again, or email us directly.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start" role="status">
        <CheckCircle2 aria-hidden="true" className="size-10 text-success" strokeWidth={1.75} />
        <h2 ref={successRef} tabIndex={-1} className="mt-5 text-2xl font-extrabold tracking-tight text-foreground focus:outline-none">
          Thank you — your message has been sent.
        </h2>
        <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{successMessage}</p>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => {
            setStatus("idle");
            setSuccessMessage("");
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate aria-describedby={formError ? id("form-error") : undefined}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={id("name")} label="Name" error={errors.name}>
          {(describedBy) => (
            <input
              id={id("name")}
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describedBy}
              className={cn(inputClass, "h-12")}
            />
          )}
        </Field>
        <Field id={id("company")} label="Company" optional error={errors.company}>
          {(describedBy) => (
            <input
              id={id("company")}
              name="company"
              type="text"
              autoComplete="organization"
              aria-invalid={Boolean(errors.company)}
              aria-describedby={describedBy}
              className={cn(inputClass, "h-12")}
            />
          )}
        </Field>
        <Field id={id("email")} label="Email" error={errors.email}>
          {(describedBy) => (
            <input
              id={id("email")}
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
              className={cn(inputClass, "h-12")}
            />
          )}
        </Field>
        <Field id={id("phone")} label="Phone" optional error={errors.phone}>
          {(describedBy) => (
            <input
              id={id("phone")}
              name="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy}
              className={cn(inputClass, "h-12")}
            />
          )}
        </Field>
      </div>

      <div className="mt-6">
        <Field id={id("topic")} label="What do you need?" error={errors.topic}>
          {(describedBy) => (
            <div className="relative">
              <select
                id={id("topic")}
                name="topic"
                required
                defaultValue={defaultTopic ?? ""}
                aria-invalid={Boolean(errors.topic)}
                aria-describedby={describedBy}
                className={cn(inputClass, "h-12 appearance-none pr-11")}
              >
                <option value="" disabled>
                  Choose one…
                </option>
                {contactTopics.map((topic) => (
                  <option key={topic.key} value={topic.key}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}
        </Field>
      </div>

      <div className="mt-6">
        <Field id={id("message")} label="Project details" error={errors.message}>
          {(describedBy) => (
            <textarea
              id={id("message")}
              name="message"
              rows={6}
              required
              placeholder="What are you building or improving? Share as much or as little as you like."
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy}
              className={cn(inputClass, "resize-y py-3 leading-relaxed")}
            />
          )}
        </Field>
      </div>

      {/* Honeypot: hidden from people and assistive technology; bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id(HONEYPOT_FIELD)}>Leave this field empty</label>
        <input id={id(HONEYPOT_FIELD)} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formError ? (
        <p id={id("form-error")} role="alert" className="mt-6 rounded-base border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
          {formError}
        </p>
      ) : null}

      <div className="mt-8">
        <Button type="submit" size="xl" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Loader2 aria-hidden="true" className="size-[18px] motion-safe:animate-spin" />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </Button>
      </div>
    </form>
  );
}

/** Reads ?topic= from the URL (inside <Suspense>, so the page stays static). */
export function ContactFormWithTopic() {
  const searchParams = useSearchParams();
  return <ContactForm initialTopic={searchParams.get("topic")} />;
}
