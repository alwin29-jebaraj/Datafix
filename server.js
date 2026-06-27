import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory mock database of users
  // Initial accounts:
  // 1. netflix@netflix.com / netflix2026
  // 2. guest@netflix.com / guest123
  const usersDatabase = {
    "netflix@netflix.com": {
      passwordHash: "netflix2026",
      user: {
        email: "netflix@netflix.com",
        name: "Netflix Fan",
        tier: "Premium Ultra HD",
        profiles: [
          { name: "Alwin", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", isKids: false },
          { name: "Kids", avatarUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80", isKids: true },
          { name: "Tech Fan", avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80", isKids: false },
          { name: "Guest", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", isKids: false }
        ]
      }
    },
    "guest@netflix.com": {
      passwordHash: "guest123",
      user: {
        email: "guest@netflix.com",
        name: "Guest User",
        tier: "Standard HD",
        profiles: [
          { name: "Guest", avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", isKids: false },
          { name: "Kids", avatarUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80", isKids: true }
        ]
      }
    }
  };

  // Movie content categories
  const movieCategories = [
    {
      id: "trending",
      title: "Trending Now",
      movies: [
        {
          id: "m1",
          title: "The Midnight Code",
          rating: "TV-MA",
          duration: "2h 14m",
          year: "2026",
          match: "98% Match",
          tags: ["Sci-Fi", "Cyberpunk", "Suspenseful"],
          posterUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=500&q=80",
          description: "A brilliant software engineer stumbles upon a cryptic algorithm hidden inside ancient server systems, unraveling a global conspiracy."
        },
        {
          id: "m2",
          title: "Stranger Loops",
          rating: "TV-14",
          duration: "4 Seasons",
          year: "2025",
          match: "95% Match",
          tags: ["Nostalgic", "Sci-Fi Drama", "Mystery"],
          posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80",
          description: "When a junior developer goes missing in a small tech hub, local kids discover an underground server room containing secrets beyond their reality."
        },
        {
          id: "m3",
          title: "Red Velvet",
          rating: "R",
          duration: "1h 58m",
          year: "2026",
          match: "92% Match",
          tags: ["Romantic Drama", "Music", "Intimate"],
          posterUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=500&q=80",
          description: "An aspiring jazz pianist and a classical violinist cross paths in a late-night cafe, kindling a passionate melody that changes their lives."
        },
        {
          id: "m4",
          title: "Express Infiltration",
          rating: "TV-MA",
          duration: "2h 05m",
          year: "2026",
          match: "89% Match",
          tags: ["Action Thriller", "Espionage", "Fast-Paced"],
          posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=500&q=80",
          description: "A retired secret service driver has to pilot a bullet train loaded with active server cores after a hostile force hijacks the control systems."
        }
      ]
    },
    {
      id: "popular",
      title: "Popular on Netflix",
      movies: [
        {
          id: "m5",
          title: "The Crown Jewels",
          rating: "PG-13",
          duration: "2h 30m",
          year: "2024",
          match: "97% Match",
          tags: ["Historical", "Drama", "Visual"],
          posterUrl: "https://images.unsplash.com/photo-1460881680858-30d872d5b530?auto=format&fit=crop&w=500&q=80",
          description: "An intimate peek behind the polished facade of the twentieth century's most storied dynasty, chronicled with exquisite detail."
        },
        {
          id: "m6",
          title: "Silicon Odyssey",
          rating: "TV-PG",
          duration: "1h 42m",
          year: "2025",
          match: "94% Match",
          tags: ["Documentary", "Tech", "Inspiring"],
          posterUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=500&q=80",
          description: "Tracing the early developers who risked everything to replace analog switches with microchips, starting a global digital revolution."
        },
        {
          id: "m7",
          title: "Lost in Translation",
          rating: "R",
          duration: "1h 41m",
          year: "2003",
          match: "91% Match",
          tags: ["Indie", "Atmospheric", "Poignant"],
          posterUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=80",
          description: "A lonely aging movie star and a conflicted newlywed form an extraordinary, fleeting connection during a hazy week in neon-soaked Tokyo."
        },
        {
          id: "m8",
          title: "Dark Web Rising",
          rating: "TV-MA",
          duration: "1 Season",
          year: "2026",
          match: "96% Match",
          tags: ["True Crime", "Gritty", "Dark"],
          posterUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80",
          description: "Investigators pursue the elusive mastermind behind an illegal darknet bazaar who manages the entire operation from an airport terminal."
        }
      ]
    },
    {
      id: "sci_fi",
      title: "Sci-Fi & Action Masterpieces",
      movies: [
        {
          id: "m9",
          title: "Vapor Horizon",
          rating: "R",
          duration: "2h 22m",
          year: "2026",
          match: "99% Match",
          tags: ["Dystopian", "Sci-Fi", "Breathtaking"],
          posterUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&q=80",
          description: "In a flooded city powered by holographic waste, a synth-hunter must decide if his latest target holds the key to purifying the planet."
        },
        {
          id: "m10",
          title: "Project Antigravity",
          rating: "PG-13",
          duration: "1h 55m",
          year: "2025",
          match: "93% Match",
          tags: ["Mind-bending", "Adventure", "Futuristic"],
          posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80",
          description: "A physicist creates a device capable of neutralizing gravity locally, only to find that manipulating physics tears structural holes in the fabric of spacetime."
        },
        {
          id: "m11",
          title: "Neon Streets",
          rating: "TV-MA",
          duration: "2 Seasons",
          year: "2026",
          match: "88% Match",
          tags: ["Anime", "Action", "Stylized"],
          posterUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80",
          description: "A street kid with high-tech prosthetic enhancements becomes a mercenary for hire in a vibrant city dominated by monolithic tech mega-corps."
        },
        {
          id: "m12",
          title: "Apollo Reboot",
          rating: "PG",
          duration: "2h 08m",
          year: "2024",
          match: "90% Match",
          tags: ["Space", "Suspenseful", "Exciting"],
          posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=500&q=80",
          description: "A surprise solar flare disables communications on a manned Mars station, prompting the crew to construct a crude analog backup transmitter."
        }
      ]
    }
  ];

  // API - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API - Login Handler
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    // Server-side simple validation
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "Please enter a valid email address or phone number."
      });
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({
        success: false,
        field: "password",
        message: "Your password must contain between 4 and 60 characters."
      });
    }

    const emailKey = email.trim().toLowerCase();
    const match = usersDatabase[emailKey];

    if (!match) {
      return res.status(401).json({
        success: false,
        field: "email",
        message: `We cannot find an account with this email: "${email}". Double-check or use 'netflix@netflix.com'.`
      });
    }

    if (match.passwordHash !== password) {
      return res.status(401).json({
        success: false,
        field: "password",
        message: "Incorrect password. Please try again (hint: 'netflix2026' or 'guest123')."
      });
    }

    // Success
    return res.json({
      success: true,
      user: match.user,
      token: `netflix_session_${Buffer.from(emailKey).toString("base64")}`
    });
  });

  // API - Register / Sign up
  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "Please enter a valid email address."
      });
    }

    if (!password || typeof password !== "string" || password.length < 4) {
      return res.status(400).json({
        success: false,
        field: "password",
        message: "Your password must contain between 4 and 60 characters."
      });
    }

    const emailKey = email.trim().toLowerCase();
    if (usersDatabase[emailKey]) {
      return res.status(400).json({
        success: false,
        field: "email",
        message: "This email address is already in use. Try signing in."
      });
    }

    const cleanName = (name && typeof name === "string" && name.trim()) || "New Member";

    // Create the user profile in-memory
    const newUser = {
      email: emailKey,
      name: cleanName,
      tier: "Premium Ultra HD",
      profiles: [
        { name: cleanName, avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", isKids: false },
        { name: "Kids Zone", avatarUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=150&q=80", isKids: true }
      ]
    };

    usersDatabase[emailKey] = {
      passwordHash: password,
      user: newUser
    };

    return res.status(201).json({
      success: true,
      user: newUser,
      token: `netflix_session_${Buffer.from(emailKey).toString("base64")}`
    });
  });

  // API - Movies Content
  app.get("/api/movies", (req, res) => {
    res.json({ categories: movieCategories });
  });

  // Integrate Vite Dev Middleware in Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DATAFIX SERVER] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start datafix replica backend server:", err);
});
