import type { ContactTopic } from "@/types/contact";
import type { ContactDetails } from "@/types/content";

/** "What do you need?" options on the contact form. `?topic=<key>` preselects one. */
export const contactTopics: ReadonlyArray<{ key: ContactTopic; label: string }> = [
  { key: "new-project", label: "Build something new" },
  { key: "improve-existing", label: "Improve or modernise an existing system" },
  { key: "consultation", label: "Book a consultation" },
  { key: "support", label: "Ongoing support or maintenance" },
  { key: "other", label: "Something else" },
];

export function getTopicLabel(key: ContactTopic): string {
  return contactTopics.find((topic) => topic.key === key)?.label ?? key;
}

/**
 * Public contact details. Source: CURRENT_WEBSITE_AUDIT.md §3.7.
 *
 * Internal addresses from the legacy code (the SMTP sender mailbox and the
 * second Gmail recipient) are deliberately NOT stored here — delivery targets
 * are configured through CONTACT_EMAIL_TO / CONTACT_EMAIL_FROM.
 */
export const contactDetails: ContactDetails = {
  address: {
    lines: ["35 Lima St", "Sharonlea, Randburg, 2158", "South Africa"],
    streetAddress: "35 Lima St",
    suburb: "Sharonlea",
    locality: "Randburg",
    postalCode: "2158",
    countryName: "South Africa",
    countryCode: "ZA",
  },
  phone: {
    display: "+27 73 794 2244",
    e164: "+27737942244",
  },
  emails: [
    {
      // Capitalisation as published on the legacy site.
      address: "Proficient@proficientsoftwaresolutions.co.za",
      purpose: "general",
      label: "General enquiries",
    },
    {
      address: "sales@proficientsoftwaresolutions.co.za",
      purpose: "sales",
      label: "Sales",
    },
  ],
  // The next three appeared only on the uncommitted legacy Home page — confirm before use.
  businessHours: "Mon-Fri, 8AM-5PM",
  responseTimePromise: "Response within 24 hours",
  consultationOffer: "Free 30-minute consultation",
  mapQuery: "35 Lima St, Sharonlea, Randburg, 2158",
};

export function getEmail(purpose: "general" | "sales"): string {
  const match = contactDetails.emails.find((email) => email.purpose === purpose);
  if (!match) throw new Error(`No ${purpose} email configured in contactDetails.`);
  return match.address;
}
