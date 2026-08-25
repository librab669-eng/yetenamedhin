import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/lang-context";
import { ToastProvider } from "@/lib/ToastProvider";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

export const metadata: Metadata = {
  title: "Yetena Medhin - Expense & Patient Management",
  description: "Hospital expense and patient management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <KeyboardShortcuts />
        <ToastProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ToastProvider>
      </body>
    </html>
  );
}