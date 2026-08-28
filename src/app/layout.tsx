import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/config";

import "./globals.css";

// `--font-sans` es el nombre que consume el tema en globals.css.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full font-sans antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
