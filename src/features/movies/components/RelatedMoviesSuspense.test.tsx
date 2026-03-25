/**
 * RelatedMoviesSuspense Component Tests
 *
 * Tests for the RelatedMoviesSuspense component covering:
 * - Suspense boundary setup
 * - Fallback rendering
 * - Component composition
 */

import { RelatedMoviesSuspense } from './RelatedMoviesSuspense';
import { Suspense } from 'react';

// Mock the RelatedMovies component
jest.mock('./RelatedMovies', () => ({
  RelatedMovies: ({ movieId }: { movieId: number }) => (
    <div data-testid="related-movies">Related Movies for {movieId}</div>
  ),
}));

// Mock the LoadingSkeleton component
jest.mock('@/features/ui/components/LoadingSkeleton', () => ({
  LoadingSkeleton: ({ itemCount }: { itemCount?: number }) => (
    <div data-testid="loading-skeleton">Loading {itemCount} items</div>
  ),
}));

describe('RelatedMoviesSuspense Component', () => {
  describe('Component Structure', () => {
    it('should render Suspense boundary', () => {
      const movieId = 550;
      const component = RelatedMoviesSuspense({ movieId });

      expect(component).toBeDefined();
      expect(component.type).toBe(Suspense);
    });

    it('should pass movieId to RelatedMovies component', () => {
      const movieId = 550;
      const component = RelatedMoviesSuspense({ movieId });

      expect(component.props.children).toBeDefined();
      expect(component.props.children.props.movieId).toBe(movieId);
    });

    it('should have LoadingSkeleton as fallback', () => {
      const movieId = 550;
      const component = RelatedMoviesSuspense({ movieId });

      expect(component.props.fallback).toBeDefined();
      expect(component.props.fallback.type.name).toBe('LoadingSkeleton');
    });

    it('should pass itemCount=4 to LoadingSkeleton fallback', () => {
      const movieId = 550;
      const component = RelatedMoviesSuspense({ movieId });

      expect(component.props.fallback.props.itemCount).toBe(4);
    });
  });

  describe('Props Handling', () => {
    it('should accept movieId prop', () => {
      const movieId = 123;
      const component = RelatedMoviesSuspense({ movieId });

      expect(component.props.children.props.movieId).toBe(movieId);
    });

    it('should work with different movieIds', () => {
      const movieIds = [1, 550, 1000, 9999];

      movieIds.forEach((movieId) => {
        const component = RelatedMoviesSuspense({ movieId });
        expect(component.props.children.props.movieId).toBe(movieId);
      });
    });
  });
});
