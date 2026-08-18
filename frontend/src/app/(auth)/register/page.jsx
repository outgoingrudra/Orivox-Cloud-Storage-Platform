"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  MailCheck,
  ShieldCheck,
  UserRound,
  LockKeyhole,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { api } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    registeredEmail,
    setRegisteredEmail,
  ] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

    // ==================== VALIDATION ====================

    if (normalizedName.length < 2) {
      setError(
        "Name must contain at least 2 characters."
      );
      return;
    }

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/auth/register",
        {
          name: normalizedName,
          email: normalizedEmail,
          password,
        }
      );

      setRegisteredEmail(
        normalizedEmail
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // SUCCESS STATE
  // =====================================================

  if (registeredEmail) {
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
            scale: 0.94,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
          className="w-full max-w-[460px]"
        >
          <div
            className="
              rounded-[1.8rem]
              border
              border-base-300
              bg-base-100/90
              p-6
              text-center
              shadow-2xl
              shadow-base-300/20
              backdrop-blur-xl
              sm:p-8
            "
          >
            <motion.div
              initial={{
                scale: 0.75,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 18,
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
              <MailCheck size={28} />
            </motion.div>

            <h1
              className="
                mt-6
                text-3xl
                font-black
                tracking-tight
              "
            >
              Check your email
            </h1>

            <p
              className="
                mt-3
                leading-7
                opacity-65
              "
            >
              We sent a verification link to{" "}
              <span className="font-semibold opacity-100">
                {registeredEmail}
              </span>
              .
            </p>

            <p className="mt-2 text-sm opacity-50">
              Verify your email before signing in to Orivox.
            </p>

            <motion.div
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="mt-8 space-y-2"
            >
              <Link
                href="/login"
                className="
                  btn
                  btn-neutral
                  h-12
                  w-full
                  rounded-xl
                "
              >
                Go to sign in

                <ArrowRight size={17} />
              </Link>

              <button
                type="button"
                onClick={() =>
                  setRegisteredEmail(null)
                }
                className="
                  btn
                  btn-ghost
                  h-12
                  w-full
                  rounded-xl
                "
              >
                Use another email
              </button>
            </motion.div>
          </div>

          <div
            className="
              mt-5
              flex
              items-center
              justify-center
              gap-2
              text-xs
              opacity-40
            "
          >
            <ShieldCheck size={14} />

            Verification keeps your account secure
          </div>
        </motion.div>
      </section>
    );
  }

  // =====================================================
  // REGISTER FORM
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
      {/* Glow */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
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
          h-[430px]
          w-[430px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-base-300/45
          blur-[110px]
          sm:h-[560px]
          sm:w-[560px]
        "
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 28,
          scale: 0.97,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="w-full max-w-[500px]"
      >
        {/* Intro */}

        <motion.div
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="mb-8 text-center"
        >
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.12,
              type: "spring",
              stiffness: 220,
              damping: 18,
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
            <UserRound size={24} />
          </motion.div>

          <h1
            className="
              mt-6
              text-3xl
              font-black
              tracking-[-0.03em]
              sm:text-4xl
            "
          >
            Create your account
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
            Create your Orivox workspace and start organizing your files.
          </p>
        </motion.div>

        {/* Card */}

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
            delay: 0.15,
            duration: 0.4,
          }}
          className="
            relative
            overflow-hidden
            rounded-[1.8rem]
            border
            border-base-300
            bg-base-100/90
            p-6
            shadow-2xl
            shadow-base-300/20
            backdrop-blur-xl
            sm:p-8
          "
        >
          {/* top shine */}

          <motion.div
            initial={{
              x: "-100%",
            }}
            animate={{
              x: "150%",
            }}
            transition={{
              delay: 0.3,
              duration: 1.4,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute
              top-0
              h-px
              w-40
              bg-gradient-to-r
              from-transparent
              via-base-content/40
              to-transparent
            "
          />

          {/* Error */}

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -5,
                }}
                transition={{
                  duration: 0.2,
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
            {/* NAME */}

            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.2,
              }}
            >
              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                "
              >
                Name
              </label>

              <div className="relative">
                <UserRound
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
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  autoComplete="name"
                  placeholder="Your name"
                  disabled={loading}
                  className="
                    input
                    input-bordered
                    h-12
                    w-full
                    rounded-xl
                    bg-base-100
                    pl-11
                    transition-all
                    duration-200
                    focus:-translate-y-[1px]
                    focus:shadow-md
                  "
                />
              </div>
            </motion.div>

            {/* EMAIL */}

            <motion.div
              initial={{
                opacity: 0,
                x: 10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.25,
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

              <div className="relative">
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
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
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
                    transition-all
                    duration-200
                    focus:-translate-y-[1px]
                    focus:shadow-md
                  "
                />
              </div>
            </motion.div>

            {/* PASSWORD */}

            <motion.div
              initial={{
                opacity: 0,
                x: -10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.3,
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
                Password
              </label>

              <div className="relative">
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
                  "
                />

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.9,
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
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* CONFIRM PASSWORD */}

            <motion.div
              initial={{
                opacity: 0,
                x: 10,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.35,
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
                Confirm password
              </label>

              <div className="relative">
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
                  "
                />

                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.08,
                  }}
                  whileTap={{
                    scale: 0.9,
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
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* SUBMIT */}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={
                loading
                  ? {}
                  : {
                      scale: 1.015,
                      y: -1,
                    }
              }
              whileTap={
                loading
                  ? {}
                  : {
                      scale: 0.98,
                    }
              }
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className="
                btn
                btn-neutral
                h-12
                w-full
                rounded-xl
                font-semibold
              "
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Creating account...
                </>
              ) : (
                <>
                  Create account

                  <ArrowRight size={17} />
                </>
              )}
            </motion.button>
          </form>

          {/* Login */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.45,
            }}
            className="
              mt-7
              border-t
              border-base-300
              pt-6
              text-center
            "
          >
            <p className="text-sm opacity-60">
              Already have an account?{" "}

              <Link
                href="/login"
                className="
                  font-bold
                  opacity-100
                  underline-offset-4
                  hover:underline
                "
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.5,
          }}
          className="
            mt-5
            flex
            items-center
            justify-center
            gap-2
            text-xs
            opacity-40
          "
        >
          <ShieldCheck size={14} />

          Your account is protected by secure authentication
        </motion.div>
      </motion.div>
    </section>
  );
}