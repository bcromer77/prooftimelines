import type { ReactNode } from "react";
import AppNav from "@/components/nav/AppNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppNav />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
}

