"use client";

import { useEffect, useMemo } from "react";
import type { MouseEvent } from "react";
import { Icon } from "@iconify/react";
import { usePinnedProfilesStore } from "../../store/pinned-profiles-store";
import { useProfileStore } from "../../store/profile-store";
import { useVersionSelectionStore } from "../../store/version-selection-store";
import { useThemeStore } from "../../store/useThemeStore";
import { ProfileIcon } from "../profiles/ProfileIcon";
import type { Profile } from "../../types/profile";
import { cn } from "../../lib/utils";
import { toast } from "react-hot-toast";

interface PinnedProfilesQuickAccessProps {
  className?: string;
}

export function PinnedProfilesQuickAccess({
  className,
}: PinnedProfilesQuickAccessProps) {
  const accentColor = useThemeStore((state) => state.accentColor);
  const profiles = useProfileStore((state) => state.profiles);
  const profilesLoading = useProfileStore((state) => state.loading);
  const selectedProfile = useProfileStore((state) => state.selectedProfile);
  const setSelectedProfile = useProfileStore((state) => state.setSelectedProfile);
  const { setSelectedVersion } = useVersionSelectionStore();
  const { pinnedProfileIds, clearMissingPins, unpinProfile } =
    usePinnedProfilesStore((state) => ({
      pinnedProfileIds: state.pinnedProfileIds,
      clearMissingPins: state.clearMissingPins,
      unpinProfile: state.unpinProfile,
    }));

  useEffect(() => {
    if (profilesLoading || pinnedProfileIds.length === 0) {
      return;
    }

    const existingIds = profiles.map((profile) => profile.id);
    if (existingIds.length === 0) {
      return;
    }

    const existingSet = new Set(existingIds);
    const hasInvalidPins = pinnedProfileIds.some(
      (id) => !existingSet.has(id),
    );

    if (hasInvalidPins) {
      clearMissingPins(existingIds);
    }
  }, [profilesLoading, profiles, pinnedProfileIds, clearMissingPins]);

  const pinnedProfiles = useMemo(() => {
    const pinnedProfilesResolved = pinnedProfileIds
      .map((id) => profiles.find((profile) => profile.id === id))
      .filter((profile): profile is Profile => Boolean(profile));

    return pinnedProfilesResolved.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }, [pinnedProfileIds, profiles]);

  const handleSelectProfile = (profile: Profile) => {
    setSelectedProfile(profile);
    setSelectedVersion(profile.id);
  };

  const handleUnpinProfile = (profile: Profile, event: MouseEvent) => {
    event.stopPropagation();
    unpinProfile(profile.id);
    toast.success(`Unpinned '${profile.name}'`);
  };

  return (
    <section
      className={cn(
        "w-full max-w-5xl mx-auto mb-6 bg-black/30 border border-white/10 rounded-2xl p-4 backdrop-blur",
        className,
      )}
      aria-label="Pinned profiles quick access"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white font-minecraft-ten uppercase tracking-widest text-sm">
          <Icon icon="solar:pin-bold" className="w-4 h-4 text-white/70" />
          pinned profiles
        </div>
        {pinnedProfiles.length > 0 && (
          <span className="text-xs text-white/60 font-minecraft-ten uppercase tracking-wider">
            {pinnedProfiles.length} pinned
          </span>
        )}
      </div>

      {pinnedProfiles.length === 0 ? (
        <div className="px-4 py-6 border border-dashed border-white/20 rounded-xl text-white/70 font-minecraft-ten text-sm uppercase tracking-wide bg-black/20">
          Pin a profile via its context menu to see it here.
        </div>
      ) : (
        <div
          className="flex gap-4 overflow-x-auto custom-scrollbar pb-2"
          role="list"
        >
          {pinnedProfiles.map((profile) => {
            const isActive = selectedProfile?.id === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => handleSelectProfile(profile)}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 min-w-[240px] text-left bg-black/40 hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer group",
                  isActive
                    ? "border-white/80 shadow-[0_0_12px_rgba(255,255,255,0.25)]"
                    : "border-white/15",
                )}
                style={{
                  backgroundColor: isActive
                    ? `${accentColor.value}25`
                    : undefined,
                }}
                role="listitem"
                aria-pressed={isActive}
              >
                <div className="w-14 h-14 flex-shrink-0">
                  <ProfileIcon
                    profileId={profile.id}
                    banner={profile.banner}
                    profileName={profile.name}
                    accentColor={accentColor.value}
                    onSuccessfulUpdate={() => {}}
                    className="w-full h-full rounded-lg border border-white/10"
                    placeholderIcon="solar:cube-bold"
                    iconClassName="w-6 h-6 text-white/80"
                    isEditable={false}
                    variant="bare"
                  />
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-minecraft-ten text-base text-white whitespace-nowrap overflow-hidden text-ellipsis normal-case">
                      {profile.name}
                    </span>
                    <Icon
                      icon="solar:pin-bold"
                      className="w-4 h-4 text-white/80"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs text-white/70 font-minecraft-ten normal-case">
                    {profile.loader} {profile.game_version}
                  </span>
                  <span className="text-[10px] text-white/60 font-minecraft-ten normal-case">
                    click to select
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Unpin ${profile.name}`}
                  onClick={(event) => handleUnpinProfile(profile, event)}
                  className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
                >
                  <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
                </button>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

