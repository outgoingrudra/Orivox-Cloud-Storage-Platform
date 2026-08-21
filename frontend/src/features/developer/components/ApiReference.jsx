"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  FileDown,
  Files,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/developer/files",
    title: "List files",
    description:
      "Retrieve the files stored in your developer uploads space.",
    icon: Files,
    code: `const response = await fetch(
  "https://YOUR_API/api/v1/developer/files",
  {
    headers: {
      Authorization: "Bearer YOUR_API_KEY"
    }
  }
);

const data = await response.json();`,
  },
  {
    method: "POST",
    path: "/api/v1/developer/files",
    title: "Start an upload",
    description:
      "Create an upload reservation and receive a secure presigned upload URL.",
    icon: UploadCloud,
    code: `const response = await fetch(
  "https://YOUR_API/api/v1/developer/files",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_API_KEY"
    },
    body: JSON.stringify({
      fileName: "report.pdf",
      mimeType: "application/pdf",
      size: 245760
    })
  }
);

const data = await response.json();`,
  },
  {
    method: "POST",
    path: "/api/v1/developer/files/:reservationId/confirm",
    title: "Confirm upload",
    description:
      "Finalize the upload after the file has been sent to the presigned URL.",
    icon: Check,
    code: `const response = await fetch(
  "https://YOUR_API/api/v1/developer/files/RESERVATION_ID/confirm",
  {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_API_KEY"
    }
  }
);

const data = await response.json();`,
  },
  {
    method: "GET",
    path: "/api/v1/developer/files/:fileId",
    title: "Download file",
    description:
      "Generate a temporary secure download URL for a developer-managed file.",
    icon: FileDown,
    code: `const response = await fetch(
  "https://YOUR_API/api/v1/developer/files/FILE_ID",
  {
    headers: {
      Authorization: "Bearer YOUR_API_KEY"
    }
  }
);

const data = await response.json();`,
  },
  {
    method: "DELETE",
    path: "/api/v1/developer/files/:fileId",
    title: "Delete file",
    description:
      "Permanently delete a file managed through the Developer API.",
    icon: Trash2,
    code: `await fetch(
  "https://YOUR_API/api/v1/developer/files/FILE_ID",
  {
    method: "DELETE",
    headers: {
      Authorization: "Bearer YOUR_API_KEY"
    }
  }
);`,
  },
];

function MethodBadge({ method }) {
  const styles = {
    GET: "bg-info/10 text-info border-info/20",
    POST: "bg-success/10 text-success border-success/20",
    DELETE: "bg-error/10 text-error border-error/20",
  };

  return (
    <span
      className={`inline-flex w-[72px] justify-center rounded-lg border px-2 py-1.5 text-[11px] font-black tracking-wide ${styles[method]}`}
    >
      {method}
    </span>
  );
}

export default function ApiReference() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState("");

  const endpoint = endpoints[active];
  const Icon = endpoint.icon;

  async function copy(text, id) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  }

  return (
    <section className="mt-10 overflow-hidden rounded-3xl border border-base-300 bg-base-100">
      {/* HEADER */}
      <div className="border-b border-base-300 px-5 py-6 sm:px-7">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] opacity-40">
          <Code2 size={15} />
          API Reference
        </div>

        <h2 className="mt-3 text-2xl font-black tracking-tight">
          File API
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 opacity-50">
          Everything you need to store, retrieve and delete files
          programmatically using Orivox.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-base-200 px-3 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="font-semibold">Base URL</span>
          <code className="opacity-55">
            /api/v1/developer
          </code>
        </div>
      </div>

      {/* DOCS LAYOUT */}
      <div className="grid lg:grid-cols-[320px_1fr]">
        {/* ENDPOINT NAVIGATION */}
        <aside className="border-b border-base-300 bg-base-200/30 p-3 lg:border-b-0 lg:border-r">
          <p className="px-3 pb-3 pt-2 text-[10px] font-black uppercase tracking-[0.18em] opacity-35">
            File endpoints
          </p>

          <div className="space-y-1">
            {endpoints.map((item, index) => (
              <motion.button
                key={`${item.method}-${item.path}`}
                type="button"
                whileTap={{ scale: 0.985 }}
                onClick={() => setActive(index)}
                className={`w-full rounded-xl p-3 text-left transition ${
                  active === index
                    ? "bg-base-100 shadow-sm ring-1 ring-base-300"
                    : "hover:bg-base-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <MethodBadge method={item.method} />

                  <span className="truncate text-sm font-bold">
                    {item.title}
                  </span>
                </div>

                <code className="mt-2 block truncate pl-[84px] text-[10px] opacity-35">
                  {item.path}
                </code>
              </motion.button>
            ))}
          </div>

          <div className="mx-2 mt-5 rounded-xl border border-base-300 bg-base-100 p-4">
            <p className="text-xs font-bold">
              Files only
            </p>

            <p className="mt-1 text-[11px] leading-5 opacity-45">
              Developer API access does not allow folder creation.
              Files are automatically managed inside your{" "}
              <code className="font-bold">/uploads</code> space.
            </p>
          </div>
        </aside>

        {/* DOCUMENTATION */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${endpoint.method}-${endpoint.path}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="min-w-0 p-5 sm:p-7"
          >
            {/* TITLE */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-200">
                <Icon size={19} />
              </div>

              <div>
                <h3 className="text-xl font-black">
                  {endpoint.title}
                </h3>

                <p className="mt-1 max-w-xl text-sm leading-6 opacity-50">
                  {endpoint.description}
                </p>
              </div>
            </div>

            {/* ROUTE */}
            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-35">
                Endpoint
              </p>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-base-300 bg-base-200/40 p-3">
                <MethodBadge method={endpoint.method} />

                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs font-semibold">
                  {endpoint.path}
                </code>

                <button
                  type="button"
                  onClick={() =>
                    copy(endpoint.path, "path")
                  }
                  className="btn btn-ghost btn-circle btn-sm shrink-0"
                  aria-label="Copy endpoint"
                >
                  {copied === "path" ? (
                    <Check size={15} />
                  ) : (
                    <Clipboard size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* AUTH */}
            <div className="mt-7">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-35">
                Authentication
              </p>

              <div className="mt-2 rounded-xl border border-base-300 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold">
                      Authorization
                    </p>

                    <p className="mt-1 text-xs opacity-45">
                      Bearer API key
                    </p>
                  </div>

                  <span className="badge badge-success badge-sm">
                    Required
                  </span>
                </div>
              </div>
            </div>

            {/* EXAMPLE */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-35">
                  JavaScript example
                </p>

                <span className="text-[10px] opacity-35">
                  fetch
                </span>
              </div>

              <div className="relative mt-2 overflow-hidden rounded-2xl bg-neutral text-neutral-content shadow-xl">
                {/* FAKE CODE EDITOR HEADER */}
                <div className="flex items-center justify-between border-b border-neutral-content/10 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-content/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-content/20" />
                    <span className="h-2.5 w-2.5 rounded-full bg-neutral-content/20" />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copy(endpoint.code, "code")
                    }
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] opacity-60 transition hover:bg-neutral-content/10 hover:opacity-100"
                  >
                    {copied === "code" ? (
                      <Check size={13} />
                    ) : (
                      <Clipboard size={13} />
                    )}

                    {copied === "code"
                      ? "Copied"
                      : "Copy"}
                  </button>
                </div>

                <pre className="overflow-x-auto p-5 text-xs leading-6">
                  <code>{endpoint.code}</code>
                </pre>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}