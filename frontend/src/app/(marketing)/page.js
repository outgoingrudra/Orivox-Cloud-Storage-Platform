import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  FolderSearch,
  LockKeyhole,
  Share2,
  UploadCloud,
} from "lucide-react";

const HERO_IMAGE =
  "https://ik.imagekit.io/rudra671/ChatGPT%20Image%20Aug%2018,%202026,%2006_59_27%20PM.png";

const features = [
  {
    icon: LockKeyhole,
    title: "Secure storage",
    description:
      "Keep your files protected with secure authentication and controlled access.",
  },
  {
    icon: UploadCloud,
    title: "Fast uploads",
    description:
      "Upload directly to object storage without routing large files through the API.",
  },
  {
    icon: Share2,
    title: "Powerful sharing",
    description:
      "Share files and folders with viewer or editor permissions and public links.",
  },
  {
    icon: FolderSearch,
    title: "Find anything",
    description:
      "Organize files into folders and quickly search across your entire drive.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-base-100 text-base-content">

      {/* ==================== HERO ==================== */}

      <section className="relative">
        <div
          className="
            mx-auto
            grid
            min-h-[calc(100vh-4rem)]
            max-w-7xl
            items-center
            gap-14
            px-5
            py-16
            lg:grid-cols-[0.9fr_1.1fr]
            lg:px-8
            lg:py-20
          "
        >
          <div className="max-w-xl">
            <div
              className="
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-base-300
                bg-base-200
                px-4
                py-2
                text-xs
                font-semibold
                tracking-wide
              "
            >
              ☁ YOUR CLOUD. YOUR CONTROL.
            </div>

            <h1
              className="
                text-5xl
                font-black
                leading-[0.95]
                tracking-[-0.05em]
                sm:text-6xl
                lg:text-7xl
              "
            >
              Your files.
              <span className="block opacity-50">
                Smarter. Safer.
              </span>
            </h1>

            <p
              className="
                mt-7
                max-w-lg
                text-base
                leading-7
                opacity-65
                sm:text-lg
              "
            >
              Store, organize and share your
              files from one secure workspace.
              Orivox gives you powerful cloud
              storage without unnecessary
              complexity.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="btn btn-neutral rounded-xl px-6"
              >
                Get Started

                <ArrowRight size={17} />
              </Link>

              <a
                href="#features"
                className="btn btn-outline rounded-xl px-6"
              >
                Explore Features
              </a>
            </div>

            <div
              className="
                mt-10
                flex
                flex-wrap
                gap-x-7
                gap-y-3
                text-sm
                opacity-55
              "
            >
              <span>✓ Secure uploads</span>
              <span>✓ Granular sharing</span>
              <span>✓ Smart organization</span>
            </div>
          </div>

          {/* HERO IMAGE */}

          <div className="relative">
            <div
              className="
                absolute
                inset-10
                -z-10
                rounded-full
                bg-base-300
                blur-3xl
              "
            />

            <div
              className="
                overflow-hidden
                rounded-[2rem]
                border
                border-base-300
                bg-neutral
                shadow-2xl
              "
            >
              <Image
                src={HERO_IMAGE}
                alt="Orivox cloud storage dashboard preview"
                width={1536}
                height={1024}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES ==================== */}

      <section
        id="features"
        className="border-y border-base-300 bg-base-200/50"
      >
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-50">
              Everything you need
            </p>

            <h2
              className="
                mt-4
                text-3xl
                font-bold
                tracking-tight
                sm:text-4xl
              "
            >
              Cloud storage without the clutter.
            </h2>

            <p className="mt-4 leading-7 opacity-60">
              Built around the things that
              matter: storing, finding, sharing
              and protecting your files.
            </p>
          </div>

          <div
            className="
              mt-12
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {features.map(
              ({
                icon: Icon,
                title,
                description,
              }) => (
                <article
                  key={title}
                  className="
                    rounded-2xl
                    border
                    border-base-300
                    bg-base-100
                    p-6
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-lg
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      bg-base-content
                      text-base-100
                    "
                  >
                    <Icon size={20} />
                  </div>

                  <h3 className="mt-5 font-bold">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 opacity-60">
                    {description}
                  </p>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* ==================== SECURITY ==================== */}

      <section
        id="security"
        className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
      >
        <div
          className="
            rounded-[2rem]
            bg-neutral
            px-6
            py-14
            text-neutral-content
            sm:px-12
            lg:flex
            lg:items-center
            lg:justify-between
          "
        >
          <div className="max-w-2xl">
            <LockKeyhole
              size={30}
              className="mb-6"
            />

            <h2 className="text-3xl font-bold tracking-tight">
              Your files stay under your control.
            </h2>

            <p className="mt-4 max-w-xl leading-7 opacity-65">
              Secure sessions, permission-aware
              sharing, expiring public links and
              reliable object-storage cleanup are
              built into Orivox.
            </p>
          </div>

          <Link
            href="/register"
            className="
              btn
              mt-8
              rounded-xl
              border-0
              bg-neutral-content
              text-neutral
              hover:bg-neutral-content/90
              lg:mt-0
            "
          >
            Create your workspace

            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}

      <footer
        id="about"
        className="border-t border-base-300"
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-3
            px-5
            py-8
            text-sm
            opacity-60
            sm:flex-row
            sm:items-center
            sm:justify-between
            lg:px-8
          "
        >
          <p className="font-semibold">
            Orivox
          </p>

          <p>
            Secure cloud storage, built for
            simplicity.
          </p>
        </div>
      </footer>
    </main>
  );
}