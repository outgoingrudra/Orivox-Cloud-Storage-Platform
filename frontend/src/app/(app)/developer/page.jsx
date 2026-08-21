"use client";

import { useState } from "react";

import {
  AlertTriangle,
  Check,
  Clipboard,
  CloudUpload,
  Code2,
  FileDown,
  Files,
  KeyRound,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Terminal,
  Trash2,
  Zap,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  useDeveloperKeys,
  useRevokeDeveloperKey,
} from "@/components/features/developer/useDeveloperKeys";

import CreateApiKeyModal from "@/components/features/developer/components/CreateApiKeyModal";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/developer/files",
    title: "List files",
    description: "List files stored inside your developer uploads space.",
  },
  {
    method: "POST",
    path: "/api/v1/developer/files",
    title: "Initiate upload",
    description: "Create an upload reservation and receive a presigned upload URL.",
  },
  {
    method: "POST",
    path: "/api/v1/developer/files/:reservationId/confirm",
    title: "Confirm upload",
    description: "Finalize the file after it has been uploaded to object storage.",
  },
  {
    method: "GET",
    path: "/api/v1/developer/files/:fileId",
    title: "Download file",
    description: "Receive a secure temporary download URL.",
  },
  {
    method: "DELETE",
    path: "/api/v1/developer/files/:fileId",
    title: "Delete file",
    description: "Permanently delete a developer-managed file.",
  },
];

export default function DeveloperPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [copied, setCopied] = useState("");

  const {
    data: keys = [],
    isLoading,
    isError,
    error,
  } = useDeveloperKeys();

  const revokeMutation = useRevokeDeveloperKey();

  const activeKeys = keys.filter((key) => !key.revokedAt);

  async function copy(text, id) {
    await navigator.clipboard.writeText(text);
    setCopied(id);

    setTimeout(() => setCopied(""), 1500);
  }

  async function handleRevoke(key) {
    const confirmed = window.confirm(
      `Revoke API key "${key.name}"? Applications using it will immediately lose access.`,
    );

    if (!confirmed) return;

    try {
      await revokeMutation.mutateAsync(key.id);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to revoke API key.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">

      {/* ==================== HEADER ==================== */}

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
              <Code2 size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                Developer Zone
              </h1>

              <p className="mt-1 text-sm opacity-45">
                Use Orivox storage directly from your applications.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          disabled={activeKeys.length >= 1}
          className="btn btn-neutral rounded-xl"
        >
          <Plus size={16} />
          Create API key
        </button>
      </motion.div>

      {/* ==================== PLAN ==================== */}

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Zap}
          label="Monthly API calls"
          value="1,000"
          text="Free developer quota"
        />

        <StatCard
          icon={KeyRound}
          label="API keys"
          value={`${activeKeys.length} / 1`}
          text="Active keys on free plan"
        />

        <StatCard
          icon={Files}
          label="Developer storage"
          value="/uploads"
          text="All API files stay here"
        />
      </div>

      {/* ==================== API KEYS ==================== */}

      <section className="mt-8 rounded-3xl border border-base-300 bg-base-100 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <KeyRound size={19} />

          <div>
            <h2 className="font-bold">
              API Keys
            </h2>

            <p className="mt-0.5 text-xs opacity-45">
              API keys authenticate external applications.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-36 items-center justify-center">
            <LoaderCircle
              size={24}
              className="animate-spin opacity-40"
            />
          </div>
        ) : isError ? (
          <div className="alert alert-error mt-5 rounded-xl">
            {error?.response?.data?.message ||
              "Unable to load API keys."}
          </div>
        ) : keys.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-base-300 p-8 text-center">
            <KeyRound
              size={26}
              className="mx-auto opacity-25"
            />

            <p className="mt-3 font-semibold">
              No API keys
            </p>

            <p className="mt-1 text-xs opacity-45">
              Create a key to start using the Developer API.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-4 rounded-2xl border border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">
                      {key.name}
                    </p>

                    <span
                      className={`badge badge-sm ${
                        key.revokedAt
                          ? "badge-error"
                          : "badge-success"
                      }`}
                    >
                      {key.revokedAt ? "Revoked" : "Active"}
                    </span>
                  </div>

                  <code className="mt-1 block text-xs opacity-45">
                    {key.keyPrefix}••••••••••••
                  </code>

                  <p className="mt-2 text-[11px] opacity-35">
                    Last used:{" "}
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleString()
                      : "Never"}
                  </p>
                </div>

                {!key.revokedAt && (
                  <button
                    type="button"
                    onClick={() => handleRevoke(key)}
                    disabled={revokeMutation.isPending}
                    className="btn btn-ghost btn-sm rounded-xl text-error"
                  >
                    <Trash2 size={15} />
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== AUTH ==================== */}

      <section className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl bg-neutral p-6 text-neutral-content">
          <ShieldCheck size={24} />

          <h2 className="mt-5 text-xl font-bold">
            Authentication
          </h2>

          <p className="mt-2 text-sm leading-6 opacity-60">
            Send your API key using the Authorization header on every
            Developer API request.
          </p>

          <div className="mt-5 rounded-2xl bg-neutral-content/10 p-4">
            <code className="break-all text-xs">
              Authorization: Bearer orvx_live_xxxxxxxxx
            </code>
          </div>

          <p className="mt-4 text-xs leading-5 opacity-45">
            Never expose API keys in browser-side code or commit them
            to Git.
          </p>
        </div>

        {/* ==================== QUICK START ==================== */}

        <div className="rounded-3xl border border-base-300 bg-base-100 p-6">
          <div className="flex items-center gap-2">
            <Terminal size={18} />
            <h2 className="font-bold">
              Quick start
            </h2>
          </div>

          <p className="mt-2 text-sm opacity-45">
            List developer files using JavaScript.
          </p>

          <CodeBlock
            id="quickstart"
            copied={copied}
            onCopy={copy}
            code={`const response = await fetch(
  "https://YOUR_API/api/v1/developer/files",
  {
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
    },
  }
);

const result = await response.json();
console.log(result);`}
          />
        </div>
      </section>

      {/* ==================== UPLOAD FLOW ==================== */}

      <section className="mt-8 rounded-3xl border border-base-300 bg-base-100 p-6">
        <div className="flex items-center gap-3">
          <CloudUpload size={20} />

          <div>
            <h2 className="font-bold">
              Upload flow
            </h2>

            <p className="mt-0.5 text-xs opacity-45">
              Files upload directly to object storage.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Step
            number="01"
            title="Initiate"
            text="Send filename, MIME type and size to Orivox."
          />

          <Step
            number="02"
            title="Upload"
            text="PUT the file directly to the returned presigned URL."
          />

          <Step
            number="03"
            title="Confirm"
            text="Confirm the reservation so Orivox finalizes the file."
          />
        </div>
      </section>

      {/* ==================== ENDPOINTS ==================== */}

      <section className="mt-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-40">
            API Reference
          </p>

          <h2 className="mt-2 text-2xl font-black">
            File endpoints
          </h2>

          <p className="mt-2 text-sm opacity-45">
            Developer API access is intentionally limited to files.
            Folder creation is not available.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {endpoints.map((endpoint) => (
            <motion.div
              key={`${endpoint.method}-${endpoint.path}`}
              whileHover={{ x: 3 }}
              className="rounded-2xl border border-base-300 bg-base-100 p-4"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <span className="badge badge-neutral w-20">
                  {endpoint.method}
                </span>

                <code className="min-w-0 flex-1 break-all text-sm">
                  {endpoint.path}
                </code>

                <button
                  type="button"
                  onClick={() =>
                    copy(
                      endpoint.path,
                      endpoint.path,
                    )
                  }
                  className="btn btn-ghost btn-sm rounded-xl"
                >
                  {copied === endpoint.path ? (
                    <Check size={15} />
                  ) : (
                    <Clipboard size={15} />
                  )}

                  {copied === endpoint.path
                    ? "Copied"
                    : "Copy"}
                </button>
              </div>

              <div className="mt-3 md:ml-[5.75rem]">
                <p className="text-sm font-semibold">
                  {endpoint.title}
                </p>

                <p className="mt-1 text-xs opacity-45">
                  {endpoint.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ==================== LIMITS ==================== */}

      <section className="my-8 rounded-3xl border border-warning/20 bg-warning/5 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <h2 className="font-bold">
              Free Developer Plan
            </h2>

            <p className="mt-2 text-sm leading-6 opacity-55">
              The current free plan allows 1 API key and 1,000
              Developer API calls per month. Developer files share
              the same Orivox storage quota as your normal workspace.
            </p>
          </div>
        </div>
      </section>

      <CreateApiKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  text,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-base-300 bg-base-100 p-5"
    >
      <Icon size={18} className="opacity-45" />

      <p className="mt-4 text-xs font-semibold opacity-40">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs opacity-40">
        {text}
      </p>
    </motion.div>
  );
}

function Step({
  number,
  title,
  text,
}) {
  return (
    <div className="rounded-2xl bg-base-200/60 p-4">
      <span className="text-xs font-black opacity-25">
        {number}
      </span>

      <h3 className="mt-2 font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 opacity-45">
        {text}
      </p>
    </div>
  );
}

function CodeBlock({
  code,
  id,
  copied,
  onCopy,
}) {
  return (
    <div className="relative mt-5 rounded-2xl bg-neutral p-4 text-neutral-content">
      <button
        type="button"
        onClick={() => onCopy(code, id)}
        className="btn btn-ghost btn-xs absolute right-2 top-2 text-neutral-content"
      >
        {copied === id ? (
          <Check size={14} />
        ) : (
          <Clipboard size={14} />
        )}
      </button>

      <pre className="overflow-x-auto pr-8 text-xs leading-6">
        <code>{code}</code>
      </pre>
    </div>
  );
}