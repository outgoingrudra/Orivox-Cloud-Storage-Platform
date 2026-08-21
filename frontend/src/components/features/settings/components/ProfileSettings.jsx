"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  Save,
  UserRound,
} from "lucide-react";

import { motion } from "framer-motion";
import { useSelector } from "react-redux";

import { useUpdateProfile } from "@/components/features/settings/useUpdateProfile";

export default function ProfileSettings() {
  const user = useSelector(
    (state) => state.auth.user
  );

  const updateProfileMutation =
    useUpdateProfile();

  const [name, setName] =
    useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      updateProfileMutation.isPending
    ) {
      return;
    }

    setError("");
    setSuccess(false);

    const normalizedName =
      name.trim();

    if (
      normalizedName.length < 2
    ) {
      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }

    if (
      normalizedName.length > 50
    ) {
      setError(
        "Name cannot exceed 50 characters."
      );

      return;
    }

    /*
      Nothing changed.
    */
    if (
      normalizedName ===
      user?.name
    ) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: normalizedName,
      });

      setSuccess(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update profile."
      );
    }
  }

  const changed =
    name.trim() !==
    (user?.name || "");

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: 0.08,
      }}
      whileHover={{
        y: -2,
      }}
      className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{
            rotate: -4,
            scale: 1.06,
          }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-base-200"
        >
          <UserRound
            size={18}
          />
        </motion.div>

        <div>
          <h2 className="font-bold">
            Profile
          </h2>

          <p className="mt-0.5 text-xs opacity-45">
            Manage your personal account information.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-5"
      >
        {/* NAME */}

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Name
          </label>

          <input
            type="text"
            value={name}
            maxLength={50}
            disabled={
              updateProfileMutation.isPending
            }
            onChange={(event) => {
              setName(
                event.target.value
              );

              setError("");
              setSuccess(false);
            }}
            className="input input-bordered w-full rounded-xl"
            placeholder="Your name"
          />

          <div className="mt-2 flex justify-between text-[11px] opacity-35">
            <span>
              2–50 characters
            </span>

            <span>
              {name.length}/50
            </span>
          </div>
        </div>

        {/* EMAIL */}

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Email
          </label>

          <div className="relative">
            <Mail
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-35"
            />

            <input
              type="email"
              value={
                user?.email || ""
              }
              disabled
              className="input input-bordered w-full rounded-xl pl-11 opacity-60"
            />
          </div>

          <p className="mt-2 text-xs opacity-40">
            Your verified account email cannot currently be changed.
          </p>
        </div>

        {/* ERROR */}

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

        {/* SUCCESS */}

        {success && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CheckCircle2
              size={16}
            />

            Profile updated successfully.
          </motion.div>
        )}

        {/* SAVE */}

        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={
              !changed ||
              updateProfileMutation.isPending
            }
            whileHover={
              !changed ||
              updateProfileMutation.isPending
                ? {}
                : {
                    y: -2,
                    scale: 1.02,
                  }
            }
            whileTap={
              !changed ||
              updateProfileMutation.isPending
                ? {}
                : {
                    scale: 0.97,
                  }
            }
            className="btn btn-neutral rounded-xl"
          >
            {updateProfileMutation.isPending ? (
              <>
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />

                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save changes
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.section>
  );
}