import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PinnedProfilesState {
  pinnedProfileIds: string[];
  pinProfile: (profileId: string) => void;
  unpinProfile: (profileId: string) => void;
  toggleProfilePin: (profileId: string) => void;
  isPinned: (profileId: string) => boolean;
  clearMissingPins: (existingProfileIds: string[]) => void;
}

export const usePinnedProfilesStore = create<PinnedProfilesState>()(
  persist(
    (set, get) => ({
      pinnedProfileIds: [],

      pinProfile: (profileId) => {
        set((state) => {
          if (state.pinnedProfileIds.includes(profileId)) {
            return state;
          }

          return {
            pinnedProfileIds: [...state.pinnedProfileIds, profileId],
          };
        });
      },

      unpinProfile: (profileId) => {
        set((state) => ({
          pinnedProfileIds: state.pinnedProfileIds.filter(
            (id) => id !== profileId,
          ),
        }));
      },

      toggleProfilePin: (profileId) => {
        const { isPinned, pinProfile, unpinProfile } = get();
        if (isPinned(profileId)) {
          unpinProfile(profileId);
        } else {
          pinProfile(profileId);
        }
      },

      isPinned: (profileId) => get().pinnedProfileIds.includes(profileId),

      clearMissingPins: (existingProfileIds) => {
        set((state) => {
          const existingIdsSet = new Set(existingProfileIds);
          const filteredIds = state.pinnedProfileIds.filter((id) =>
            existingIdsSet.has(id),
          );

          if (filteredIds.length === state.pinnedProfileIds.length) {
            return state;
          }

          return {
            pinnedProfileIds: filteredIds,
          };
        });
      },
    }),
    {
      name: "pinned-profiles-storage",
      version: 1,
    },
  ),
);



