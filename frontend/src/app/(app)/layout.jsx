"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { LoaderCircle } from "lucide-react";

import Sidebar from "@/components/app/Sidebar";
import Topbar from "@/components/app/Topbar";

export default function AppLayout({ children }) {
  const router = useRouter();
  const status = useSelector((state) => state.auth.status);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "checking" || status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-base-100">
        <LoaderCircle size={28} className="animate-spin" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}