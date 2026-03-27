/**
 * TV Show Details Type Definition
 */

export interface TVShowDetails {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: Array<{
    id: number;
    name: string;
  }>;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Array<{
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
    air_date: string;
  }>;
  episode_run_time: number[];
  status: string;
  type: string;
  networks: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  created_by: Array<{
    id: number;
    name: string;
    profile_path: string | null;
  }>;
}

export interface TVSeasonDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string;
  episodes: Array<{
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    air_date: string;
    vote_average: number;
    vote_count: number;
    runtime: number | null;
  }>;
}
