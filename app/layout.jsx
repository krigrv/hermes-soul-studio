import "./globals.css";

export const metadata = {
  title: "Hermes Soul Studio",
  description: "Build the operating system for your AI operator.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
