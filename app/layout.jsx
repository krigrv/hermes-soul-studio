import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hermes-soul-studio.vercel.app";
const TITLE = "Hermes Soul Studio — Build the OS for your AI operator";
const DESCRIPTION =
  "Hermes Soul Studio is a local-first AI operator setup generator. Define the soul, workspace brains, repeatable skills, tool handoffs, approval gates, exports, and local backups for your own AI operator. No login. No cloud.";

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
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
