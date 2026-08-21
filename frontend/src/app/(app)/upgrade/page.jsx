"use client";

import {
  ArrowRight,
  Check,
  Cloud,
  Crown,
  HardDrive,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { motion } from "framer-motion";

import { useDashboard } from "@/components/features/dashboard/useDashboard";
import { formatBytes } from "@/components/features/files/file.utils";

const plans = [
  {
    id: "starter",
    name: "Starter",
    storage: "1 GB",
    price: "Free",
    description: "Included with every Orivox account.",
    icon: Cloud,
    current: true,
    features: [
      "1 GB cloud storage",
      "Secure file uploads",
      "Folder organization",
      "Trash recovery",
      "Device session management",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    storage: "10 GB",
    price: "₹49",
    period: "/ month",
    description: "For users who need more room for everyday files.",
    icon: Zap,
    popular: true,
    features: [
      "10 GB cloud storage",
      "Everything in Starter",
      "Larger upload capacity",
      "Priority storage allocation",
      "Future premium features",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    storage: "50 GB",
    price: "₹149",
    period: "/ month",
    description: "Built for heavier personal and project workloads.",
    icon: Crown,
    features: [
      "50 GB cloud storage",
      "Everything in Plus",
      "More room for large files",
      "Designed for power users",
      "Future advanced sharing tools",
    ],
  },
];

export default function UpgradePage() {
  const {
    data,
    isLoading,
  } = useDashboard();

  const storage = data?.storage;
  const percentage = storage?.percentage || 0;

  function handleUpgrade(plan) {
    /*
      Razorpay checkout will be wired later.
    */
    console.log("Upgrade requested:", plan);
  }

  return (
    <div className="mx-auto max-w-7xl pb-12">
      {/* ==================== HERO ==================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 22,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-sm sm:p-8 lg:p-10"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
          }}
        />

        <motion.div
          animate={{
            x: [0, 35, -15, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.06, 0.96, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-base-300/70 blur-[100px]"
        />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200/60 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em]"
            >
              <Sparkles size={13} />
              Storage upgrade
            </motion.div>

            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">
              More space when Orivox grows with you.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 opacity-55 sm:text-base">
              Increase your cloud storage without changing how you manage your files.
              Your folders, uploads, sessions and existing data stay exactly where they are.
            </p>
          </div>

          {/* CURRENT STORAGE */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              delay: 0.12,
            }}
            whileHover={{
              y: -4,
              scale: 1.01,
            }}
            className="rounded-2xl border border-base-300 bg-base-200/50 p-5 backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
                <HardDrive size={19} />
              </div>

              <div>
                <p className="text-sm font-bold">
                  Current storage
                </p>

                <p className="mt-0.5 text-xs opacity-40">
                  Your current Orivox allowance
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-32 items-center justify-center">
                <LoaderCircle
                  size={22}
                  className="animate-spin opacity-40"
                />
              </div>
            ) : (
              <>
                <div className="mt-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-black">
                      {formatBytes(storage?.used || 0)}
                    </p>

                    <p className="mt-1 text-xs opacity-40">
                      of {formatBytes(storage?.limit || 0)} used
                    </p>
                  </div>

                  <span className="text-lg font-black opacity-50">
                    {Math.round(percentage)}%
                  </span>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-base-300">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                    transition={{
                      duration: 0.9,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full bg-base-content"
                  />
                </div>

                <p className="mt-3 text-xs opacity-40">
                  {formatBytes(storage?.available || 0)} available
                </p>
              </>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* ==================== PLANS ==================== */}

      <section className="mt-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-35">
            Plans
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.035em]">
            Choose your storage capacity
          </h2>

          <p className="mt-2 text-sm opacity-50">
            Payment integration will be enabled later through Razorpay.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;

            return (
              <motion.article
                key={plan.id}
                initial={{
                  opacity: 0,
                  y: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.08 + index * 0.08,
                }}
                whileHover={{
                  y: -6,
                  scale: 1.015,
                }}
                className={`relative flex flex-col rounded-[1.75rem] border bg-base-100 p-6 shadow-sm ${
                  plan.popular
                    ? "border-base-content"
                    : "border-base-300"
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 0.8,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    className="absolute right-5 top-5 rounded-full bg-base-content px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-base-100"
                  >
                    Popular
                  </motion.div>
                )}

                <motion.div
                  whileHover={{
                    rotate: -5,
                    scale: 1.07,
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-base-200"
                >
                  <Icon size={21} />
                </motion.div>

                <div className="mt-5">
                  <p className="text-sm font-bold opacity-50">
                    {plan.storage}
                  </p>

                  <h3 className="mt-1 text-2xl font-black">
                    {plan.name}
                  </h3>

                  <p className="mt-2 min-h-10 text-sm leading-6 opacity-50">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-black tracking-[-0.04em]">
                    {plan.price}
                  </span>

                  {plan.period && (
                    <span className="mb-1 text-sm opacity-40">
                      {plan.period}
                    </span>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-base-200">
                        <Check size={12} />
                      </div>

                      <span className="opacity-65">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-7">
                  {plan.current ? (
                    <button
                      type="button"
                      disabled
                      className="btn btn-outline w-full rounded-xl"
                    >
                      <ShieldCheck size={16} />
                      Current plan
                    </button>
                  ) : (
                    <motion.button
                      type="button"
                      whileHover={{
                        y: -2,
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={() =>
                        handleUpgrade(plan)
                      }
                      className="btn btn-neutral w-full rounded-xl"
                    >
                      Choose {plan.name}
                      <ArrowRight size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ==================== PAYMENT PLACEHOLDER ==================== */}

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
          delay: 0.35,
        }}
        className="mt-8 flex flex-col gap-4 rounded-2xl border border-dashed border-base-300 bg-base-200/30 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-sm font-bold">
            Payments are not enabled yet
          </p>

          <p className="mt-1 max-w-2xl text-xs leading-5 opacity-45">
            Razorpay checkout, payment verification and automatic storage upgrades
            will be connected after the storage-plan backend is ready.
          </p>
        </div>

        <div className="badge badge-outline shrink-0">
          Coming soon
        </div>
      </motion.section>
    </div>
  );
}