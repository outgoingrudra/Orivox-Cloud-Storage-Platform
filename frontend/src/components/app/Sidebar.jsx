"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { useDashboard } from "@/features/dashboard/useDashboard";
import {
  Gauge,
  Files,
  Share2,
  Trash2,
  HardDrive,
  Cloud
} from "lucide-react";


import { AnimatePresence, motion } from "framer-motion";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    label: "My Files",
    href: "/files",
    icon: Files,
  },
  {
    label: "Shared",
    href: "/shared",
    icon: Share2,
  },
  {
    label: "Trash",
    href: "/trash",
    icon: Trash2,
  },
  {
    label: "Upgrade Storage",
    href: "/upgrade",
    icon: HardDrive,
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  const user = useSelector((state) => state.auth.user);

  return (
    <>
      {/* ==================================================
          DESKTOP SIDEBAR
      ================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          z-40
          hidden
          w-72
          border-r
          border-base-300
          bg-base-100
          lg:flex
          lg:flex-col
        "
      >
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {/* ==================================================
          MOBILE BACKDROP + DRAWER
      ================================================== */}

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="
                fixed
                inset-0
                z-40
                bg-black/40
                backdrop-blur-sm
                lg:hidden
              "
            />

            <motion.aside
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
              className="
                fixed
                inset-y-0
                left-0
                z-50
                flex
                w-[86%]
                max-w-72
                flex-col
                border-r
                border-base-300
                bg-base-100
                shadow-2xl
                lg:hidden
              "
            >
              <button
                type="button"
                onClick={onClose}
                className="
                  btn
                  btn-ghost
                  btn-circle
                  absolute
                  right-3
                  top-3
                  z-10
                "
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>

              <SidebarContent
                pathname={pathname}
                user={user}
                onNavigate={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


function SidebarContent({ pathname, user, onNavigate }) {
  const { data: dashboardData } = useDashboard();

  const storage = dashboardData?.storage;
  const percentage = storage?.percentage || 0;

  return (
    <div className="flex h-full flex-col">
      {/* ==================== BRAND ==================== */}

      <div className="flex h-16 items-center px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-2.5"
        >
          <motion.div
            whileHover={{ rotate: -6, scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-content text-base-100 shadow-sm"
          >
            <Cloud size={19} />
          </motion.div>

          <span className="text-lg font-black tracking-tight">
            Orivox
          </span>
        </Link>
      </div>

      {/* ==================== NAVIGATION ==================== */}

      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] opacity-35">
          Workspace
        </p>

        <div className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (
                item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`)
              );

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }}
                whileHover={{ x: 3 }}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`
                    relative flex items-center gap-3 rounded-xl px-3 py-2.5
                    text-sm font-semibold transition
                    ${
                      active
                        ? "bg-base-content text-base-100 shadow-sm"
                        : "opacity-65 hover:bg-base-200 hover:opacity-100"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />

                  <span>{item.label}</span>

                  {active && (
                    <motion.span
                      layoutId="sidebar-active-dot"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-base-100"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* ==================== STORAGE ==================== */}

      <div className="px-4 pb-4">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="rounded-2xl border border-base-300 bg-base-200/60 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold">
                Storage
              </p>

              <p className="mt-1 text-[11px] opacity-45">
                {storage
                  ? `${formatBytes(storage.used)} of ${formatBytes(storage.limit)}`
                  : "Loading storage..."}
              </p>
            </div>

            {storage && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.55, scale: 1 }}
                className="text-xs font-bold"
              >
                {percentage}%
              </motion.span>
            )}
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-300">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-base-content"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[10px] opacity-40">
            <span>
              {storage
                ? `${formatBytes(storage.available)} free`
                : "Checking..."}
            </span>

            <span>
              {storage?.reserved
                ? `${formatBytes(storage.reserved)} reserved`
                : ""}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ==================== USER ==================== */}

      <div className="border-t border-base-300 p-4">
        <motion.div
          whileHover={{
            backgroundColor: "var(--color-base-200)",
            x: 2,
          }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 rounded-xl p-2 transition"
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-content text-sm font-bold text-base-100"
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </motion.div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {user?.name || "Orivox User"}
            </p>

            <p className="truncate text-xs opacity-45">
              {user?.email || "user@orivox.com"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
