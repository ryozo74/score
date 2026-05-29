import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import messagesJa from "../messages/ja.json";
import messagesEn from "../messages/en.json";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Score",
  description: "Score — production management platform",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messagesByLocale: Record<string, Record<string, any>> = {
  ja: messagesJa,
  en: messagesEn,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const localeHeader = headersList.get("x-next-intl-locale");
  const locale = (localeHeader && messagesByLocale[localeHeader]) ? localeHeader : "ja";
  const messages = messagesByLocale[locale];

  return (
    <html lang={locale}>
      <head />
      <body className="font-sans antialiased min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
