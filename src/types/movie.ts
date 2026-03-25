/**
 * Movie interface representing a basic movie object from TMDb API
 */
export interface Movie {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string | null;
}
