/**
 * Bug Condition Exploration Test: fail() Function Undefined
 * 
 * This test demonstrates that the fail() function is not defined in Jest.
 * The fail() function is used in movie-parser.test.ts on lines 88 and 103,
 * but Jest doesn't provide this function globally.
 * 
 * **EXPECTED OUTCOME**: This test FAILS on unfixed code with "fail is not defined" error
 * This failure confirms the bug exists.
 * 
 * **Validates: Requirements 1.4**
 */

import { parseMovie, MovieParseError } from './movie-parser';

describe('Bug Condition Exploration: fail() Function Undefined', () => {
  it('should demonstrate that fail() function is undefined in Jest', () => {
    /**
     * Bug Condition: When test files attempt to use fail() function,
     * the system throws "fail is not defined" error because Jest doesn't provide this function.
     * 
     * This test demonstrates the bug by attempting to use fail() in a try-catch block,
     * which is the pattern used in movie-parser.test.ts lines 88 and 103.
     */
    const incompleteData = {
      id: 550,
      title: 'Fight Club',
      // missing poster_path and release_date
    };

    try {
      parseMovie(incompleteData);
      // This is where the bug manifests - fail() is not defined
      fail('Should have thrown MovieParseError');
    } catch (error) {
      // The error caught here should be MovieParseError, but instead it's ReferenceError
      // because fail() is not defined in Jest
      expect(error).toBeInstanceOf(MovieParseError);
    }
  });

  it('should demonstrate fail() usage pattern from line 88 of movie-parser.test.ts', () => {
    /**
     * This test replicates the exact pattern from movie-parser.test.ts line 88:
     * 
     * try {
     *   parseMovie(incompleteData);
     *   fail('Should have thrown MovieParseError');
     * } catch (error) {
     *   expect(error).toBeInstanceOf(MovieParseError);
     *   expect((error as MovieParseError).validationErrors).toBeDefined();
     * }
     * 
     * The bug: fail() is not defined, so this throws ReferenceError instead of
     * properly failing the test when parseMovie doesn't throw.
     */
    const incompleteData = {
      id: 550,
      title: 'Fight Club',
    };

    try {
      parseMovie(incompleteData);
      fail('Should have thrown MovieParseError');
    } catch (error) {
      expect(error).toBeInstanceOf(MovieParseError);
      expect((error as MovieParseError).validationErrors).toBeDefined();
    }
  });

  it('should demonstrate fail() usage pattern from line 103 of movie-parser.test.ts', () => {
    /**
     * This test replicates the exact pattern from movie-parser.test.ts line 103:
     * 
     * try {
     *   parseMovie(incompleteData);
     *   fail('Should have thrown MovieParseError');
     * } catch (error) {
     *   expect((error as MovieParseError).message).toContain('Failed to parse movie data');
     *   expect((error as MovieParseError).message).toContain('Missing or invalid fields');
     * }
     * 
     * The bug: fail() is not defined, so this throws ReferenceError instead of
     * properly failing the test when parseMovie doesn't throw.
     */
    const incompleteData = {
      id: 550,
      title: 'Fight Club',
    };

    try {
      parseMovie(incompleteData);
      fail('Should have thrown MovieParseError');
    } catch (error) {
      expect((error as MovieParseError).message).toContain('Failed to parse movie data');
      expect((error as MovieParseError).message).toContain('Missing or invalid fields');
    }
  });

  it('should document that Jest does not provide a global fail() function', () => {
    /**
     * Bug Documentation:
     * 
     * Jest does not provide a global fail() function. The fail() function is not part of
     * the Jest API. When code attempts to call fail(), it results in a ReferenceError:
     * "fail is not defined".
     * 
     * The correct approach in Jest is to use:
     * 1. throw new Error('message') - to throw an error that fails the test
     * 2. expect().toThrow() - to assert that a function throws
     * 3. expect().rejects.toThrow() - for async functions
     * 
     * Current usage in movie-parser.test.ts:
     * - Line 88: fail('Should have thrown MovieParseError')
     * - Line 103: fail('Should have thrown MovieParseError')
     * 
     * These should be replaced with: throw new Error('Should have thrown MovieParseError')
     */
    
    // Verify that fail is not defined
    expect(() => {
      // @ts-ignore - intentionally calling undefined function to demonstrate bug
      fail('This should fail because fail is not defined');
    }).toThrow('fail is not defined');
  });
});
