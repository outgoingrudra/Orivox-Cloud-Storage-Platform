"use client";

import Link from "next/link";

import {
  ArrowUpRight,
  HardDrive,
  LoaderCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import { useDashboard } from "@/features/dashboard/useDashboard";
import { formatBytes } from "@/features/files/file.utils";

export default function StorageSettings() {
  const {
    data,
    isLoading,
  } = useDashboard();

  const storage =
    data?.storage;

  const percentage =
    storage?.percentage || 0;

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.26,
      }}
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{
            rotate: -4,
            scale: 1.06,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200"
        >
          <HardDrive size={18} />
        </motion.div>

        <div>
          <h2 className="font-bold">
            Storage
          </h2>

          <p className="mt-0.5 text-xs opacity-45">
            Monitor your Orivox cloud storage usage.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 flex items-center justify-center py-8">
          <LoaderCircle
            size={23}
            className="animate-spin opacity-45"
          />
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl border border-base-300 bg-base-200/40 p-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Storage used
                </p>

                <p className="mt-2 text-2xl font-black tracking-tight">
                  {formatBytes(
                    storage?.used || 0
                  )}
                </p>

                <p className="mt-1 text-xs opacity-40">
                  of{" "}
                  {formatBytes(
                    storage?.limit || 0
                  )}
                </p>
              </div>

              <motion.span
                initial={{
                  opacity: 0,
                  scale: 0.85,
                }}
                animate={{
                  opacity: 0.6,
                  scale: 1,
                }}
                className="text-lg font-black"
              >
                {Math.round(
                  percentage
                )}
                %
              </motion.span>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-base-300">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(
                    percentage,
                    100
                  )}%`,
                }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                }}
                className="h-full rounded-full bg-base-content"
              />
            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs opacity-40">
              <span>
                {formatBytes(
                  storage?.available || 0
                )}{" "}
                available
              </span>

              {storage?.reserved > 0 && (
                <span>
                  {formatBytes(
                    storage.reserved
                  )}{" "}
                  reserved
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Need more space?
              </p>

              <p className="mt-1 text-xs leading-5 opacity-45">
                Upgrade your storage capacity when you need additional room.
              </p>
            </div>

            <motion.div
              whileHover={{
                y: -2,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              <Link
                href="/upgrade"
                className="btn btn-neutral btn-sm w-full rounded-xl sm:w-auto"
              >
                Upgrade storage
                <ArrowUpRight
                  size={15}
                />
              </Link>
            </motion.div>
          </div>
        </>
      )}
    </motion.section>
  );
}