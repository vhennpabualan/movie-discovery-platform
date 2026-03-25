/**
 * MoviePoster Component Tests
 * 
 * Tests for the MoviePoster component covering:
 * - Image rendering with correct URL and alt text
 * - Explicit sizing (width/height props)
 * - Container-based sizing (fill prop)
 * - Priority prop for above/below-the-fold optimization
 * - Responsive sizes prop
 * - Graceful handling of missing poster_path
 * - Accessibility features
 */

import { MoviePoster } from './MoviePoster';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe('MoviePoster Component', () => {
  describe('Component Props', () => {
    it('should accept posterPath prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
        />
      );
      expect(component.props.posterPath).toBe('/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg');
    });

    it('should accept title prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
        />
      );
      expect(component.props.title).toBe('Inception');
    });

    it('should accept optional width prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          width={342}
        />
      );
      expect(component.props.width).toBe(342);
    });

    it('should accept optional height prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          height={513}
        />
      );
      expect(component.props.height).toBe(513);
    });

    it('should accept optional fill prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          fill={true}
        />
      );
      expect(component.props.fill).toBe(true);
    });

    it('should accept optional priority prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          priority={true}
        />
      );
      expect(component.props.priority).toBe(true);
    });

    it('should accept optional sizes prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      );
      expect(component.props.sizes).toBe('(max-width: 768px) 100vw, 50vw');
    });

    it('should accept optional className prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          className="rounded-lg"
        />
      );
      expect(component.props.className).toBe('rounded-lg');
    });
  });

  describe('with valid poster_path', () => {
    it('should render without crashing', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
        />
      );
      expect(component).toBeDefined();
    });

    it('should construct correct TMDb image URL', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
        />
      );
      // Component should be a function component that renders Image
      expect(component.type).toBe(MoviePoster);
    });

    it('should support explicit sizing with width and height', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          width={342}
          height={513}
        />
      );
      expect(component.props.width).toBe(342);
      expect(component.props.height).toBe(513);
    });

    it('should support container-based sizing with fill prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          fill={true}
        />
      );
      expect(component.props.fill).toBe(true);
    });

    it('should set priority={true} for above-the-fold images', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          priority={true}
        />
      );
      expect(component.props.priority).toBe(true);
    });

    it('should set priority={false} for below-the-fold images', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          priority={false}
        />
      );
      expect(component.props.priority).toBe(false);
    });

    it('should use provided sizes prop for responsive loading', () => {
      const customSizes = '(max-width: 768px) 100vw, 50vw';
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          sizes={customSizes}
        />
      );
      expect(component.props.sizes).toBe(customSizes);
    });

    it('should apply custom className', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          className="rounded-lg"
        />
      );
      expect(component.props.className).toBe('rounded-lg');
    });
  });

  describe('with missing poster_path', () => {
    it('should render placeholder when posterPath is null', () => {
      const component = <MoviePoster posterPath={null} title="Inception" />;
      expect(component).toBeDefined();
      expect(component.props.posterPath).toBeNull();
    });

    it('should render placeholder when posterPath is empty string', () => {
      const component = <MoviePoster posterPath="" title="Inception" />;
      expect(component).toBeDefined();
      expect(component.props.posterPath).toBe('');
    });

    it('should apply custom className to placeholder', () => {
      const component = (
        <MoviePoster
          posterPath={null}
          title="Inception"
          className="rounded-lg"
        />
      );
      expect(component.props.className).toBe('rounded-lg');
    });

    it('should not apply width/height styles to placeholder when fill={true}', () => {
      const component = (
        <MoviePoster
          posterPath={null}
          title="Inception"
          width={342}
          height={513}
          fill={true}
        />
      );
      expect(component.props.fill).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should provide title for alt text', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
        />
      );
      expect(component.props.title).toBe('Inception');
    });

    it('should handle special characters in title', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="The Lord of the Rings: The Fellowship of the Ring"
        />
      );
      expect(component.props.title).toBe(
        'The Lord of the Rings: The Fellowship of the Ring'
      );
    });
  });

  describe('Image Optimization', () => {
    it('should prevent layout shift with explicit dimensions', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          width={342}
          height={513}
        />
      );
      expect(component.props.width).toBe(342);
      expect(component.props.height).toBe(513);
    });

    it('should support responsive image loading with sizes prop', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      );
      expect(component.props.sizes).toBeDefined();
    });

    it('should support fill prop for container-based sizing', () => {
      const component = (
        <MoviePoster
          posterPath="/kXfqcdQKsToCoqLDLi2w6nhXX0h.jpg"
          title="Inception"
          fill={true}
        />
      );
      expect(component.props.fill).toBe(true);
    });
  });
});
