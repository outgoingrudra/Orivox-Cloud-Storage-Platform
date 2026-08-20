"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
  Upload,
  UserRound,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import ThemeSwitcher from "@/components/ThemeSwitcher";
import { api } from "@/lib/api";
import { clearAccessToken } from "@/lib/token";
import { setUnauthenticated } from "@/store/authSlice";

export default function Topbar({
  onMenuClick,
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.auth.user
  );

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await api.post(
        "/auth/logout"
      );
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    } finally {
      clearAccessToken();

      dispatch(
        setUnauthenticated()
      );

      router.replace("/login");
    }
  }

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        gap-3
        border-b
        border-base-300
        bg-base-100/85
        px-4
        backdrop-blur-xl
        sm:px-6
        lg:px-8
      "
    >
      {/* ==================== MOBILE MENU ==================== */}

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={onMenuClick}
        className="
          btn
          btn-ghost
          btn-circle
          lg:hidden
        "
        aria-label="Open sidebar"
      >
        <Menu size={21} />
      </motion.button>

      {/* ==================== SEARCH ==================== */}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="
          relative
          hidden
          max-w-xl
          flex-1
          md:block
        "
      >
        <Search
          size={18}
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            opacity-40
          "
        />

        <input
          type="text"
          placeholder="Search files and folders..."
          className="
            input
            input-bordered
            h-10
            w-full
            rounded-xl
            bg-base-200/60
            pl-11
            pr-16
            text-sm
            transition
            focus:bg-base-100
            focus:shadow-md
          "
        />

        <div
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            rounded-md
            border
            border-base-300
            px-2
            py-0.5
            text-[10px]
            font-semibold
            opacity-40
          "
        >
          ⌘ K
        </div>
      </motion.div>

      {/* Mobile search */}

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="
          btn
          btn-ghost
          btn-circle
          md:hidden
        "
        aria-label="Search"
      >
        <Search size={19} />
      </motion.button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
       
        {/* ==================== THEME ==================== */}

        <ThemeSwitcher />

        {/* ==================== NOTIFICATIONS ==================== */}

        <motion.button
          type="button"
          whileHover={{
            scale: 1.06,
          }}
          whileTap={{
            scale: 0.92,
          }}
          className="
            btn
            btn-ghost
            btn-circle
            relative
          "
          aria-label="Notifications"
        >
          <Bell size={19} />

          <span
            className="
              absolute
              right-2
              top-2
              h-2
              w-2
              rounded-full
              bg-error
            "
          />
        </motion.button>

        {/* ==================== USER MENU ==================== */}

        <div className="relative">
          <motion.button
            type="button"
            whileHover={{
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() =>
              setUserMenuOpen(
                (value) => !value
              )
            }
            className="
              flex
              items-center
              gap-2
              rounded-xl
              p-1.5
              transition
              hover:bg-base-200
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-base-content
                text-sm
                font-bold
                text-base-100
              "
            >
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>

            <div className="hidden text-left xl:block">
              <p className="max-w-32 truncate text-sm font-semibold">
                {user?.name ||
                  "Orivox User"}
              </p>

              <p className="max-w-32 truncate text-[11px] opacity-45">
                {user?.email ||
                  "user@orivox.com"}
              </p>
            </div>

            <motion.span
              animate={{
                rotate:
                  userMenuOpen
                    ? 180
                    : 0,
              }}
              transition={{
                duration: 0.2,
              }}
              className="hidden xl:block"
            >
              <ChevronDown
                size={15}
              />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {userMenuOpen && (
              <>
                {/* Invisible backdrop */}

                <button
                  type="button"
                  aria-label="Close user menu"
                  onClick={() =>
                    setUserMenuOpen(
                      false
                    )
                  }
                  className="
                    fixed
                    inset-0
                    z-40
                    cursor-default
                  "
                />

                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    scale: 0.97,
                  }}
                  transition={{
                    duration: 0.18,
                  }}
                  className="
                    absolute
                    right-0
                    top-[calc(100%+0.65rem)]
                    z-50
                    w-60
                    overflow-hidden
                    rounded-2xl
                    border
                    border-base-300
                    bg-base-100
                    p-2
                    shadow-2xl
                  "
                >
                  {/* user summary */}

                  <div
                    className="
                      border-b
                      border-base-300
                      px-3
                      pb-3
                      pt-2
                    "
                  >
                    <p className="truncate text-sm font-semibold">
                      {user?.name ||
                        "Orivox User"}
                    </p>

                    <p className="mt-0.5 truncate text-xs opacity-45">
                      {user?.email ||
                        "user@orivox.com"}
                    </p>
                  </div>

                  {/* menu */}

                  <div className="py-2">
                    <MenuButton
                      icon={UserRound}
                      label="Profile"
                      onClick={() => {
                        setUserMenuOpen(
                          false
                        );

                        router.push(
                          "/settings"
                        );
                      }}
                    />

                    <MenuButton
                      icon={Settings}
                      label="Settings"
                      onClick={() => {
                        setUserMenuOpen(
                          false
                        );

                        router.push(
                          "/settings"
                        );
                      }}
                    />
                  </div>

                  <div
                    className="
                      border-t
                      border-base-300
                      pt-2
                    "
                  >
                    <motion.button
                      type="button"
                      whileHover={{
                        x: 3,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={
                        handleLogout
                      }
                      disabled={
                        loggingOut
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-2.5
                        text-left
                        text-sm
                        font-semibold
                        text-error
                        transition
                        hover:bg-error/10
                      "
                    >
                      {loggingOut ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <LogOut
                          size={17}
                        />
                      )}

                      {loggingOut
                        ? "Logging out..."
                        : "Logout"}
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      whileHover={{
        x: 3,
      }}
      whileTap={{
        scale: 0.98,
      }}
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-left
        text-sm
        font-medium
        opacity-70
        transition
        hover:bg-base-200
        hover:opacity-100
      "
    >
      <Icon size={17} />
      {label}
    </motion.button>
  );
}