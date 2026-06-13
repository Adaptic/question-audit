import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "clinical.dev — Question Audit",
  description:
    "Question Audit by clinical.dev. Find the flaw before protocol lock — an evidence-backed audit of a clinical trial's research question that exposes hidden assumptions, quantifies the failure mode, and produces a revised design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
