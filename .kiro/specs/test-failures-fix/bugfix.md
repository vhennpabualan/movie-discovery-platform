# Bugfix Requirements Document

## Introduction

This document addresses 9 failing tests across three test suites caused by overly permissive validation schemas and missing callback invocations in the MovieCard component. The validation schemas use `.default()` values that prevent rejection of missing required fields, the MovieCard component doesn't invoke the `onClick` callback, and test files use an undefined `fail()` function instead of throwing errors.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN validation schemas have `.default('')` or `.nullable().default(null)` on required fields THEN the system accepts missing required fields instead of rejecting them

1.2 WHEN the MovieCard component's `handleClick` handler is invoked THEN the system only calls `navigateWithTransition()` without invoking the `onClick` prop callback

1.3 WHEN the MovieCard component's `handleKeyDown` handler detects an Enter key press THEN the system only calls `navigateWithTransition()` without invoking the `onClick` prop callback

1.4 WHEN test files attempt to use `fail()` function THEN the system throws "fail is not defined" error because Jest doesn't provide this function

1.5 WHEN validation receives data with empty strings for required fields THEN the system accepts the empty strings instead of rejecting them

### Expected Behavior (Correct)

2.1 WHEN validation schemas have required fields THEN the system SHALL reject data missing those required fields with a validation error

2.2 WHEN the MovieCard component's `handleClick` handler is invoked THEN the system SHALL call the `onClick` prop callback with the movie ID and also call `navigateWithTransition()`

2.3 WHEN the MovieCard component's `handleKeyDown` handler detects an Enter key press THEN the system SHALL call the `onClick` prop callback with the movie ID and also call `navigateWithTransition()`

2.4 WHEN test files need to fail a test THEN the system SHALL use `throw new Error()` instead of calling an undefined `fail()` function

2.5 WHEN validation receives data with empty strings for required string fields THEN the system SHALL reject the empty strings with a validation error

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the MovieCard component receives valid movie data THEN the system SHALL CONTINUE TO render the poster image, title, and rating correctly

3.2 WHEN the MovieCard component is hovered THEN the system SHALL CONTINUE TO display the hover overlay with title and rating

3.3 WHEN the MovieCard component receives a watchlist status THEN the system SHALL CONTINUE TO display the watchlist badge correctly

3.4 WHEN the MovieCard component receives keyboard input other than Enter THEN the system SHALL CONTINUE TO not trigger navigation or onClick callbacks

3.5 WHEN validation receives valid data with all required fields present THEN the system SHALL CONTINUE TO accept and return the data correctly

3.6 WHEN validation receives data with valid optional fields THEN the system SHALL CONTINUE TO apply default values for missing optional fields
