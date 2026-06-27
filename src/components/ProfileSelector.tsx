import React, { useState } from "react";
import { motion } from "motion/react";
import { Plus, Check, Trash2 } from "lucide-react";
import { NetflixUser, NetflixProfile } from "../types";

interface ProfileSelectorProps {
  user: NetflixUser;
  onSelectProfile: (profile: NetflixProfile) => void;
  onUpdateUserProfiles: (updatedProfiles: NetflixProfile[]) => void;
}

export default function ProfileSelector({
  user,
  onSelectProfile,
  onUpdateUserProfiles
}: ProfileSelectorProps) {
  const [isManaging, setIsManaging] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);

  // Pool of high quality, playful avatar image choices for profile additions
  const avatarPool = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  ];

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const randomAvatar = avatarPool[Math.floor(Math.random() * avatarPool.length)];
    const newProfile: NetflixProfile = {
      name: newProfileName.trim(),
      avatarUrl: randomAvatar,
      isKids: newProfileIsKids
    };

    const updated = [...user.profiles, newProfile];
    onUpdateUserProfiles(updated);

    // Reset Form state
    setNewProfileName("");
    setNewProfileIsKids(false);
    setIsAdding(false);
  };

  const handleDeleteProfile = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // Netflix demands keeping at least 1 profile
    if (user.profiles.length <= 1) {
      alert("An account must have at least one profile.");
      return;
    }
    const updated = user.profiles.filter((_, idx) => idx !== indexToDelete);
    onUpdateUserProfiles(updated);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 pt-16 pb-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl text-center"
      >
        {!isAdding ? (
          <>
            {/* Title block */}
            <h1 className="mb-8 text-3xl font-semibold tracking-wide text-white sm:text-5xl">
              {isManaging ? "Manage Profiles" : "Who's watching?"}
            </h1>

            {/* Profiles grid */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              {user.profiles.map((profile, idx) => (
                <motion.div
                  key={profile.name}
                  variants={itemVariants}
                  onClick={() => !isManaging && onSelectProfile(profile)}
                  className="group relative flex cursor-pointer flex-col items-center space-y-4"
                  whileHover={{ scale: isManaging ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    {/* Avatar box */}
                    <div className="h-24 w-24 overflow-hidden rounded-md bg-zinc-800 border-2 border-transparent transition-all duration-300 group-hover:border-zinc-100 sm:h-32 sm:w-32">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:brightness-110"
                      />
                    </div>

                    {/* Manage Overlay badges */}
                    {isManaging && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60">
                        <button
                          onClick={(e) => handleDeleteProfile(idx, e)}
                          className="rounded-full bg-zinc-900/90 p-2 text-zinc-300 hover:bg-netflix-red hover:text-white transition"
                          title="Delete profile"
                        >
                          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                        </button>
                      </div>
                    )}

                    {profile.isKids && (
                      <span className="absolute -top-1 -right-1 rounded bg-netflix-red px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Kids
                      </span>
                    )}
                  </div>

                  <span className="text-sm text-zinc-400 group-hover:text-white transition-colors sm:text-lg">
                    {profile.name}
                  </span>
                </motion.div>
              ))}

              {/* Add profile trigger block (Max 5 profiles allowed for Netflix mimicking) */}
              {user.profiles.length < 5 && (
                <motion.div
                  variants={itemVariants}
                  onClick={() => setIsAdding(true)}
                  className="group flex cursor-pointer flex-col items-center space-y-4"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-zinc-700 bg-zinc-900/40 transition-colors group-hover:border-zinc-400 group-hover:bg-zinc-900 sm:h-32 sm:w-32">
                    <Plus className="h-10 w-10 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
                  </div>
                  <span className="text-sm text-zinc-500 group-hover:text-white transition-colors sm:text-lg">
                    Add Profile
                  </span>
                </motion.div>
              )}
            </div>

            {/* Profile controller toggler */}
            <div className="mt-12 sm:mt-16">
              <button
                onClick={() => setIsManaging(!isManaging)}
                className="rounded border border-zinc-500 px-6 py-2 text-sm uppercase tracking-widest text-zinc-500 transition hover:border-zinc-100 hover:text-zinc-100"
              >
                {isManaging ? "Done" : "Manage Profiles"}
              </button>
            </div>
          </>
        ) : (
          /* Profile Add Form Overlay */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md bg-zinc-900 p-8 rounded-lg border border-zinc-800 text-left"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Create Profile</h2>
            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="Enter name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full rounded border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
                />
              </div>

              {/* Kids check box indicator */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="kids-profile"
                  checked={newProfileIsKids}
                  onChange={(e) => setNewProfileIsKids(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-netflix-red focus:ring-netflix-red focus:ring-offset-zinc-900"
                />
                <label htmlFor="kids-profile" className="cursor-pointer text-sm font-medium text-zinc-300">
                  Is this a Kid's Profile? (Only kid-friendly filters shown)
                </label>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded bg-white py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 rounded border border-zinc-700 py-2.5 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
