import HomePage from "@/components/HomePage";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Moving Quote New York | Trusted NYC & Statewide Movers",
  description:
    "Compare reliable New York moving companies in minutes. Get custom quotes for NYC apartment moves, statewide relocations, long-distance moves, packing services, storage, and auto transport with transparent pricing.",
  alternates: {
    canonical: "https://movingquotenewyork.com/",
  },
  openGraph: {
    title: "Moving Quote New York | Trusted NYC & Statewide Movers",
    description:
      "Find verified New York movers for apartment, home, and long-distance moves. Fast quotes, professional crews, packing help, storage solutions, and on-time delivery across NY.",
    url: "https://movingquotenewyork.com/",
    siteName: "Moving Quote New York",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moving Quote New York",
    description:
      "Get instant moving quotes from trusted New York movers. NYC apartments, statewide relocations, long-distance moves, packing, storage, and vehicle transport made easy.",
  },
};


export default function Page() {
  return <HomePage />;
}
