"use client";

import { Sidebar } from "@/components/Layouts/sidebar";
import { Header } from "@/components/Layouts/header";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

export function ConditionalLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isAuthPage = 
    pathname?.includes("/auth") || 
    pathname === "/signin" || 
    pathname === "/signup" || 
    pathname === "/forgot-password" ||
    pathname === "/contact";

  return (
    <div className="flex min-h-screen">
      {!isAuthPage && <Sidebar />}

      <div className={`w-full bg-gray-2 dark:bg-[#020d1a]`}>
        {!isAuthPage && <Header />}

        <main className={`isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10 ${isAuthPage ? 'pt-0' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}