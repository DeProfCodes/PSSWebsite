/**
 * Client logos shown on Home ("Trusted by businesses we've built with").
 *
 * Only real files from public/images/clients/, used unmodified. The selection
 * favours clients whose work is on the site and logos that read well on a light
 * background at small sizes: transparent, sharp, no baked-in dark box.
 * `width`/`height` are the files' intrinsic sizes (used to balance visual weight).
 * Add `websiteUrl` only for a confirmed client website.
 */
export interface ClientLogo {
  name: string;
  src: string;
  width: number;
  height: number;
  websiteUrl?: string;
}

export const clientLogos: ClientLogo[] = [
  { name: "ZansiHustle", src: "/images/clients/zansihustle.png", width: 5301, height: 3481 },
  { name: "SmartFuture", src: "/images/clients/smartfuture.png", width: 320, height: 103 },
  { name: "CP Moloto Advisory", src: "/images/clients/cpma-client.svg", width: 743, height: 207 },
  { name: "Corporate Voice", src: "/images/clients/cla.webp", width: 1920, height: 547 },
  { name: "MetaPOS", src: "/images/clients/MetaPOS-client.svg", width: 866, height: 154 },
  { name: "Kwikem", src: "/images/clients/kwikem.png", width: 692, height: 146 },
  { name: "P&E Finance", src: "/images/clients/pnefinance-client.png", width: 345, height: 145 },
  { name: "Namibian Farmers Online", src: "/images/clients/client-namibia.png", width: 1567, height: 1051 },
];
