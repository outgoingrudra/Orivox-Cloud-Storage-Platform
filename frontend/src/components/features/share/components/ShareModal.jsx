"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  Copy,
  Link2,
  LoaderCircle,
  Mail,
  Share2,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useSelector } from "react-redux";

import { useShareItem } from "@/components/features/share/useShareItem";
import { useItemAccess } from "@/components/features/share/useItemAccess";
import { useUpdateSharePermission } from "@/components/features/share/useUpdateSharePermission";
import { useRevokeShare } from "@/components/features/share/useRevokeShare";

import { useShareLinks } from "@/components/features/share/useShareLinks";
import { useCreateShareLink } from "@/components/features/share/useCreateShareLink";
import { useRevokeShareLink } from "@/components/features/share/useRevokeShareLink";

export default function ShareModal({
  open,
  onClose,
  item,
  type,
}) {
  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const [email, setEmail] =
    useState("");

  const [permission, setPermission] =
    useState("VIEWER");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [publicUrl, setPublicUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  // ==================== MUTATIONS ====================

  const shareMutation =
    useShareItem();

  const updatePermissionMutation =
    useUpdateSharePermission();

  const revokeMutation =
    useRevokeShare();

  const createLinkMutation =
    useCreateShareLink();

  const revokeLinkMutation =
    useRevokeShareLink();

  // ==================== ACCESS QUERY ====================

  const {
    data: accessData,
    isLoading: accessLoading,
    isError: accessError,
    error: accessRequestError,
  } = useItemAccess({
    type,
    itemId: item?.id,
    enabled: open,
  });

  /*
    Backend returns:

    {
      success: true,
      data: [...]
    }
  */

  const shares =
    Array.isArray(accessData?.data)
      ? accessData.data
      : [];

  const owner = currentUser;

  // ==================== PUBLIC LINKS QUERY ====================

  const {
    data: linksData,
    isLoading: linksLoading,
    isError: linksError,
    error: linksRequestError,
  } = useShareLinks({
    type,
    itemId: item?.id,
    enabled: open,
  });

  const shareLinks =
    Array.isArray(linksData?.data)
      ? linksData.data
      : [];

  const activeLink =
    shareLinks.find(
      (link) => !link.revokedAt
    ) || null;

  // ==================== BUSY ====================

  const busy =
    shareMutation.isPending ||
    updatePermissionMutation.isPending ||
    revokeMutation.isPending ||
    createLinkMutation.isPending ||
    revokeLinkMutation.isPending;

  // ==================== RESET ====================

  useEffect(() => {
    if (!open) return;

    setEmail("");
    setPermission("VIEWER");
    setError("");
    setSuccess("");
    setPublicUrl("");
    setCopied(false);
  }, [open, item?.id]);

  // ==================== TITLE ====================

  const title = useMemo(() => {
    if (!item) return "";

    return `Share "${item.name}"`;
  }, [item]);

  // ==================== CLOSE ====================

  function handleClose() {
    if (busy) return;

    onClose();
  }

  // ==================== SHARE USER ====================

  async function handleShare(event) {
    event.preventDefault();

    if (
      !item ||
      shareMutation.isPending
    ) {
      return;
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    setError("");
    setSuccess("");

    if (!normalizedEmail) {
      setError(
        "Enter an email address."
      );

      return;
    }

    if (
      normalizedEmail ===
      currentUser?.email?.toLowerCase()
    ) {
      setError(
        "You cannot share an item with yourself."
      );

      return;
    }

    try {
      await shareMutation.mutateAsync({
        type,
        itemId: item.id,
        email: normalizedEmail,
        permission,
      });

      setEmail("");
      setPermission("VIEWER");

      setSuccess(
        "Access granted successfully."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to share ${type}.`
      );
    }
  }

  // ==================== UPDATE PERMISSION ====================

  async function handlePermissionChange(
    share,
    nextPermission
  ) {
    if (
      updatePermissionMutation.isPending
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await updatePermissionMutation.mutateAsync({
        type,
        itemId: item.id,
        shareId: share.id,
        permission: nextPermission,
      });

      setSuccess(
        "Permission updated."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update permission."
      );
    }
  }

  // ==================== REVOKE DIRECT ACCESS ====================

  async function handleRevoke(share) {
    if (
      revokeMutation.isPending
    ) {
      return;
    }

    const name =
      share.sharedWith?.name ||
      share.user?.name ||
      share.sharedWith?.email ||
      "this user";

    const confirmed =
      window.confirm(
        `Remove access for ${name}?`
      );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await revokeMutation.mutateAsync({
        type,
        itemId: item.id,
        shareId: share.id,
      });

      setSuccess(
        "Access removed."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to remove access."
      );
    }
  }

  // ==================== CREATE PUBLIC LINK ====================

  async function handleCreateLink() {
    if (
      !item ||
      createLinkMutation.isPending
    ) {
      return;
    }

    setError("");
    setSuccess("");
    setCopied(false);

    try {
      const response =
        await createLinkMutation.mutateAsync({
          type,
          itemId: item.id,
        });

      const token =
        response?.data?.token;

      if (!token) {
        throw new Error(
          "Share token missing"
        );
      }

      const path =
        type === "file"
          ? `/shared/public/file/${token}`
          : `/shared/public/folder/${token}`;

      const url =
        `${window.location.origin}${path}`;

      setPublicUrl(url);

      setSuccess(
        "Public share link created."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to create public link."
      );
    }
  }

  // ==================== COPY PUBLIC LINK ====================

  async function handleCopyLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(
        publicUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setError(
        "Unable to copy the link."
      );
    }
  }

  // ==================== REVOKE PUBLIC LINK ====================

  async function handleRevokeLink() {
    if (
      !activeLink ||
      revokeLinkMutation.isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Revoke this public share link?"
      );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await revokeLinkMutation.mutateAsync({
        type,
        itemId: item.id,
        linkId: activeLink.id,
      });

      setPublicUrl("");

      setSuccess(
        "Public share link revoked."
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to revoke public link."
      );
    }
  }

  return (
    <AnimatePresence>
      {open && item && (
        <>
          {/* ==================== BACKDROP ==================== */}

          <motion.button
            type="button"
            aria-label="Close share dialog"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={
              handleClose
            }
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm"
          />

          {/* ==================== MODAL ==================== */}

          <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto px-4 py-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.92,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.96,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              className="w-full max-w-xl rounded-[1.75rem] border border-base-300 bg-base-100 p-6 shadow-2xl"
            >
              {/* ==================== HEADER ==================== */}

              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <motion.div
                    whileHover={{
                      rotate: -5,
                      scale: 1.06,
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-base-content text-base-100"
                  >
                    <Share2
                      size={19}
                    />
                  </motion.div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">
                      {title}
                    </h2>

                    <p className="mt-0.5 text-xs opacity-45">
                      Manage who can
                      access this {type}.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleClose
                  }
                  disabled={busy}
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ==================== SHARE FORM ==================== */}

              <form
                onSubmit={
                  handleShare
                }
                className="mt-6"
              >
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] opacity-35">
                  Share with someone
                </p>

                <div className="grid gap-2 sm:grid-cols-[1fr_130px_auto]">
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 opacity-35"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(
                        event
                      ) => {
                        setEmail(
                          event.target
                            .value
                        );

                        setError("");
                        setSuccess("");
                      }}
                      disabled={busy}
                      placeholder="user@example.com"
                      className="input input-bordered w-full rounded-xl pl-11"
                    />
                  </div>

                  <select
                    value={
                      permission
                    }
                    onChange={(
                      event
                    ) =>
                      setPermission(
                        event.target
                          .value
                      )
                    }
                    disabled={busy}
                    className="select select-bordered w-full rounded-xl"
                  >
                    <option value="VIEWER">
                      Viewer
                    </option>

                    <option value="EDITOR">
                      Editor
                    </option>
                  </select>

                  <motion.button
                    type="submit"
                    disabled={
                      busy ||
                      !email.trim()
                    }
                    whileHover={
                      busy
                        ? {}
                        : {
                            y: -2,
                            scale: 1.02,
                          }
                    }
                    whileTap={
                      busy
                        ? {}
                        : {
                            scale: 0.97,
                          }
                    }
                    className="btn btn-neutral rounded-xl"
                  >
                    {shareMutation.isPending ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Share2
                        size={16}
                      />
                    )}

                    Share
                  </motion.button>
                </div>
              </form>

              {/* ==================== STATUS ==================== */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    x: -8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="alert alert-error mt-4 rounded-xl text-sm"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-4 flex items-center gap-2 text-sm font-medium"
                >
                  <Check
                    size={16}
                  />

                  {success}
                </motion.div>
              )}

              {/* ==================== PEOPLE WITH ACCESS ==================== */}

              <div className="mt-7">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users
                      size={17}
                    />

                    <h3 className="text-sm font-bold">
                      People with access
                    </h3>
                  </div>

                  {!accessLoading &&
                    !accessError && (
                      <span className="text-xs opacity-35">
                        {shares.length +
                          1}{" "}
                        {shares.length +
                          1 ===
                        1
                          ? "person"
                          : "people"}
                      </span>
                    )}
                </div>

                {/* ==================== ACCESS LOADING ==================== */}

                {accessLoading && (
                  <div className="mt-3 flex min-h-28 items-center justify-center rounded-2xl border border-base-300">
                    <LoaderCircle
                      size={21}
                      className="animate-spin opacity-40"
                    />
                  </div>
                )}

                {/* ==================== ACCESS ERROR ==================== */}

                {accessError && (
                  <div className="alert alert-error mt-3 rounded-xl text-sm">
                    {accessRequestError
                      ?.response?.data
                      ?.message ||
                      "Unable to load access information."}
                  </div>
                )}

                {!accessLoading &&
                  !accessError && (
                    <div className="mt-3 space-y-2">
                      {/* ==================== OWNER ==================== */}

                      <div className="flex items-center gap-3 rounded-xl border border-base-300 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-content text-sm font-bold text-base-100">
                          {owner?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "O"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold">
                              {owner?.name ||
                                "Owner"}
                            </p>

                            {owner?.id ===
                              currentUser?.id && (
                              <span className="text-[11px] opacity-35">
                                You
                              </span>
                            )}
                          </div>

                          <p className="truncate text-xs opacity-40">
                            {owner?.email ||
                              currentUser?.email}
                          </p>
                        </div>

                        <span className="badge badge-neutral badge-sm">
                          Owner
                        </span>
                      </div>

                      {/* ==================== SHARED USERS ==================== */}

                      {shares.map(
                        (share) => {
                          const person =
                            share.sharedWith ||
                            share.user ||
                            {};

                          const updating =
                            updatePermissionMutation.isPending &&
                            updatePermissionMutation
                              .variables
                              ?.shareId ===
                              share.id;

                          const revoking =
                            revokeMutation.isPending &&
                            revokeMutation
                              .variables
                              ?.shareId ===
                              share.id;

                          return (
                            <motion.div
                              key={
                                share.id
                              }
                              initial={{
                                opacity: 0,
                                y: 6,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              className="flex flex-col gap-3 rounded-xl border border-base-300 p-3 sm:flex-row sm:items-center"
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-200">
                                  <UserRound
                                    size={
                                      17
                                    }
                                  />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">
                                    {person.name ||
                                      person.email ||
                                      "Orivox user"}
                                  </p>

                                  <p className="truncate text-xs opacity-40">
                                    {person.email ||
                                      ""}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <select
                                  value={
                                    share.permission
                                  }
                                  disabled={
                                    updating ||
                                    revoking ||
                                    (busy &&
                                      !updating)
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    handlePermissionChange(
                                      share,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="select select-bordered select-sm rounded-lg"
                                >
                                  <option value="VIEWER">
                                    Viewer
                                  </option>

                                  <option value="EDITOR">
                                    Editor
                                  </option>
                                </select>

                                <motion.button
                                  type="button"
                                  whileHover={{
                                    scale: 1.06,
                                  }}
                                  whileTap={{
                                    scale: 0.94,
                                  }}
                                  disabled={
                                    busy
                                  }
                                  onClick={() =>
                                    handleRevoke(
                                      share
                                    )
                                  }
                                  className="btn btn-ghost btn-circle btn-sm text-error"
                                  aria-label="Remove access"
                                >
                                  {revoking ? (
                                    <LoaderCircle
                                      size={
                                        15
                                      }
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={
                                        15
                                      }
                                    />
                                  )}
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        }
                      )}

                      {shares.length ===
                        0 && (
                        <div className="rounded-xl border border-dashed border-base-300 px-4 py-6 text-center">
                          <Users
                            size={21}
                            className="mx-auto opacity-25"
                          />

                          <p className="mt-2 text-sm font-semibold">
                            Not shared yet
                          </p>

                          <p className="mt-1 text-xs opacity-40">
                            Only you currently
                            have access.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {/* ==================== GENERAL ACCESS ==================== */}

              <div className="mt-7 border-t border-base-300 pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200">
                    <Link2
                      size={17}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      General access
                    </p>

                    {linksLoading ? (
                      <div className="mt-2 flex items-center gap-2 text-xs opacity-40">
                        <LoaderCircle
                          size={13}
                          className="animate-spin"
                        />

                        Checking public
                        access...
                      </div>
                    ) : linksError ? (
                      <p className="mt-1 text-xs text-error">
                        {linksRequestError
                          ?.response
                          ?.data
                          ?.message ||
                          "Unable to load public links."}
                      </p>
                    ) : activeLink ? (
                      <div className="mt-1">
                        <p className="text-xs leading-5 opacity-50">
                          Anyone with the
                          public link can
                          access this {type}.
                        </p>

                        {activeLink.expiresAt && (
                          <p className="mt-1 text-[11px] opacity-35">
                            Expires{" "}
                            {new Date(
                              activeLink.expiresAt
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs leading-5 opacity-45">
                        This {type} is
                        private unless
                        explicitly shared
                        with another Orivox
                        user.
                      </p>
                    )}
                  </div>
                </div>

                {!linksLoading &&
                  !linksError && (
                    <div className="mt-4">
                      {!activeLink ? (
                        <motion.button
                          type="button"
                          whileHover={{
                            y: -2,
                            scale: 1.02,
                          }}
                          whileTap={{
                            scale: 0.97,
                          }}
                          disabled={
                            createLinkMutation.isPending
                          }
                          onClick={
                            handleCreateLink
                          }
                          className="btn btn-neutral btn-sm w-full rounded-xl"
                        >
                          {createLinkMutation.isPending ? (
                            <>
                              <LoaderCircle
                                size={
                                  15
                                }
                                className="animate-spin"
                              />

                              Creating...
                            </>
                          ) : (
                            <>
                              <Link2
                                size={
                                  15
                                }
                              />

                              Create public
                              link
                            </>
                          )}
                        </motion.button>
                      ) : (
                        <div className="space-y-3">
                          {publicUrl ? (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={
                                  publicUrl
                                }
                                className="input input-bordered input-sm min-w-0 flex-1 rounded-xl"
                              />

                              <motion.button
                                type="button"
                                whileHover={{
                                  scale: 1.04,
                                }}
                                whileTap={{
                                  scale: 0.95,
                                }}
                                onClick={
                                  handleCopyLink
                                }
                                className="btn btn-neutral btn-sm rounded-xl"
                              >
                                {copied ? (
                                  <Check
                                    size={
                                      15
                                    }
                                  />
                                ) : (
                                  <Copy
                                    size={
                                      15
                                    }
                                  />
                                )}

                                {copied
                                  ? "Copied"
                                  : "Copy"}
                              </motion.button>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-base-300 bg-base-200/40 p-3">
                              <p className="text-xs leading-5 opacity-50">
                                A public link
                                already exists.
                                For security,
                                Orivox does not
                                store the
                                original token.
                                Revoke it and
                                create a new
                                link if you need
                                the URL again.
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={
                              revokeLinkMutation.isPending
                            }
                            onClick={
                              handleRevokeLink
                            }
                            className="btn btn-ghost btn-sm w-full rounded-xl text-error"
                          >
                            {revokeLinkMutation.isPending ? (
                              <LoaderCircle
                                size={
                                  15
                                }
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={
                                  15
                                }
                              />
                            )}

                            {revokeLinkMutation.isPending
                              ? "Revoking..."
                              : "Revoke public link"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}