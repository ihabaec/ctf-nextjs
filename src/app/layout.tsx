
import "@/css/satoshi.css";
import "@/css/style.css";
import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import { ConditionalLayout } from "@/components/Layouts/conditional-layout";
import { AuthProvider } from "@/components/Auth/auth-provider";

export const metadata: Metadata = {
  title: {
    template: "%s |lmao",
    default: "hELLO fRIEND",
  },
  description:
    "TEST TEST",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthProvider>
            <NextTopLoader color="#5750F1" showSpinner={false} />
            <ConditionalLayout>{children}</ConditionalLayout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}