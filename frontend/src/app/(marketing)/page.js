"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Cloud,
  Download,
  FileSearch,
  Files,
  FolderSearch,
  HardDrive,
  LockKeyhole,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UsersRound,
  Zap,
} from "lucide-react";

import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

const HERO_IMAGE =
  "https://ik.imagekit.io/rudra671/ChatGPT%20Image%20Aug%2018,%202026,%2006_59_27%20PM.png";

const features = [
  {
    icon: LockKeyhole,
    title: "Secure storage",
    description:
      "Protect your files with secure authentication, session control and permission-aware access.",
  },
  {
    icon: UploadCloud,
    title: "Direct uploads",
    description:
      "Upload directly to object storage without routing large files through the API server.",
  },
  {
    icon: Share2,
    title: "Powerful sharing",
    description:
      "Share files and folders using viewer, editor and secure public-link access.",
  },
  {
    icon: FolderSearch,
    title: "Find anything",
    description:
      "Organize deeply nested folders and search your entire workspace in seconds.",
  },
];

const workflow = [
  {
    number: "01",
    icon: UploadCloud,
    title: "Upload",
    text: "Send your files securely into your Orivox workspace.",
  },
  {
    number: "02",
    icon: Files,
    title: "Organize",
    text: "Create folders, move resources and keep everything structured.",
  },
  {
    number: "03",
    icon: Share2,
    title: "Collaborate",
    text: "Invite others with controlled viewer or editor access.",
  },
  {
    number: "04",
    icon: Search,
    title: "Find instantly",
    text: "Search your storage and jump directly to what you need.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const revealVariants = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function HomePage() {
  const { scrollYProgress } =
    useScroll();

  const heroY = useTransform(
    scrollYProgress,
    [0, 0.35],
    [0, 90],
  );

  const heroOpacity =
    useTransform(
      scrollYProgress,
      [0, 0.3],
      [1, 0.35],
    );

  return (
    <main className="overflow-hidden bg-base-100 text-base-content">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <motion.header
        initial={{
          opacity: 0,
          y: -20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="
          fixed
          left-0
          right-0
          top-0
          z-50
          border-b
          border-base-300/60
          bg-base-100/75
          backdrop-blur-xl
        "
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2.5"
          >
            <motion.div
              whileHover={{
                rotate: -7,
                scale: 1.08,
              }}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-base-content text-base-100"
            >
              <Cloud size={18} />
            </motion.div>

            <span className="text-lg font-black tracking-tight">
              Orivox
            </span>
          </Link>

          <div className="hidden items-center gap-7 text-sm md:flex">
            <a
              href="#features"
              className="opacity-55 transition hover:opacity-100"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="opacity-55 transition hover:opacity-100"
            >
              How it works
            </a>

            <a
              href="#security"
              className="opacity-55 transition hover:opacity-100"
            >
              Security
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Sign in
            </Link>

            <Link
              href="/register"
              className="btn btn-neutral btn-sm rounded-xl"
            >
              Get started
              <ArrowRight size={14} />
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-screen pt-16">

        {/* BACKGROUND GRID */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.045]
            [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)]
            [background-size:42px_42px]
          "
        />

        {/* FLOATING GLOWS */}

        <motion.div
          animate={{
            x: [0, 70, -25, 0],
            y: [0, -50, 35, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            -left-40
            top-20
            h-[420px]
            w-[420px]
            rounded-full
            bg-base-300
            opacity-70
            blur-[120px]
          "
        />

        <motion.div
          animate={{
            x: [0, -60, 30, 0],
            y: [0, 60, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            -right-32
            top-48
            h-[440px]
            w-[440px]
            rounded-full
            bg-base-300
            opacity-60
            blur-[130px]
          "
        />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
          }}
          className="
            mx-auto
            grid
            min-h-[calc(100vh-4rem)]
            max-w-7xl
            items-center
            gap-16
            px-5
            py-20
            lg:grid-cols-[0.9fr_1.1fr]
            lg:px-8
          "
        >
          {/* ==================== HERO COPY ==================== */}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 max-w-xl"
          >
            <motion.div
              variants={revealVariants}
              whileHover={{
                scale: 1.03,
              }}
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-base-300
                bg-base-100/80
                px-4
                py-2
                text-xs
                font-bold
                tracking-wide
                shadow-sm
                backdrop-blur-xl
              "
            >
              <motion.span
                animate={{
                  rotate: [0, 10, -8, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                <Sparkles size={14} />
              </motion.span>

              YOUR CLOUD. YOUR CONTROL.
            </motion.div>

            <motion.h1
              variants={revealVariants}
              className="
                text-5xl
                font-black
                leading-[0.94]
                tracking-[-0.055em]
                sm:text-6xl
                lg:text-7xl
              "
            >
              Your files.

              <motion.span
                initial={{
                  opacity: 0.15,
                }}
                animate={{
                  opacity: [
                    0.35,
                    0.65,
                    0.35,
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="block"
              >
                Smarter. Safer.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={revealVariants}
              className="
                mt-7
                max-w-lg
                text-base
                leading-7
                opacity-60
                sm:text-lg
              "
            >
              Store, organize, search and
              share your files from one
              powerful workspace. Orivox
              gives you modern cloud
              storage without unnecessary
              complexity.
            </motion.p>

            <motion.div
              variants={revealVariants}
              className="mt-8 flex flex-wrap gap-3"
            >
              <motion.div
                whileHover={{
                  y: -3,
                  scale: 1.03,
                }}
                whileTap={{
                  scale: 0.97,
                }}
              >
                <Link
                  href="/register"
                  className="btn btn-neutral rounded-xl px-6 shadow-lg"
                >
                  Start for free
                  <ArrowRight
                    size={17}
                  />
                </Link>
              </motion.div>

              <motion.a
                href="#features"
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="btn btn-outline rounded-xl px-6"
              >
                Explore Orivox
                <ChevronRight
                  size={16}
                />
              </motion.a>
            </motion.div>

            <motion.div
              variants={revealVariants}
              className="
                mt-10
                flex
                flex-wrap
                gap-x-6
                gap-y-3
                text-sm
                opacity-55
              "
            >
              {[
                "Secure uploads",
                "Granular sharing",
                "Smart search",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-base-200">
                    <Check
                      size={11}
                    />
                  </span>

                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ==================== HERO VISUAL ==================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: 70,
              rotateY: -8,
            }}
            animate={{
              opacity: 1,
              x: 0,
              rotateY: 0,
            }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10"
          >
            {/* DASHBOARD */}

            <motion.div
              animate={{
                y: [0, -9, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{
                scale: 1.015,
                rotateX: 1,
                rotateY: -1,
              }}
              className="
                relative
                overflow-hidden
                rounded-[2rem]
                border
                border-base-300
                bg-neutral
                shadow-2xl
              "
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/[0.025] to-white/[0.08]" />

              <Image
                src={HERO_IMAGE}
                alt="Orivox cloud storage dashboard preview"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </motion.div>

            {/* FLOATING CARD — SECURITY */}

            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [
                  -1,
                  1,
                  -1,
                ],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -left-5
                -top-7
                hidden
                items-center
                gap-3
                rounded-2xl
                border
                border-base-300
                bg-base-100/90
                p-3
                shadow-xl
                backdrop-blur-xl
                sm:flex
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-content text-base-100">
                <ShieldCheck
                  size={18}
                />
              </div>

              <div>
                <p className="text-xs font-bold">
                  Secure access
                </p>

                <p className="text-[10px] opacity-40">
                  Permission protected
                </p>
              </div>
            </motion.div>

            {/* FLOATING CARD — UPLOAD */}

            <motion.div
              animate={{
                y: [0, 11, 0],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="
                absolute
                -bottom-7
                right-3
                hidden
                items-center
                gap-3
                rounded-2xl
                border
                border-base-300
                bg-base-100/90
                p-3
                shadow-xl
                backdrop-blur-xl
                sm:flex
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200">
                <UploadCloud
                  size={18}
                />
              </div>

              <div className="min-w-32">
                <div className="flex justify-between text-[10px]">
                  <span className="font-semibold">
                    Uploading
                  </span>
                  <span>
                    82%
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
                  <motion.div
                    initial={{
                      width: "0%",
                    }}
                    animate={{
                      width: "82%",
                    }}
                    transition={{
                      duration: 2,
                      delay: 1,
                    }}
                    className="h-full bg-base-content"
                  />
                </div>
              </div>
            </motion.div>

            {/* FLOATING MINI ICON */}

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                absolute
                -right-5
                top-12
                hidden
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-base-300
                bg-base-100
                shadow-xl
                md:flex
              "
            >
              <Cloud size={19} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* SCROLL INDICATOR */}

        <motion.div
          animate={{
            y: [0, 7, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
          }}
          className="
            absolute
            bottom-8
            left-1/2
            hidden
            -translate-x-1/2
            flex-col
            items-center
            gap-2
            text-[10px]
            uppercase
            tracking-[0.18em]
            opacity-30
            lg:flex
          "
        >
          Scroll

          <div className="h-8 w-px bg-base-content" />
        </motion.div>
      </section>

      {/* =====================================================
          CAPABILITY STRIP
      ===================================================== */}

      <section className="border-y border-base-300 bg-base-200/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {[
            {
              icon: UploadCloud,
              text: "Direct uploads",
            },
            {
              icon: UsersRound,
              text: "Shared workspaces",
            },
            {
              icon: FileSearch,
              text: "Fast search",
            },
            {
              icon: HardDrive,
              text: "Object storage",
            },
          ].map(
            ({
              icon: Icon,
              text,
            }) => (
              <motion.div
                key={text}
                whileHover={{
                  backgroundColor:
                    "var(--color-base-200)",
                }}
                className="flex items-center justify-center gap-2 px-5 py-5 text-sm font-semibold"
              >
                <Icon
                  size={16}
                  className="opacity-55"
                />

                {text}
              </motion.div>
            ),
          )}
        </div>
      </section>

      {/* =====================================================
          FEATURES
      ===================================================== */}

      <section
        id="features"
        className="relative bg-base-100"
      >
        <div className="mx-auto max-w-7xl px-5 py-28 lg:px-8">

          <motion.div
            initial={{
              opacity: 0,
              y: 35,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.25,
            }}
            transition={{
              duration: 0.7,
            }}
            className="max-w-2xl"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40">
              Everything you need
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
              Your entire digital workspace.
            </h2>

            <p className="mt-5 max-w-xl leading-7 opacity-55">
              Built around the things
              that actually matter:
              storing, organizing,
              finding and securely
              sharing your files.
            </p>
          </motion.div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(
              (
                {
                  icon: Icon,
                  title,
                  description,
                },
                index,
              ) => (
                <motion.article
                  key={title}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.25,
                  }}
                  transition={{
                    duration: 0.55,
                    delay:
                      index * 0.08,
                  }}
                  whileHover={{
                    y: -9,
                    scale: 1.015,
                  }}
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    border
                    border-base-300
                    bg-base-100
                    p-6
                    shadow-sm
                  "
                >
                  <motion.div
                    className="
                      absolute
                      -right-12
                      -top-12
                      h-28
                      w-28
                      rounded-full
                      bg-base-200
                      opacity-0
                      blur-2xl
                      transition-opacity
                      group-hover:opacity-100
                    "
                  />

                  <motion.div
                    whileHover={{
                      rotate: -7,
                      scale: 1.08,
                    }}
                    className="
                      relative
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-base-content
                      text-base-100
                    "
                  >
                    <Icon
                      size={20}
                    />
                  </motion.div>

                  <h3 className="relative mt-6 text-lg font-bold">
                    {title}
                  </h3>

                  <p className="relative mt-3 text-sm leading-6 opacity-55">
                    {description}
                  </p>

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    whileInView={{
                      width: "100%",
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      duration: 0.9,
                      delay:
                        0.2 +
                        index * 0.08,
                    }}
                    className="absolute bottom-0 left-0 h-px bg-base-content opacity-20"
                  />
                </motion.article>
              ),
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW
      ===================================================== */}

      <section
        id="workflow"
        className="border-y border-base-300 bg-base-200/45"
      >
        <div className="mx-auto max-w-7xl px-5 py-28 lg:px-8">

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-xs font-bold">
              <Zap size={14} />
              SIMPLE BY DESIGN
            </div>

            <h2 className="mt-5 text-4xl font-black tracking-[-0.035em] sm:text-5xl">
              From upload to sharing in seconds.
            </h2>
          </motion.div>

          <div className="relative mt-16 grid gap-5 md:grid-cols-4">

            {/* CONNECTOR */}

            <motion.div
              initial={{
                scaleX: 0,
              }}
              whileInView={{
                scaleX: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.2,
              }}
              className="
                absolute
                left-[12%]
                right-[12%]
                top-10
                hidden
                h-px
                origin-left
                bg-base-content/15
                md:block
              "
            />

            {workflow.map(
              (
                step,
                index,
              ) => {
                const Icon =
                  step.icon;

                return (
                  <motion.article
                    key={
                      step.number
                    }
                    initial={{
                      opacity: 0,
                      y: 35,
                    }}
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay:
                        index * 0.12,
                    }}
                    className="relative z-10"
                  >
                    <motion.div
                      whileHover={{
                        y: -5,
                        scale: 1.04,
                      }}
                      className="
                        mx-auto
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-[1.6rem]
                        border
                        border-base-300
                        bg-base-100
                        shadow-sm
                      "
                    >
                      <Icon
                        size={24}
                      />
                    </motion.div>

                    <div className="mt-6 text-center">
                      <span className="text-xs font-black opacity-25">
                        {
                          step.number
                        }
                      </span>

                      <h3 className="mt-1 font-bold">
                        {
                          step.title
                        }
                      </h3>

                      <p className="mt-2 text-sm leading-6 opacity-50">
                        {
                          step.text
                        }
                      </p>
                    </div>
                  </motion.article>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SECURITY
      ===================================================== */}

      <section
        id="security"
        className="mx-auto max-w-7xl px-5 py-28 lg:px-8"
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.7,
          }}
          className="
            relative
            overflow-hidden
            rounded-[2.5rem]
            bg-neutral
            px-6
            py-16
            text-neutral-content
            sm:px-12
            lg:px-16
          "
        >
          {/* ANIMATED BACKGROUND */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              -right-40
              -top-40
              h-96
              w-96
              rounded-full
              border
              border-neutral-content/10
            "
          />

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 45,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              -right-24
              -top-24
              h-64
              w-64
              rounded-full
              border
              border-neutral-content/10
            "
          />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div className="max-w-2xl">
              <motion.div
                whileHover={{
                  rotate: -8,
                  scale: 1.08,
                }}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-content text-neutral"
              >
                <LockKeyhole
                  size={24}
                />
              </motion.div>

              <h2 className="mt-7 text-3xl font-black tracking-tight sm:text-4xl">
                Your files stay under your control.
              </h2>

              <p className="mt-5 max-w-xl leading-7 opacity-60">
                Authentication,
                per-device sessions,
                permission-aware sharing,
                expiring public links and
                controlled storage access
                are built into Orivox.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Viewer & editor permissions",
                "Per-device sessions",
                "Secure public links",
                "Protected object storage",
              ].map(
                (
                  item,
                  index,
                ) => (
                  <motion.div
                    key={item}
                    initial={{
                      opacity: 0,
                      x: 30,
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                    }}
                    viewport={{
                      once: true,
                    }}
                    transition={{
                      delay:
                        index *
                        0.08,
                    }}
                    whileHover={{
                      x: 5,
                    }}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-neutral-content/10
                      bg-neutral-content/5
                      p-4
                    "
                  >
                    <ShieldCheck
                      size={18}
                    />

                    <span className="text-sm font-semibold">
                      {item}
                    </span>
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="relative overflow-hidden border-t border-base-300 bg-base-200/40">
        <motion.div
          animate={{
            x: [
              "-10%",
              "10%",
              "-10%",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            pointer-events-none
            absolute
            left-1/4
            top-0
            h-72
            w-1/2
            rounded-full
            bg-base-300
            opacity-50
            blur-[100px]
          "
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="relative mx-auto max-w-4xl px-5 py-28 text-center"
        >
          <motion.div
            animate={{
              rotate: [
                0,
                5,
                -5,
                0,
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-content text-base-100"
          >
            <Cloud size={24} />
          </motion.div>

          <h2 className="mt-7 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Your cloud starts here.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 opacity-55">
            Create your workspace,
            upload your files and start
            organizing everything with
            Orivox.
          </p>

          <motion.div
            whileHover={{
              y: -4,
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="mt-8 inline-block"
          >
            <Link
              href="/register"
              className="btn btn-neutral rounded-xl px-7"
            >
              Create your workspace
              <ArrowRight
                size={17}
              />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        id="about"
        className="border-t border-base-300"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-content text-base-100">
                <Cloud size={15} />
              </div>

              <span className="font-black">
                Orivox
              </span>
            </div>

            <p className="mt-2 text-xs opacity-40">
              Secure cloud storage,
              built for simplicity.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm opacity-50">
            <a
              href="#features"
              className="transition hover:opacity-100"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="transition hover:opacity-100"
            >
              Workflow
            </a>

            <a
              href="#security"
              className="transition hover:opacity-100"
            >
              Security
            </a>

            <Link
              href="/login"
              className="transition hover:opacity-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}