# Bugfix Requirements Document

## Introduction

The Vidsrc streaming player iframe is missing the `allow-popups` sandbox permission, which is required for video playback. The player loads successfully but videos fail to play because the iframe cannot open popups needed for player controls, ads, and other functionality. This fix adds the missing sandbox permission to enable proper video playback while maintaining security constraints.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user attempts to play a video in the Vidsrc streaming player THEN the iframe blocks popup requests with the error "Blocked opening 'about:blank' in a new window because the request was made in a sandboxed frame whose 'allow-popups' permission is not set"

1.2 WHEN a user attempts to play a video in the Vidsrc streaming player THEN the iframe blocks external popup requests with the error "Blocked opening 'https://invl.io/...' in a new window because the request was made in a sandboxed frame whose 'allow-popups' permission is not set"

1.3 WHEN the player attempts to initialize video playback functionality THEN the player fails to open necessary popups for controls, ads, or other player features

### Expected Behavior (Correct)

2.1 WHEN a user attempts to play a video in the Vidsrc streaming player THEN the iframe SHALL allow popup requests without blocking them

2.2 WHEN a user attempts to play a video in the Vidsrc streaming player THEN the iframe SHALL allow external popup requests to open successfully

2.3 WHEN the player attempts to initialize video playback functionality THEN the player SHALL successfully open popups for controls, ads, and other player features

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the iframe is loaded THEN the system SHALL CONTINUE TO enforce all other sandbox restrictions (no allow-top-navigation, no allow-same-origin-by-default)

3.2 WHEN the iframe is loaded THEN the system SHALL CONTINUE TO maintain the referrer policy as no-referrer to prevent referrer leakage

3.3 WHEN the iframe is loaded THEN the system SHALL CONTINUE TO require HTTPS URLs only from whitelisted domains

3.4 WHEN the iframe is loaded THEN the system SHALL CONTINUE TO maintain allow-scripts, allow-same-origin, and allow-presentation permissions
