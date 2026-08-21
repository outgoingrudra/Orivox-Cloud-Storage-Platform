"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  X,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { useChangePassword } from "@/features/settings/useChangePassword";

export default function ChangePasswordModal({
  open,
  onClose,
}) {
  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const mutation =
    useChangePassword();

  useEffect(() => {
    if (!open) return;

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  }, [open]);

  function handleClose() {
    if (mutation.isPending) {
      return;
    }

    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (mutation.isPending) {
      return;
    }

    setError("");
    setSuccess(false);

    if (!currentPassword) {
      setError(
        "Current password is required."
      );

      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );

      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setError(
        "New passwords do not match."
      );

      return;
    }

    try {
      await mutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to change password."
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close password dialog"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto px-4 py-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 35,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 20,
                scale: 0.95,
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
              }}
              className="w-full max-w-md rounded-[1.75rem] border border-base-300 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{
                      rotate: -5,
                      scale: 1.06,
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-base-content text-base-100"
                  >
                    <KeyRound size={19} />
                  </motion.div>

                  <div>
                    <h2 className="text-lg font-bold">
                      Change password
                    </h2>

                    <p className="mt-0.5 text-xs opacity-45">
                      Update your Orivox account password.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={
                    mutation.isPending
                  }
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {success ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.92,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 16,
                    }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200"
                  >
                    <CheckCircle2
                      size={26}
                    />
                  </motion.div>

                  <h3 className="mt-5 text-xl font-bold">
                    Password changed
                  </h3>

                  <p className="mt-2 text-sm opacity-50">
                    Your password was updated successfully.
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-neutral mt-6 w-full rounded-xl"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-5"
                >
                  <PasswordInput
                    label="Current password"
                    value={
                      currentPassword
                    }
                    setValue={
                      setCurrentPassword
                    }
                    show={showCurrent}
                    setShow={
                      setShowCurrent
                    }
                    disabled={
                      mutation.isPending
                    }
                  />

                  <PasswordInput
                    label="New password"
                    value={newPassword}
                    setValue={
                      setNewPassword
                    }
                    show={showNew}
                    setShow={setShowNew}
                    disabled={
                      mutation.isPending
                    }
                    placeholder="Minimum 8 characters"
                  />

                  <PasswordInput
                    label="Confirm new password"
                    value={
                      confirmPassword
                    }
                    setValue={
                      setConfirmPassword
                    }
                    show={showConfirm}
                    setShow={
                      setShowConfirm
                    }
                    disabled={
                      mutation.isPending
                    }
                    placeholder="Enter new password again"
                  />

                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      className="alert alert-error rounded-xl text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={
                        handleClose
                      }
                      disabled={
                        mutation.isPending
                      }
                      className="btn btn-ghost rounded-xl"
                    >
                      Cancel
                    </button>

                    <motion.button
                      type="submit"
                      disabled={
                        mutation.isPending
                      }
                      whileHover={
                        mutation.isPending
                          ? {}
                          : {
                              y: -2,
                              scale: 1.02,
                            }
                      }
                      whileTap={
                        mutation.isPending
                          ? {}
                          : {
                              scale: 0.97,
                            }
                      }
                      className="btn btn-neutral rounded-xl"
                    >
                      {mutation.isPending ? (
                        <>
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />

                          Changing...
                        </>
                      ) : (
                        <>
                          <KeyRound
                            size={16}
                          />

                          Change password
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function PasswordInput({
  label,
  value,
  setValue,
  show,
  setShow,
  disabled,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <div className="relative">
        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            setValue(
              event.target.value
            )
          }
          disabled={disabled}
          autoComplete="new-password"
          placeholder={placeholder}
          className="input input-bordered w-full rounded-xl pr-12"
        />

        <button
          type="button"
          onClick={() =>
            setShow(
              (value) => !value
            )
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 opacity-45 transition hover:opacity-100"
          aria-label={
            show
              ? "Hide password"
              : "Show password"
          }
        >
          {show ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>
    </div>
  );
}