"use client";

import SettingsHeader from "@/components/features/settings/components/SettingsHeader";
import ProfileSettings from "@/components/features/settings/components/ProfileSettings";
import SecuritySettings from "@/components/features/settings/components/SecuritySettings";
import AppearanceSettings from "@/components/features/settings/components/AppearanceSettings";
import StorageSettings from "@/components/features/settings/components/StorageSettings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl pb-10">
      <SettingsHeader />

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT COLUMN */}

        <div className="space-y-6">
          <ProfileSettings />
          <SecuritySettings />
        </div>

        {/* RIGHT COLUMN */}

        <div className="space-y-6">
          <AppearanceSettings />
          <StorageSettings />
        </div>
      </div>
    </div>
  );
}