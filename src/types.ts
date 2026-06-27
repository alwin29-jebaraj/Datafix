export interface NetflixProfile {
  name: string;
  avatarUrl: string;
  isKids: boolean;
}

export interface NetflixUser {
  email: string;
  name: string;
  tier: "Premium Ultra HD" | "Standard HD" | "Basic with Ads";
  profiles: NetflixProfile[];
}

export interface Movie {
  id: string;
  title: string;
  rating: string;
  duration: string;
  year: string;
  match: string;
  tags: string[];
  posterUrl: string;
  description: string;
}

export interface MovieCategory {
  id: string;
  title: string;
  movies: Movie[];
}
