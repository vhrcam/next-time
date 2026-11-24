import type { Metadata, Viewport } from "next";
import { Inter, Libre_Baskerville } from "next/font/google";
import Shell from "./shell";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const baskerville = Libre_Baskerville({ variable: "--font-baskerville", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "next time",
  description: "Stay informed without staying online. A short briefing of the real developments in what you follow, with no feed.",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${baskerville.variable} antialiased`}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
