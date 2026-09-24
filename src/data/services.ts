import type { ServiceGroup, ServiceIcon } from "@/types/content";

/**
 * Services (rewritten 2026-09-23). Service list and grouping follow the PSS
 * brief. "What we deliver" items are limited to capabilities evidenced by
 * delivered work in the portfolio (see docs/CONTENT_MIGRATION.md → Services),
 * e.g. cross-platform + native Android apps, offline sync, payments (Paystack),
 * Twilio/Trello/Zendesk/Monday.com integrations, real-time updates (SignalR),
 * role-based portals, audit logs, app-store releases.
 */
export const serviceGroups: ServiceGroup[] = [
  {
    id: "build",
    label: "Build",
    title: "Products and platforms, built end to end.",
    intro: "From a focused first version to a complete platform across web, mobile and backend.",
    services: [
      {
        id: "custom-software",
        slug: "custom-software",
        name: "Custom Software Development",
        icon: "code",
        summary:
          "Software designed around how your organisation actually works — not a generic product you have to work around.",
        usefulFor: "Businesses whose processes, customers or data don't fit off-the-shelf tools.",
        deliverables: [
          "Discovery and requirements",
          "Solution architecture",
          "Web, mobile and backend development",
          "Testing, deployment and handover",
        ],
      },
      {
        id: "web-platforms",
        slug: "web-platforms",
        name: "Web Applications & Platforms",
        icon: "web",
        summary:
          "Customer portals, marketplaces, subscription services and other web platforms that run core parts of a business.",
        usefulFor: "Organisations that serve customers, partners or members online.",
        deliverables: [
          "Customer and partner portals",
          "Marketplaces and multi-sided platforms",
          "Payments and subscriptions",
          "Role-based dashboards",
          "Progressive web apps",
        ],
      },
      {
        id: "mobile-apps",
        slug: "mobile-apps",
        name: "Mobile Application Development",
        icon: "mobile",
        summary: "Android and iOS apps connected to the systems behind them — cross-platform or native, depending on the product.",
        usefulFor: "Products whose customers or staff work mainly on phones, tablets or dedicated devices.",
        deliverables: [
          "Cross-platform apps for Android and iOS",
          "Native Android apps, including POS devices",
          "Offline-first apps that sync to the cloud",
          "Notifications, deep links and in-app payments",
          "Publishing to the app stores",
        ],
      },
      {
        id: "business-systems",
        slug: "business-systems",
        name: "Business Systems & Admin Portals",
        icon: "systems",
        summary:
          "Internal systems that give your team control over operations — orders, approvals, customers, content and reporting in one place.",
        usefulFor: "Teams running on spreadsheets, email threads and disconnected tools.",
        deliverables: [
          "Admin and back-office portals",
          "Approval and case-management workflows",
          "Role-based access and audit logs",
          "Operational dashboards and reporting",
        ],
      },
      {
        id: "mvp",
        slug: "mvp",
        name: "MVP & Product Development",
        icon: "rocket",
        summary: "Turning a new product idea into a focused first version, then growing it with real user feedback.",
        usefulFor: "Founders and organisations launching a new digital product.",
        deliverables: ["Scoping the first release", "Product and UX design", "Build and launch", "Iteration after launch"],
      },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    title: "Systems that work together.",
    intro: "The backends, APIs and integrations that let your products, data and partners work as one.",
    services: [
      {
        id: "backend-apis",
        slug: "backend-apis",
        name: "Backend & API Development",
        icon: "server",
        summary:
          "The server-side foundations — APIs, databases, business logic and real-time services — that web and mobile products depend on.",
        usefulFor: "Products that need reliable data, security and room to grow across several apps.",
        deliverables: [
          "APIs for web and mobile apps",
          "Database design",
          "Authentication and role-based security",
          "Real-time updates",
          "Background jobs and notifications",
        ],
      },
      {
        id: "integrations",
        slug: "integrations",
        name: "API & Third-Party Integrations",
        icon: "plug",
        summary:
          "Connecting your software to payment providers, communication tools, workflow platforms and the systems you already use.",
        usefulFor: "Businesses whose data and processes are spread across several services.",
        deliverables: [
          "Payment gateway integration",
          "SMS, voice and email",
          "Workflow and support tools",
          "Syncing data between systems",
        ],
      },
    ],
  },
  {
    id: "improve",
    label: "Improve",
    title: "Better software you already own.",
    intro: "Extend, modernise and support the systems your business runs on today.",
    services: [
      {
        id: "existing-software",
        slug: "existing-software",
        name: "Existing Software Improvements",
        icon: "wrench",
        summary: "Adding features, fixing problems and improving performance in software you already rely on.",
        usefulFor: "Organisations with a working system that no longer keeps up.",
        deliverables: [
          "Code and architecture review",
          "New features and integrations",
          "Performance and security fixes",
          "Usability improvements",
        ],
      },
      {
        id: "legacy-modernisation",
        slug: "legacy-modernisation",
        name: "Legacy System Modernisation",
        icon: "refresh",
        summary: "Moving ageing systems onto modern, maintainable technology in planned stages.",
        usefulFor: "Teams held back by outdated technology or unsupported platforms.",
        deliverables: [
          "Assessment and migration plan",
          "Incremental rebuilds",
          "Data migration",
          "New web and mobile front-ends for existing systems",
        ],
      },
      {
        id: "maintenance",
        slug: "maintenance",
        name: "Software Maintenance & Support",
        icon: "support",
        summary: "Keeping systems secure, up to date and running — and improving them as needs change.",
        usefulFor: "Any organisation whose day-to-day operations depend on its software.",
        deliverables: [
          "Fixes and troubleshooting",
          "Updates and security patches",
          "Hosting and deployment support",
          "Ongoing improvements",
        ],
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    title: "Clarity before code.",
    intro: "Products shaped around the people who will use them.",
    services: [
      {
        id: "product-design",
        slug: "product-design",
        name: "UI/UX & Product Design",
        icon: "design",
        summary: "User flows, interfaces and prototypes shaped around real users before development starts.",
        usefulFor: "New products, redesigns, and systems your users find hard to use.",
        deliverables: [
          "User flows and wireframes",
          "Interface design in Figma",
          "Interactive prototypes",
          "Consistent design across web and mobile",
        ],
      },
    ],
  },
];

export const allServices = serviceGroups.flatMap((group) => group.services);

/** Home "What We Build" capabilities — each links to its section on /services. */
export const homeCapabilities: Array<{ name: string; line: string; icon: ServiceIcon; anchor: string }> = [
  { name: "Custom Software Development", line: "Software shaped around how your business actually works.", icon: "code", anchor: "custom-software" },
  { name: "Web Platforms", line: "Portals, marketplaces and web applications that run core operations.", icon: "web", anchor: "web-platforms" },
  { name: "Mobile Applications", line: "Android and iOS apps connected to the systems behind them.", icon: "mobile", anchor: "mobile-apps" },
  { name: "Business Systems & Admin Portals", line: "Control over orders, approvals, customers and reporting.", icon: "systems", anchor: "business-systems" },
  { name: "APIs & Integrations", line: "Payments, messaging and the tools you already use, connected.", icon: "plug", anchor: "integrations" },
  { name: "UI/UX & Product Design", line: "Clear, usable products designed around real users.", icon: "design", anchor: "product-design" },
  { name: "Improvements & Legacy Modernisation", line: "Extending and modernising the systems you rely on today.", icon: "refresh", anchor: "legacy-modernisation" },
];

/** Legacy service copy (verbatim, audit §3.4) — reference only, not rendered. */
export const legacyServices = [
  { name: "Application Design", alternateNames: ["UI/UX Design", "Design"] },
  { name: "Software Development", alternateNames: ["Custom Development"] },
  { name: "Data Engineering", alternateNames: ["Data Analytics"] },
  { name: "IT Support", alternateNames: [] },
] as const;
