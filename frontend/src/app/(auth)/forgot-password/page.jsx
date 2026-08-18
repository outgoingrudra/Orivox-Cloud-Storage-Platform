"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      setSuccess(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to process your request. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SUCCESS STATE
  // =====================================================

  if (success) {
    return (
      <section
        className="
          relative
          mx-auto
          flex
          min-h-[calc(100vh-4rem)]
          max-w-7xl
          items-center
          justify-center
          overflow-hidden
          px-5
          py-10
          sm:px-8
          lg:px-10
        "
      >
        {/* Animated background */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.4,
          }}
          animate={{
            opacity: 0.6,
            scale: 1,
          }}
          transition={{
            duration: 1,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            -z-10
            h-[500px]
            w-[500px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-base-300
            blur-[130px]
          "
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 45,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            type: "spring",
            stiffness: 160,
            damping: 18,
          }}
          className="w-full max-w-[460px]"
        >
          <motion.div
            initial={{
              opacity: 0,
              rotateX: 12,
            }}
            animate={{
              opacity: 1,
              rotateX: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="
              relative
              overflow-hidden
              rounded-[2rem]
              border
              border-base-300
              bg-base-100/90
              p-7
              text-center
              shadow-2xl
              shadow-base-300/30
              backdrop-blur-xl
              sm:p-9
            "
          >
            {/* top shine */}

            <motion.div
              initial={{
                x: "-120%",
              }}
              animate={{
                x: "180%",
              }}
              transition={{
                delay: 0.15,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="
                pointer-events-none
                absolute
                top-0
                h-px
                w-48
                bg-gradient-to-r
                from-transparent
                via-base-content/50
                to-transparent
              "
            />

            {/* success icon */}

            <motion.div
              initial={{
                scale: 0,
                rotate: -25,
              }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 250,
                damping: 14,
              }}
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-base-content
                text-base-100
                shadow-lg
              "
            >
              <CheckCircle2 size={29} />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.22,
              }}
            >
              <h1
                className="
                  mt-6
                  text-3xl
                  font-black
                  tracking-[-0.03em]
                  sm:text-4xl
                "
              >
                Check your email
              </h1>

              <p
                className="
                  mt-4
                  leading-7
                  opacity-65
                "
              >
                If an Orivox account exists for{" "}
                <span className="font-semibold opacity-100">
                  {email.trim().toLowerCase()}
                </span>
                , you'll receive a password reset link.
              </p>

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 0.55,
                }}
                transition={{
                  delay: 0.45,
                }}
                className="mt-3 text-sm"
              >
                Check your inbox and spam folder.
              </motion.p>
            </motion.div>

            {/* Actions */}

            <motion.div
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.35,
              }}
              className="mt-8 space-y-2"
            >
              <motion.div
                whileHover={{
                  scale: 1.015,
                  y: -1,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                <Link
                  href="/login"
                  className="
                    btn
                    btn-neutral
                    h-12
                    w-full
                    rounded-xl
                    font-semibold
                  "
                >
                  Back to sign in
                  <ArrowRight size={17} />
                </Link>
              </motion.div>

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.01,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => {
                  setSuccess(false);
                }}
                className="
                  btn
                  btn-ghost
                  h-12
                  w-full
                  rounded-xl
                "
              >
                Try another email
              </motion.button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 0.4,
              y: 0,
            }}
            transition={{
              delay: 0.55,
            }}
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              text-xs
            "
          >
            <ShieldCheck size={14} />
            Password recovery is securely protected
          </motion.div>
        </motion.div>
      </section>
    );
  }

  // =====================================================
  // FORM
  // =====================================================

  return (
    <section
      className="
        relative
        mx-auto
        flex
        min-h-[calc(100vh-4rem)]
        max-w-7xl
        items-center
        justify-center
        overflow-hidden
        px-5
        py-10
        sm:px-8
        lg:px-10
      "
    >
      {/* ==================== BACKGROUND MOTION ==================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          opacity: 0.55,
          scale: 1,
          x: [0, 20, -10, 0],
          y: [0, -15, 12, 0],
        }}
        transition={{
          opacity: {
            duration: 0.8,
          },
          scale: {
            duration: 0.8,
          },
          x: {
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          },
          y: {
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        className="
          pointer-events-none
          absolute
          -left-20
          top-16
          -z-10
          h-72
          w-72
          rounded-full
          bg-base-300
          blur-[100px]
        "
      />

      <motion.div
        animate={{
          x: [0, -20, 15, 0],
          y: [0, 15, -10, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -right-20
          bottom-12
          -z-10
          h-80
          w-80
          rounded-full
          bg-base-200
          blur-[100px]
        "
      />

      {/* ==================== CONTENT ==================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 45,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 18,
        }}
        className="w-full max-w-[460px]"
      >
        {/* Intro */}

        <div className="mb-8 text-center">
          <motion.div
            initial={{
              scale: 0,
              rotate: -30,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 260,
              damping: 15,
            }}
            whileHover={{
              rotate: -8,
              scale: 1.08,
            }}
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-base-content
              text-base-100
              shadow-lg
            "
          >
            <KeyRound size={24} />
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.18,
            }}
          >
            <h1
              className="
                mt-6
                text-3xl
                font-black
                tracking-[-0.035em]
                sm:text-4xl
              "
            >
              Forgot your password?
            </h1>

            <p
              className="
                mx-auto
                mt-3
                max-w-sm
                text-sm
                leading-6
                opacity-55
              "
            >
              No worries. Enter your email and we'll send you a secure reset
              link.
            </p>
          </motion.div>
        </div>

        {/* ==================== CARD ==================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
            rotateX: 7,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotateX: 0,
          }}
          transition={{
            delay: 0.12,
            duration: 0.55,
            ease: "easeOut",
          }}
          whileHover={{
            y: -3,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-base-300
            bg-base-100/90
            p-6
            shadow-2xl
            shadow-base-300/25
            backdrop-blur-xl
            sm:p-8
          "
        >
          {/* moving top shine */}

          <motion.div
            initial={{
              x: "-130%",
            }}
            animate={{
              x: "190%",
            }}
            transition={{
              delay: 0.35,
              duration: 1.6,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute
              top-0
              h-px
              w-52
              bg-gradient-to-r
              from-transparent
              via-base-content/50
              to-transparent
            "
          />

          {/* helper badge */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.85,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.3,
            }}
            className="
              mb-6
              flex
              items-center
              gap-2
              rounded-xl
              bg-base-200
              px-3
              py-2.5
              text-xs
              font-medium
              opacity-70
            "
          >
            <Sparkles size={14} />
            We'll send a reset link if the account exists.
          </motion.div>

          {/* Error */}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{
                  opacity: 0,
                  x: -14,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 14,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 22,
                }}
                className="
                  alert
                  alert-error
                  mb-6
                  rounded-xl
                  text-sm
                "
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* EMAIL */}

            <motion.div
              initial={{
                opacity: 0,
                x: -24,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.3,
                type: "spring",
              }}
            >
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                "
              >
                Email
              </label>

              <motion.div
                whileFocusWithin={{
                  scale: 1.012,
                  y: -2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 22,
                }}
                className="relative"
              >
                <Mail
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
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  className="
                    input
                    input-bordered
                    h-12
                    w-full
                    rounded-xl
                    bg-base-100
                    pl-11
                    transition-shadow
                    focus:shadow-lg
                  "
                />
              </motion.div>
            </motion.div>

            {/* SUBMIT */}

            <motion.button
              type="submit"
              disabled={loading}
              initial={{
                opacity: 0,
                y: 14,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.38,
              }}
              whileHover={
                loading
                  ? {}
                  : {
                      scale: 1.02,
                      y: -2,
                    }
              }
              whileTap={
                loading
                  ? {}
                  : {
                      scale: 0.97,
                    }
              }
              className="
                btn
                btn-neutral
                h-12
                w-full
                overflow-hidden
                rounded-xl
                font-semibold
              "
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="loading"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="flex items-center gap-2"
                  >
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending...
                  </motion.span>
                ) : (
                  <motion.span
                    key="normal"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="flex items-center gap-2"
                  >
                    Send reset link
                    <motion.span
                      animate={{
                        x: [0, 4, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                      }}
                    >
                      <ArrowRight size={17} />
                    </motion.span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Back */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
            }}
            className="
              mt-7
              border-t
              border-base-300
              pt-6
            "
          >
            <motion.div
              whileHover={{
                x: -4,
              }}
              whileTap={{
                scale: 0.97,
              }}
            >
              <Link
                href="/login"
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-sm
                  font-semibold
                  opacity-55
                  transition
                  hover:opacity-100
                "
              >
                <ArrowLeft size={16} />
                Back to sign in
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom text */}

        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 0.4,
            y: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            text-xs
          "
        >
          <ShieldCheck size={14} />
          Secure account recovery
        </motion.div>
      </motion.div>
    </section>
  );
}
