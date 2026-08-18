"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import { api } from "@/lib/api";
import { setAccessToken } from "@/lib/token";
import { setAuthenticated } from "@/store/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/auth/login",
          {
            email: normalizedEmail,
            password,
          }
        );

      const {
        user,
        accessToken,
      } = response.data.data;

      setAccessToken(
        accessToken
      );

      dispatch(
        setAuthenticated(user)
      );

      router.replace(
        "/dashboard"
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to login. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

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
      {/* Decorative glow */}

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
          ease: "easeOut",
        }}
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          -z-10
          h-[420px]
          w-[420px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-base-300/45
          blur-[110px]
          sm:h-[520px]
          sm:w-[520px]
        "
      />

      {/* Login container */}

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
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
        className="
          w-full
          max-w-[460px]
        "
      >
        {/* Intro */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
            duration: 0.4,
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
              delay: 0.15,
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
            <LockKeyhole size={24} />
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
            Welcome back
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
            Sign in to access your Orivox
            workspace and continue where you
            left off.
          </p>
        </motion.div>

        {/* Card */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.18,
            duration: 0.45,
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
          {/* subtle top shine */}

          <motion.div
            initial={{
              x: "-100%",
            }}
            animate={{
              x: "140%",
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
                  scale: 0.98,
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
            {/* EMAIL */}

            <motion.div
              initial={{
                opacity: 0,
                x: -12,
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
                x: 12,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.32,
              }}
            >
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <label
                  htmlFor="password"
                  className="text-sm font-semibold"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="
                    text-xs
                    font-semibold
                    opacity-50
                    transition
                    hover:opacity-100
                    hover:underline
                    sm:text-sm
                  "
                >
                  Forgot password?
                </Link>
              </div>

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
                  autoComplete="current-password"
                  placeholder="Enter your password"
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
                    transition-all
                    duration-200
                    focus:-translate-y-[1px]
                    focus:shadow-md
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
              </div>
            </motion.div>

            {/* BUTTON */}

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
                mt-1
                h-12
                w-full
                rounded-xl
                font-semibold
                shadow-sm
              "
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Signing in...
                </>
              ) : (
                <>
                  Sign in

                  <motion.span
                    initial={{
                      x: 0,
                    }}
                    whileHover={{
                      x: 3,
                    }}
                  >
                    <ArrowRight
                      size={17}
                    />
                  </motion.span>
                </>
              )}
            </motion.button>
          </form>

          {/* Register */}

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
              New to Orivox?{" "}

              <Link
                href="/register"
                className="
                  font-bold
                  opacity-100
                  underline-offset-4
                  transition
                  hover:underline
                "
              >
                Create an account
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Security */}

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
            delay: 0.55,
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

          Your session is securely protected
        </motion.div>
      </motion.div>
    </section>
  );
}