import type { Client } from "@/types/content";

/**
 * Clients. Source: CURRENT_WEBSITE_AUDIT.md §5.1 and §6.6.
 *
 * Order = the legacy Home "Our Top Clients" logo wall order (§8.7), followed by
 * clients that appear only in project data or have unused logo files.
 * Logos shown on the site are listed in src/data/client-logos.ts (real files in
 * public/images/clients/, used unmodified).
 */
export const clients: Client[] = [
  // --- Legacy logo wall (16) ---------------------------------------------------
  { id: "ovulae", name: "Ovulae", showInLogoWall: true },
  { id: "afx-trust", name: "AFX Trust", showInLogoWall: true },
  {
    id: "catalyst-fx-dynamics",
    name: "Catalyst FX Dynamics",
   
    showInLogoWall: true,
  },
  {
    id: "corporate-voice",
    name: "Corporate Voice",
   
    showInLogoWall: true,
  },
  { id: "kwikem", name: "Kwikem", showInLogoWall: true },
  {
    id: "taps-technologies",
    name: "TAPS Technologies",
   
    showInLogoWall: true,
    reviewNotes: ["Logo is a non-transparent JPEG; request a vector/transparent version."],
  },
  {
    id: "cp-moloto-advisory",
    name: "CP Moloto Advisory",
    aliases: ["CPMA"],
   
    showInLogoWall: true,
  },
  {
    id: "metapos",
    name: "MetaPOS",
   
    showInLogoWall: true,
    reviewNotes: [
      "The logo wall shows MetaPOS, but the MetaPOS project's client in legacy code is Anglojungle. Confirm the relationship and which name/logo to display.",
    ],
  },
  {
    id: "top-1-percent-community",
    name: "Top 1% Community",
   
    showInLogoWall: true,
    reviewNotes: ["Legacy logo is low resolution (149×63)."],
  },
  {
    id: "gcwensa",
    name: "Gcwensa",
   
    showInLogoWall: true,
    reviewNotes: ["Legacy logo is low resolution (82×100)."],
  },
  {
    id: "wealth-creators-group",
    name: "Wealth Creators Group",
    aliases: ["WCG"],
   
    showInLogoWall: true,
  },
  {
    id: "de-bet-masterz",
    name: "De Bet Masterz",
   
    showInLogoWall: true,
  },
  {
    id: "pne-finance",
    name: "P&E Finance",
    aliases: ["PNE Finance", "P & E Finance"],
   
    showInLogoWall: true,
    reviewNotes: ['Legacy content uses both "PNE Finance" and "P&E Finance" — confirm the official name.'],
  },
  {
    id: "creative-computer-repairs",
    name: "Creative Computer Repairs",
   
    showInLogoWall: true,
    reviewNotes: ["Legacy logo is low resolution (347×44)."],
  },
  {
    id: "ritshuri-tech",
    name: "Ritshuri Tech",
   
    showInLogoWall: true,
    reviewNotes: ["Legacy logo is low resolution (213×102)."],
  },
  {
    id: "namibian-farmers-online",
    name: "Namibian Farmers Online",
   
    showInLogoWall: true,
  },

  // --- Clients named in the 2026-09-23 brief (logos rendered via src/data/client-logos.ts) ----
  { id: "zansihustle", name: "ZansiHustle", showInLogoWall: false },
  { id: "smartfuture", name: "SmartFuture", showInLogoWall: false },
  { id: "dailyrise", name: "DailyRise", showInLogoWall: false },
  { id: "hypegrid", name: "HypeGrid", showInLogoWall: false },
  { id: "altocoins", name: "AltoCoins", showInLogoWall: false },

  // --- Clients referenced by projects, not in the logo wall --------------------
  {
    id: "streama-solutions",
    name: "Streama Solutions",
    showInLogoWall: false,
    reviewNotes: [
      'An unused "iWatchAll" logo exists (images/clients/Logo Transparent.png); iWatchAllTV is the product. Confirm whether to show it.',
    ],
  },
  {
    id: "hlumisimfundo-foundation",
    name: "Hlumis'imfundo Foundation",
    aliases: ["Hlumi's Imfundo NPC"],
    showInLogoWall: false,
    reviewNotes: [
      "Legacy spellings vary: Hlumis'imfundo Foundation, Hlumi's Imfundo NPC, Hlumis'imfudo, Hlumus'Imfundo (domain: hlumisimfundo.co.za). Confirm the official name.",
    ],
  },
  { id: "anglojungle", name: "Anglojungle", showInLogoWall: false },
  {
    id: "ab-tech-mentorship",
    name: "AB Tech Mentorship",
   
    showInLogoWall: false,
    reviewNotes: ["Logo file existed but was not displayed on the legacy site."],
  },
  {
    id: "woplhost",
    name: "Woplhost",
   
    showInLogoWall: false,
    reviewNotes: ["Logo file existed but was not displayed; no project is recorded for this client."],
  },
];

export function getClientById(id: string | undefined): Client | undefined {
  return id ? clients.find((client) => client.id === id) : undefined;
}

