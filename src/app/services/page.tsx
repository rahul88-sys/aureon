import type { Metadata } from "next";
import { ServicesExperience } from "@/components/services/ServicesExperience";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, custom software, React, Next.js, .NET, mobile, UI/UX, cloud, AI chatbots and maintenance — from Aureon.",
};

export default function ServicesPage() {
  return <ServicesExperience />;
}
