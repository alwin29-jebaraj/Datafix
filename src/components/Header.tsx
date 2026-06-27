import React, { useState, useEffect } from "react";
import { Search, Bell, LogOut, ChevronDown, RefreshCw, Sparkles, Heart } from "lucide-react";
import { NetflixUser, NetflixProfile } from "../types";

interface HeaderProps {
  user: NetflixUser | null;
  activeProfile: NetflixProfile | null;
  onLogout: () => void;
  onSwitchProfile: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onTabChange?: (tab: string) => void;
  currentTab?: string;
}

export default function Header({
  user,
  activeProfile,
  onLogout,
  onSwitchProfile,
  searchQuery,
  setSearchQuery,
  onTabChange,
  currentTab = "home"
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="datafix-header"
      className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
        isScrolled ? "bg-zinc-950/95 shadow-md" : "bg-gradient-to-b from-black/80 via-black/40 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 sm:space-x-10">
          {/* Rebranded Wordmark Logo */}
          <div className="cursor-pointer font-black text-2xl sm:text-3xl tracking-tighter text-netflix-red uppercase" onClick={() => onTabChange?.("home")}>
            datafix
          </div>

          {/* Navigation Links for Authenticated State */}
          {user && activeProfile && (
            <nav className="hidden space-x-5 text-sm font-medium text-zinc-300 md:flex">
              {[
                { id: "home", label: "Home" },
                { id: "tv", label: "TV Shows" },
                { id: "movies", label: "Movies" },
                { id: "mylist", label: "My List" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={`transition-colors hover:text-zinc-400 ${
                    currentTab === tab.id ? "text-white font-semibold" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Right Navigation controls */}
        {user && activeProfile ? (
          <div className="flex items-center space-x-4">
            {/* Real-time search bar */}
            <div className={`flex items-center space-x-2 rounded border border-zinc-700 bg-zinc-950/80 px-2 py-1 transition-all duration-300 ${
              isSearchOpen || searchQuery ? "w-40 sm:w-60" : "w-10 bg-transparent border-transparent"
            }`}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-zinc-200 transition hover:text-white"
                title="Search movies"
              >
                <Search className="h-5 w-5" />
              </button>
              {(isSearchOpen || searchQuery) && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Titles, people, genres..."
                  className="w-full bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
                  autoFocus
                />
              )}
            </div>

            {/* Notification placeholder */}
            <div className="relative cursor-pointer text-zinc-300 hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-netflix-red text-[9px] font-bold text-white">
                1
              </span>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                onBlur={() => setTimeout(() => setIsProfileMenuOpen(false), 200)}
                className="flex items-center space-x-1.5 focus:outline-none"
              >
                <img
                  src={activeProfile.avatarUrl}
                  alt={activeProfile.name}
                  className="h-8 w-8 rounded-md object-cover ring-2 ring-transparent transition hover:ring-zinc-400"
                />
                <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown panel */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-zinc-950 border border-zinc-800 text-sm shadow-2xl ring-1 ring-black ring-opacity-5">
                  {/* Profiles List */}
                  <div className="p-3 border-b border-zinc-800">
                    <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Switch Profile</p>
                    {user.profiles.map((profile) => (
                      <button
                        key={profile.name}
                        onClick={onSwitchProfile}
                        className={`flex w-full items-center space-x-3 rounded px-2 py-1.5 text-left transition hover:bg-zinc-900 ${
                          activeProfile.name === profile.name ? "bg-zinc-900/50" : ""
                        }`}
                      >
                        <img
                          src={profile.avatarUrl}
                          alt={profile.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                        <span className={`truncate text-xs ${activeProfile.name === profile.name ? "text-white font-semibold" : "text-zinc-300"}`}>
                          {profile.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Account Metadata */}
                  <div className="p-3 border-b border-zinc-800 bg-zinc-900/20">
                    <div className="flex items-center space-x-1.5 text-xs text-zinc-400">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                      <span>Tier: <strong className="text-white">{user.tier}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-1">
                    <button
                      onClick={onSwitchProfile}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-zinc-900 hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4 text-zinc-400" />
                      <span>Manage Profiles</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-xs text-netflix-red transition hover:bg-zinc-900 hover:text-netflix-red-hover"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out of datafix</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <select className="rounded border border-zinc-700 bg-black/60 px-3 py-1 text-xs font-medium text-white outline-none focus:border-white">
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
