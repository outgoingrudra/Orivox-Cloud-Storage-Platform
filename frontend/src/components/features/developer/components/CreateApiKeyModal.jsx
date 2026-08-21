"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clipboard,
  KeyRound,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useCreateDeveloperKey } from "../useDeveloperKeys";

export default function CreateApiKeyModal({
  open,
  onClose,
}) {
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const createMutation = useCreateDeveloperKey();

  useEffect(() => {
    if (!open) return;

    setName("");
    setCreatedKey(null);
    setCopied(false);
    setError("");
  }, [open]);

  async function handleCreate(event) {
    event.preventDefault();

    const trimmed = name.trim();

    if (trimmed.length < 2) {
      setError("API key name must contain at least 2 characters.");
      return;
    }

    setError("");

    try {
      const result = await createMutation.mutateAsync(trimmed);
      setCreatedKey(result);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create API key.",
      );
    }
  }

  async function handleCopy() {
    if (!createdKey?.apiKey) return;

    await navigator.clipboard.writeText(createdKey.apiKey);

    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function handleClose() {
    if (createMutation.isPending) return;
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              className="w-full max-w-lg rounded-[1.75rem] border border-base-300 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100">
                    <KeyRound size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Create API key
                    </h2>

                    <p className="mt-0.5 text-xs opacity-45">
                      Authenticate applications with Orivox.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-ghost btn-circle btn-sm"
                >
                  <X size={18} />
                </button>
              </div>

              {!createdKey ? (
                <form onSubmit={handleCreate} className="mt-6">
                  <label className="text-xs font-bold uppercase tracking-wide opacity-45">
                    Key name
                  </label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    autoFocus
                    maxLength={50}
                    placeholder="Production website"
                    className="input input-bordered mt-2 w-full rounded-xl"
                  />

                  {error && (
                    <div className="alert alert-error mt-4 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn btn-ghost rounded-xl"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="btn btn-neutral rounded-xl"
                    >
                      {createMutation.isPending ? (
                        <>
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <KeyRound size={16} />
                          Create key
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4">
                    <p className="text-sm font-bold">
                      Save this key now
                    </p>

                    <p className="mt-1 text-xs leading-5 opacity-55">
                      Orivox stores only its hash. The full API key
                      cannot be displayed again.
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-base-200 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide opacity-40">
                      API Key
                    </p>

                    <code className="mt-2 block break-all text-sm">
                      {createdKey.apiKey}
                    </code>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="btn btn-outline mt-3 w-full rounded-xl"
                  >
                    {copied ? (
                      <>
                        <Check size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Clipboard size={16} />
                        Copy API key
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-neutral mt-3 w-full rounded-xl"
                  >
                    I saved my key
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}