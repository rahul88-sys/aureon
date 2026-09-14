import {
  Bot,
  Cloud,
  Code2,
  Globe,
  Layout,
  MonitorSmartphone,
  Server,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type ServiceGroup = "Product" | "Platform" | "AI" | "Care";

export const serviceMeta: Record<
  string,
  {
    icon: LucideIcon;
    group: ServiceGroup;
    timeline: string;
    accent: "ice" | "gold";
  }
> = {
  "web-development": {
    icon: Globe,
    group: "Product",
    timeline: "2–6 weeks",
    accent: "ice",
  },
  "custom-software": {
    icon: Code2,
    group: "Platform",
    timeline: "6–14 weeks",
    accent: "gold",
  },
  "react-next": {
    icon: Layout,
    group: "Product",
    timeline: "3–10 weeks",
    accent: "ice",
  },
  dotnet: {
    icon: Server,
    group: "Platform",
    timeline: "4–12 weeks",
    accent: "gold",
  },
  mobile: {
    icon: MonitorSmartphone,
    group: "Product",
    timeline: "8–16 weeks",
    accent: "ice",
  },
  "ui-ux": {
    icon: Sparkles,
    group: "Product",
    timeline: "2–6 weeks",
    accent: "gold",
  },
  cloud: {
    icon: Cloud,
    group: "Platform",
    timeline: "Ongoing",
    accent: "ice",
  },
  maintenance: {
    icon: Wrench,
    group: "Care",
    timeline: "Retainer",
    accent: "gold",
  },
  "ai-chatbots": {
    icon: Bot,
    group: "AI",
    timeline: "3–8 weeks",
    accent: "ice",
  },
};
