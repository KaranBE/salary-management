import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ACME Salary Management",
  description: "Advanced compensation analytics and management console for ACME Org.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
