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
  Cloud,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
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
    label: "Search",
    href: "/search",
    icon: Search,
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

export default function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}) {
  const pathname = usePathname();
  const user = useSelector((state) => state.auth.user);

  return (
    <>
      {/* ==================== DESKTOP ==================== */}

      <motion.aside
        animate={{
          width: collapsed ? 80 : 288,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 28,
        }}
        className="fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-base-300 bg-base-100 lg:flex lg:flex-col"
      >
        <SidebarContent
          pathname={pathname}
          user={user}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </motion.aside>

      {/* ==================== MOBILE ==================== */}

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
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 28,
              }}
              className="fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-72 flex-col border-r border-base-300 bg-base-100 shadow-2xl lg:hidden"
            >
              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-circle absolute right-3 top-3 z-10"
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

function SidebarContent({
  pathname,
  user,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}) {
  const { data: dashboardData } = useDashboard();

  const storage = dashboardData?.storage;
  const percentage = storage?.percentage || 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ==================== BRAND ==================== */}

      <div
        className={`flex h-16 shrink-0 items-center ${
          collapsed ? "justify-center px-2" : "justify-between px-5"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5"
        >
          <motion.div
            whileHover={{ rotate: -6, scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-base-content text-base-100 shadow-sm"
          >
            <Cloud size={19} />
          </motion.div>

          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="whitespace-nowrap text-lg font-black tracking-tight"
            >
              Orivox
            </motion.span>
          )}
        </Link>

        {!collapsed && onToggleCollapse && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </motion.button>
        )}
      </div>

      {/* ==================== COLLAPSED OPEN BUTTON ==================== */}

      {collapsed && onToggleCollapse && (
        <div className="flex justify-center pb-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleCollapse}
            className="btn btn-ghost btn-circle btn-sm"
            aria-label="Expand sidebar"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </motion.button>
        </div>
      )}

      {/* ==================== NAVIGATION ==================== */}

      <nav className={`flex-1 py-5 ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] opacity-35">
            Workspace
          </p>
        )}

        <div className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + index * 0.04 }}
                whileHover={{ x: collapsed ? 0 : 3 }}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative flex items-center rounded-xl py-2.5
                    text-sm font-semibold transition
                    ${collapsed ? "justify-center px-2" : "gap-3 px-3"}
                    ${
                      active
                        ? "bg-base-content text-base-100 shadow-sm"
                        : "opacity-65 hover:bg-base-200 hover:opacity-100"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.4 : 2}
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <>
                      <span className="whitespace-nowrap">{item.label}</span>

                      {active && (
                        <motion.span
                          layoutId="sidebar-active-dot"
                          className="ml-auto h-1.5 w-1.5 rounded-full bg-base-100"
                        />
                      )}
                    </>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* ==================== STORAGE ==================== */}

      {!collapsed ? (
        <div className="px-4 pb-4">
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            className="rounded-2xl border border-base-300 bg-base-200/60 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold">Storage</p>

                <p className="mt-1 text-[11px] opacity-45">
                  {storage
                    ? `${formatBytes(storage.used)} of ${formatBytes(storage.limit)}`
                    : "Loading storage..."}
                </p>
              </div>

              {storage && (
                <span className="text-xs font-bold opacity-55">
                  {percentage}%
                </span>
              )}
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-base-300">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(percentage, 100)}%`,
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-base-content"
              />
            </div>

            <div className="mt-2 flex justify-between text-[10px] opacity-40">
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
      ) : (
        <div
          className="mb-4 flex justify-center"
          title={
            storage
              ? `${formatBytes(storage.used)} of ${formatBytes(storage.limit)} used`
              : "Storage"
          }
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-base-200">
            <HardDrive size={18} />

            {storage && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-base-content px-1 text-[8px] font-bold text-base-100">
                {Math.round(percentage)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ==================== USER ==================== */}

      <div className={`border-t border-base-300 ${collapsed ? "p-3" : "p-4"}`}>
        <motion.div
          whileHover={{
            backgroundColor: "var(--color-base-200)",
          }}
          title={collapsed ? user?.name : undefined}
          className={`flex items-center rounded-xl p-2 transition ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-content text-sm font-bold text-base-100"
          >
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </motion.div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user?.name || "Orivox User"}
              </p>

              <p className="truncate text-xs opacity-45">
                {user?.email || "user@orivox.com"}
              </p>
            </div>
          )}
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
