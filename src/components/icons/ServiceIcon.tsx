import {
  AppWindow,
  Building2,
  Code2,
  LifeBuoy,
  Network,
  PenTool,
  RefreshCw,
  Rocket,
  Server,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { ServiceIcon as ServiceIconKey } from "@/types/content";

const icons: Record<ServiceIconKey, LucideIcon> = {
  code: Code2,
  web: AppWindow,
  mobile: Smartphone,
  systems: Building2,
  rocket: Rocket,
  server: Server,
  plug: Network,
  design: PenTool,
  wrench: Wrench,
  refresh: RefreshCw,
  support: LifeBuoy,
};

export function ServiceIcon({ icon, className }: { icon: ServiceIconKey; className?: string }) {
  const Icon = icons[icon];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.75} />;
}
