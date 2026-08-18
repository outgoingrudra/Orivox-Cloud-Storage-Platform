"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleX,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();

  const token =
    searchParams.get("token");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!token) {
      setError(
        "Password reset link is invalid."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/reset-password",
        {
          token,
          password,
        }
      );

      setSuccess(true);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "This password reset link is invalid or has expired.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // MISSING TOKEN
  // =====================================================

  if (!token) {
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
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 0.55,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
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
            stiffness: 150,
            damping: 18,
          }}
          className="w-full max-w-[460px]"
        >
          <div
            className="
              rounded-[2rem]
              border
              border-base-300
              bg-base-100/90
              p-7
              text-center
              shadow-2xl
              shadow-base-300/25
              backdrop-blur-xl
              sm:p-9
            "
          >
            <motion.div
              initial={{
                scale: 0,
                rotate: -35,
              }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
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
              "
            >
              <CircleX size={29} />
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="
                mt-6
                text-3xl
                font-black
                tracking-tight
              "
            >
              Invalid reset link
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 0.65,
                y: 0,
              }}
              transition={{
                delay: 0.25,
              }}
              className="mt-3 leading-7"
            >
              This password reset link is
              missing the required token.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 16,
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
              <Link
                href="/forgot-password"
                className="
                  btn
                  btn-neutral
                  h-12
                  w-full
                  rounded-xl
                "
              >
                Request new reset link
              </Link>

              <Link
                href="/login"
                className="
                  btn
                  btn-ghost
                  h-12
                  w-full
                  rounded-xl
                "
              >
                Back to sign in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    );
  }

  // =====================================================
  // SUCCESS
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
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: 0.55,
            scale: 1,
          }}
          transition={{
            duration: 0.9,
          }}
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            -z-10
            h-[520px]
            w-[520px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-base-300
            blur-[135px]
          "
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
            scale: 0.88,
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
              rotateX: 12,
              opacity: 0,
            }}
            animate={{
              rotateX: 0,
              opacity: 1,
            }}
            transition={{
              duration: 0.55,
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
              shadow-base-300/25
              backdrop-blur-xl
              sm:p-9
            "
          >
            <motion.div
              initial={{
                x: "-130%",
              }}
              animate={{
                x: "180%",
              }}
              transition={{
                delay: 0.2,
                duration: 1.5,
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

            <motion.div
              initial={{
                scale: 0,
                rotate: -35,
              }}
              animate={{
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 270,
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

            <motion.h1
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="
                mt-6
                text-3xl
                font-black
                tracking-[-0.03em]
                sm:text-4xl
              "
            >
              Password changed
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 0.65,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="mt-3 leading-7"
            >
              Your password has been reset successfully.
            </motion.p>

            <motion.p
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 0.5,
              }}
              transition={{
                delay: 0.4,
              }}
              className="mt-2 text-sm"
            >
              Sign in again using your new password.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.45,
              }}
              whileHover={{
                scale: 1.015,
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="mt-8"
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
                Sign in

                <ArrowRight size={17} />
              </Link>
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

            Your account is secure
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
      {/* ==================== FLOATING BACKGROUND ==================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          opacity: 0.55,
          scale: 1,
          x: [0, 20, -10, 0],
          y: [0, -18, 12, 0],
        }}
        transition={{
          opacity: {
            duration: 0.8,
          },
          scale: {
            duration: 0.8,
          },
          x: {
            duration: 10,
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
          -left-24
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
          x: [0, -20, 14, 0],
          y: [0, 18, -10, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none
          absolute
          -right-24
          bottom-12
          -z-10
          h-80
          w-80
          rounded-full
          bg-base-200
          blur-[105px]
        "
      />

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
          stiffness: 155,
          damping: 18,
        }}
        className="w-full max-w-[470px]"
      >
        {/* ==================== INTRO ==================== */}

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
            whileHover={{
              rotate: -8,
              scale: 1.08,
            }}
            transition={{
              delay: 0.08,
              type: "spring",
              stiffness: 270,
              damping: 15,
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
            <LockKeyhole size={24} />
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.16,
            }}
            className="
              mt-6
              text-3xl
              font-black
              tracking-[-0.035em]
              sm:text-4xl
            "
          >
            Create a new password
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 0.55,
              y: 0,
            }}
            transition={{
              delay: 0.24,
            }}
            className="
              mx-auto
              mt-3
              max-w-sm
              text-sm
              leading-6
            "
          >
            Choose a strong new password for your Orivox account.
          </motion.p>
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
          {/* shine */}

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

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.28,
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

            Use at least 8 characters.
          </motion.div>

          {/* ERROR */}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{
                  opacity: 0,
                  x: -18,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 18,
                }}
                transition={{
                  type: "spring",
                  stiffness: 320,
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

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* ==================== NEW PASSWORD ==================== */}

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
                htmlFor="password"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                "
              >
                New password
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
                <LockKeyhole
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
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  disabled={loading}
                  className="
                    input
                    input-bordered
                    h-12
                    w-full
                    rounded-xl
                    bg-base-100
                    pl-11
                    pr-12
                    focus:shadow-lg
                  "
                />

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.88,
                  }}
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    opacity-45
                    transition
                    hover:bg-base-200
                    hover:opacity-100
                  "
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* ==================== CONFIRM ==================== */}

            <motion.div
              initial={{
                opacity: 0,
                x: 24,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.36,
                type: "spring",
              }}
            >
              <label
                htmlFor="confirmPassword"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                "
              >
                Confirm new password
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
                <LockKeyhole
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
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Enter password again"
                  disabled={loading}
                  className="
                    input
                    input-bordered
                    h-12
                    w-full
                    rounded-xl
                    bg-base-100
                    pl-11
                    pr-12
                    focus:shadow-lg
                  "
                />

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.1,
                  }}
                  whileTap={{
                    scale: 0.88,
                  }}
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    opacity-45
                    transition
                    hover:bg-base-200
                    hover:opacity-100
                  "
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* ==================== BUTTON ==================== */}

            <motion.button
              type="submit"
              disabled={loading}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.42,
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
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Changing password...
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
                    Reset password

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

          {/* back */}

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

          Secure password reset
        </motion.div>
      </motion.div>
    </section>
  );
}