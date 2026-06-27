import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Info, 
  Plus, 
  Check, 
  X, 
  ChevronRight, 
  ThumbsUp, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff,
  AlertCircle
} from "lucide-react";
import { NetflixUser, NetflixProfile, Movie, MovieCategory } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProfileSelector from "./components/ProfileSelector";

export default function App() {
  // Session states
  const [user, setUser] = useState<NetflixUser | null>(() => {
    const saved = localStorage.getItem("netflix_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeProfile, setActiveProfile] = useState<NetflixProfile | null>(() => {
    const saved = localStorage.getItem("netflix_active_profile");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("netflix_token");
  });

  // Authentication Mode
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Form password visibility toggle
  const [showPassword, setShowPassword] = useState(false);

  // Validation / Loading states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dashboard content states
  const [categories, setCategories] = useState<MovieCategory[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [myList, setMyList] = useState<Movie[]>(() => {
    const saved = localStorage.getItem("netflix_mylist");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState("home"); // home, tv, movies, mylist
  const [heroMuted, setHeroMuted] = useState(true);

  // Save My List changes
  useEffect(() => {
    localStorage.setItem("netflix_mylist", JSON.stringify(myList));
  }, [myList]);

  // Load movies from express server
  useEffect(() => {
    if (user && activeProfile) {
      fetch("/api/movies")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load movies data");
          return res.json();
        })
        .then((data) => {
          if (data && data.categories) {
            setCategories(data.categories);
          }
        })
        .catch((err) => {
          console.error("Error fetching movies:", err);
        });
    }
  }, [user, activeProfile]);

  // Handle Form Submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    // Frontend validation
    const errors: Record<string, string> = {};
    if (!email.trim() || !email.includes("@")) {
      errors.email = "Please enter a valid email address.";
    }
    if (!password || password.length < 4) {
      errors.password = "Your password must contain between 4 and 60 characters.";
    }
    if (isSignUpMode && !name.trim()) {
      errors.name = "Please enter your name.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    const endpoint = isSignUpMode ? "/api/register" : "/api/login";
    const payload = isSignUpMode ? { email, password, name } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field) {
          setFieldErrors({ [data.field]: data.message });
        } else {
          setGeneralError(data.message || "Something went wrong. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Success! Save session
      setUser(data.user);
      setToken(data.token);
      if (rememberMe) {
        localStorage.setItem("netflix_user", JSON.stringify(data.user));
        localStorage.setItem("netflix_token", data.token);
      }
      
      // Clear fields
      setPassword("");
    } catch (err) {
      setGeneralError("Network connection failure. Make sure the express server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // Profile selection
  const handleSelectProfile = (profile: NetflixProfile) => {
    setActiveProfile(profile);
    localStorage.setItem("netflix_active_profile", JSON.stringify(profile));
  };

  const handleUpdateProfiles = (updatedProfiles: NetflixProfile[]) => {
    if (!user) return;
    const updatedUser = { ...user, profiles: updatedProfiles };
    setUser(updatedUser);
    if (rememberMe) {
      localStorage.setItem("netflix_user", JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveProfile(null);
    setToken(null);
    localStorage.removeItem("netflix_user");
    localStorage.removeItem("netflix_active_profile");
    localStorage.removeItem("netflix_token");
    setSearchQuery("");
    setCurrentTab("home");
  };

  // Toggle My List helper
  const toggleMyList = (movie: Movie, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const exists = myList.some((m) => m.id === movie.id);
    if (exists) {
      setMyList(myList.filter((m) => m.id !== movie.id));
    } else {
      setMyList([...myList, movie]);
    }
  };

  // Filter content based on category choice and search query
  const getFilteredCategories = () => {
    return categories.map((cat) => {
      let filteredMovies = cat.movies;

      // Filter by active Tab:
      // tv tab filters for shows (using "4 Seasons" or "Seasons" tag logic as a heuristic, or TV- prefix)
      if (currentTab === "tv") {
        filteredMovies = filteredMovies.filter(
          (m) => m.duration.toLowerCase().includes("season") || m.rating.startsWith("TV")
        );
      } else if (currentTab === "movies") {
        filteredMovies = filteredMovies.filter(
          (m) => !m.duration.toLowerCase().includes("season") && !m.rating.startsWith("TV")
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filteredMovies = filteredMovies.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return {
        ...cat,
        movies: filteredMovies
      };
    }).filter((cat) => cat.movies.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  // Spot primary featured movie for beautiful showcase billboard
  const heroMovie: Movie | null = categories[0]?.movies[0] || null;

  return (
    <div className="mesh-bg flex min-h-screen flex-col justify-between text-white selection:bg-netflix-red selection:text-white">
      {/* Top Header */}
      <Header
        user={user}
        activeProfile={activeProfile}
        onLogout={handleLogout}
        onSwitchProfile={() => {
          setActiveProfile(null);
          localStorage.removeItem("netflix_active_profile");
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          // Auto-scroll back up top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        currentTab={currentTab}
      />

      {/* Main Container */}
      <main className="flex-grow">
        {!user ? (
          /* ================= LOGIN & REGISTER SCREEN ================= */
          <div className="flex items-center justify-center px-4 pt-28 pb-20">
            <div className="glass-card w-full max-w-[450px] p-8 sm:p-16 shadow-2xl transition-all">
              <h1 className="text-3xl font-bold mb-8 text-white">
                {isSignUpMode ? "Sign Up" : "Sign In"}
              </h1>

              {generalError && (
                <div className="mb-6 flex items-start space-x-2 rounded bg-amber-500/20 border border-amber-500/30 p-3.5 text-xs text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{generalError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isSignUpMode && (
                  <div className={`relative rounded bg-zinc-800/80 transition-all border-b-2 ${
                    fieldErrors.name ? "border-amber-600" : "border-transparent focus-within:border-[#e87c03]"
                  }`}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent border-none text-white px-5 py-4 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400"
                    />
                    {fieldErrors.name && (
                      <div className="text-[#e87c03] text-[11px] px-5 pb-2">
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>
                )}

                <div className={`relative rounded bg-zinc-800/80 transition-all border-b-2 ${
                  fieldErrors.email ? "border-amber-600" : "border-transparent focus-within:border-[#e87c03]"
                }`}>
                  <input
                    type="text"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-none text-white px-5 py-4 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400"
                  />
                  {fieldErrors.email && (
                    <div className="text-[#e87c03] text-[11px] px-5 pb-2">
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                <div className={`relative rounded bg-zinc-800/80 transition-all border-b-2 ${
                  fieldErrors.password ? "border-amber-600" : "border-transparent focus-within:border-[#e87c03]"
                }`}>
                  <div className="flex items-center justify-between">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-none text-white px-5 py-4 text-sm focus:outline-none focus:ring-0 placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="pr-4 text-zinc-400 hover:text-white focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <div className="text-[#e87c03] text-[11px] px-5 pb-2">
                      {fieldErrors.password}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-netflix-red hover:bg-netflix-red-hover text-white font-bold py-3.5 rounded mt-6 transition-colors shadow-lg disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Please wait...</span>
                    </span>
                  ) : (
                    isSignUpMode ? "Sign Up" : "Sign In"
                  )}
                </button>

                <div className="flex items-center justify-between mt-4 text-[#b3b3b3] text-xs">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-zinc-800 border-none accent-zinc-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <a
                    href="#forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Tip: Standard demo accounts are:\n\n- netflix@netflix.com / netflix2026\n- guest@netflix.com / guest123");
                    }}
                    className="hover:underline text-zinc-400 hover:text-white"
                  >
                    Need help?
                  </a>
                </div>
              </form>

              <div className="mt-12 text-[#737373] text-sm space-y-4">
                <p className="text-zinc-400">
                  {isSignUpMode ? "Already have an account?" : "New to datafix?"}{" "}
                  <button
                    onClick={() => {
                      setIsSignUpMode(!isSignUpMode);
                      setFieldErrors({});
                      setGeneralError(null);
                    }}
                    className="text-white hover:underline font-medium focus:outline-none"
                  >
                    {isSignUpMode ? "Sign in now." : "Sign up now."}
                  </button>
                </p>
                <div className="pt-2 text-xs border-t border-zinc-800">
                  <p className="font-semibold text-zinc-400 mb-1">Interactive Mock credentials:</p>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-500">
                    <li>Email: <code className="text-zinc-300">netflix@netflix.com</code></li>
                    <li>Password: <code className="text-zinc-300">netflix2026</code></li>
                  </ul>
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">
                  This replica page uses a secure Express local authentication backend. No personal data is harvested or tracked outside the local environment.
                </p>
              </div>
            </div>
          </div>
        ) : !activeProfile ? (
          /* ================= PROFILE SELECTION ================= */
          <ProfileSelector
            user={user}
            onSelectProfile={handleSelectProfile}
            onUpdateUserProfiles={handleUpdateProfiles}
          />
        ) : (
          /* ================= PREMIUM DUSTBOARD LANDING ================= */
          <div className="animate-fadeIn">
            {/* 1. BILLBOARD BANNER HERO */}
            {currentTab !== "mylist" && heroMovie && !searchQuery && (
              <div className="relative h-[45vh] w-full sm:h-[85vh] overflow-hidden select-none">
                <img
                  src={heroMovie.posterUrl}
                  alt={heroMovie.title}
                  className="absolute inset-0 h-full w-full object-cover brightness-75 scale-105 duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/10 to-transparent" />

                {/* Hero Info Text Panel */}
                <div className="absolute bottom-[10%] left-4 right-4 z-10 max-w-2xl space-y-3 sm:left-12 sm:space-y-6">
                  {/* Premium Brand Tag */}
                  <div className="flex items-center space-x-2">
                    <span className="bg-netflix-red px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                      N SERIES
                    </span>
                    <span className="text-xs font-semibold text-yellow-500 tracking-wider uppercase">
                      #1 MOST WATCHED TODAY
                    </span>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-6xl drop-shadow-md">
                    {heroMovie.title}
                  </h1>

                  <p className="hidden text-sm leading-relaxed text-zinc-300 sm:block sm:text-base drop-shadow">
                    {heroMovie.description}
                  </p>

                  {/* Buttons Row */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedMovie(heroMovie)}
                      className="flex items-center space-x-2 rounded bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-zinc-200 sm:px-8 sm:py-3"
                    >
                      <Play className="h-5 w-5 fill-black" />
                      <span>Play</span>
                    </button>
                    <button
                      onClick={() => setSelectedMovie(heroMovie)}
                      className="flex items-center space-x-2 rounded bg-zinc-600/60 px-5 py-2 text-sm font-bold text-white transition hover:bg-zinc-700/80 sm:px-8 sm:py-3 backdrop-blur-sm"
                    >
                      <Info className="h-5 w-5" />
                      <span>More Info</span>
                    </button>

                    {/* Mute toggle button */}
                    <button
                      onClick={() => setHeroMuted(!heroMuted)}
                      className="hidden rounded-full border border-zinc-500 bg-zinc-950/40 p-2.5 text-zinc-400 hover:text-white sm:block transition-all"
                      title={heroMuted ? "Unmute" : "Mute"}
                    >
                      {heroMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Bottom Fade Gradient Overlay */}
                <div className="netflix-bottom-fade absolute bottom-0 left-0 h-24 w-full" />
              </div>
            )}

            {/* 2. MAIN CATEGORY ROWS LIST */}
            <div className={`space-y-12 px-4 sm:px-12 relative z-20 ${
              currentTab === "mylist" || searchQuery ? "pt-24 pb-16" : "-mt-12 sm:-mt-28 pb-20"
            }`}>
              
              {/* If search query is active, show Search Results Header */}
              {searchQuery && (
                <div className="space-y-2">
                  <p className="text-zinc-500 text-sm">Showing results for: <span className="text-white font-semibold">"{searchQuery}"</span></p>
                  <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">Search Results</h2>
                </div>
              )}

              {/* If "My List" Tab is chosen */}
              {currentTab === "mylist" && (
                <div className="space-y-6">
                  <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">My List ({myList.length})</h2>
                  {myList.length === 0 ? (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-12 text-center">
                      <p className="text-zinc-400 text-sm mb-4">You haven't added anything to your list yet.</p>
                      <button 
                        onClick={() => setCurrentTab("home")}
                        className="rounded border border-zinc-700 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
                      >
                        Explore Popular Titles
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {myList.map((movie) => (
                        <div
                          key={movie.id}
                          onClick={() => setSelectedMovie(movie)}
                          className="group relative cursor-pointer overflow-hidden rounded-md bg-zinc-900 border border-zinc-800/60 transition duration-300 hover:scale-105"
                        >
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="aspect-video w-full object-cover brightness-95 group-hover:brightness-100 transition-all"
                          />
                          <div className="p-3">
                            <h3 className="truncate text-xs font-semibold sm:text-sm group-hover:text-netflix-red transition-colors">
                              {movie.title}
                            </h3>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                              <span>{movie.year} • {movie.rating}</span>
                              <button 
                                onClick={(e) => toggleMyList(movie, e)}
                                className="text-zinc-400 hover:text-white"
                                title="Remove from list"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic Categories List */}
              {currentTab !== "mylist" && (
                filteredCategories.length === 0 ? (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-12 text-center">
                    <p className="text-zinc-400 text-sm">No matches found for search query.</p>
                  </div>
                ) : (
                  filteredCategories.map((cat) => (
                    <div key={cat.id} className="space-y-4">
                      <h2 className="text-base sm:text-2xl font-extrabold tracking-tight text-zinc-100 group flex items-center space-x-2">
                        <span>{cat.title}</span>
                        <ChevronRight className="h-5 w-5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />
                      </h2>

                      {/* Poster Rows Slider Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {cat.movies.map((movie) => (
                          <div
                            key={movie.id}
                            onClick={() => setSelectedMovie(movie)}
                            className="group relative cursor-pointer overflow-hidden rounded-md bg-zinc-900/80 border border-zinc-800/40 transition duration-300 hover:scale-105"
                          >
                            <img
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="aspect-video w-full object-cover brightness-90 group-hover:brightness-100 transition"
                            />
                            <div className="p-3">
                              <div className="flex items-start justify-between">
                                <h3 className="truncate pr-1 text-xs font-bold sm:text-sm text-zinc-100 group-hover:text-netflix-red transition-colors">
                                  {movie.title}
                                </h3>
                                <span className="rounded bg-zinc-800 px-1 py-0.5 text-[8px] font-bold text-zinc-300">
                                  {movie.rating}
                                </span>
                              </div>

                              {/* tags or metadata brief */}
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-[10px] text-green-500 font-bold">{movie.match}</span>
                                <span className="text-[10px] text-zinc-400">{movie.duration}</span>
                              </div>

                              <div className="mt-2.5 flex items-center justify-between border-t border-zinc-800/50 pt-2 text-[10px]">
                                <span className="text-zinc-500">{movie.year}</span>
                                <button
                                  onClick={(e) => toggleMyList(movie, e)}
                                  className="text-zinc-400 hover:text-white"
                                  title={myList.some((m) => m.id === movie.id) ? "Remove from list" : "Add to list"}
                                >
                                  {myList.some((m) => m.id === movie.id) ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Plus className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. PREMIUM CONTENT DETAIL MODAL */}
      <AnimatePresence>
        {selectedMovie && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 overflow-y-auto backdrop-blur-md"
            onClick={() => setSelectedMovie(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-zinc-900 text-white border border-zinc-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedMovie(null)}
                className="absolute right-4 top-4 z-50 rounded-full bg-black/60 p-2 text-zinc-400 transition hover:bg-black/90 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Backdrop Header image */}
              <div className="relative h-60 w-full sm:h-96">
                <img
                  src={selectedMovie.posterUrl}
                  alt={selectedMovie.title}
                  className="h-full w-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                
                {/* Title overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="text-xl font-extrabold sm:text-4xl drop-shadow-md">
                    {selectedMovie.title}
                  </h2>
                </div>
              </div>

              {/* Content Panels */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    <span className="font-bold text-green-500">{selectedMovie.match}</span>
                    <span className="text-zinc-400">{selectedMovie.year}</span>
                    <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-xs text-zinc-300">
                      {selectedMovie.rating}
                    </span>
                    <span className="text-zinc-400">{selectedMovie.duration}</span>
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-300">
                    {selectedMovie.description}
                  </p>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => {
                        alert(`Now playing "${selectedMovie.title}" simulator. Enjoy!`);
                        setSelectedMovie(null);
                      }}
                      className="flex items-center space-x-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-zinc-200"
                    >
                      <Play className="h-4 w-4 fill-black" />
                      <span>Play Title</span>
                    </button>

                    <button
                      onClick={() => toggleMyList(selectedMovie)}
                      className="flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/40 p-2.5 text-zinc-300 hover:border-white hover:text-white transition"
                      title="Add or remove list"
                    >
                      {myList.some((m) => m.id === selectedMovie.id) ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Plus className="h-5 w-5" />
                      )}
                    </button>

                    <button
                      onClick={() => alert("Liked! Recommended to similar users.")}
                      className="flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/40 p-2.5 text-zinc-300 hover:border-white hover:text-white transition"
                      title="Rate title"
                    >
                      <ThumbsUp className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Right side tags metadata */}
                <div className="text-xs space-y-3 border-t border-zinc-800 pt-4 md:border-t-0 md:pt-0">
                  <div>
                    <span className="text-zinc-500 font-semibold block mb-1">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedMovie.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-zinc-800 px-2.5 py-1 text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-semibold block mb-1">Created for:</span>
                    <p className="text-zinc-400">
                      {activeProfile?.isKids ? "datafix Kids Zone selection" : "datafix Standard Account view"}
                    </p>
                  </div>

                  <div>
                    <span className="text-zinc-500 font-semibold block mb-1">Audio Description:</span>
                    <p className="text-zinc-400">Available in English (5.1), Spanish Dolby Atmos</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer block */}
      <Footer isLoginMode={!user} />
    </div>
  );
}
