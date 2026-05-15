import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hermes-soul-studio.vercel.app";
const TITLE = "Hermes Soul Studio — Build the OS for your AI operator";
const DESCRIPTION =
  "A local-first generator that turns any AI assistant into a structured operator with workspaces, skills, approval gates, external handoffs, and local backups. No login. No cloud.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "AI operator",
    "SOUL.md",
    "AI agent setup",
    "Claude",
    "Codex",
    "Cursor",
    "ChatGPT custom instructions",
    "local-first",
    "agent skill map",
  ],
  authors: [{ name: "Krishna Gaurav" }],
  creator: "Krishna Gaurav",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Hermes Soul Studio",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Hermes Soul Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.svg"],
    creator: "@krigrv",
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
  themeColor: "#090909",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
