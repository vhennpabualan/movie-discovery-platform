# Feature Preview

## Visual Guide to New Streaming Features

### 1. Video Quality Badge

The quality badge appears at the top of the streaming player:

```
┌─────────────────────────────────────────┐
│  [HD]  ← Quality Badge (Green)          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │                                   │ │
│  │                                   │ │
│  │        VIDEO PLAYER               │ │
│  │                                   │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Quality Badge Colors:**

```
[4K]      - Purple badge (bg-purple-600/20, text-purple-400)
[BLURAY]  - Purple badge (bg-purple-600/20, text-purple-400)
[HD]      - Green badge (bg-green-600/20, text-green-400)
[WEBRIP]  - Green badge (bg-green-600/20, text-green-400)
[DVDRIP]  - Blue badge (bg-blue-600/20, text-blue-400)
[TS]      - Yellow badge (bg-yellow-600/20, text-yellow-400)
[TC]      - Yellow badge (bg-yellow-600/20, text-yellow-400)
[CAM]     - Red badge (bg-red-600/20, text-red-400)
```

### 2. Season & Episode Selector (TV Shows)

The selector appears in a styled container above the player controls:

```
┌─────────────────────────────────────────────────────────────┐
│  Season & Episode Selection                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Season: [1 ▼]  Episode: [1 ▼]  [← Prev] [Next →]   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Subtitles: [English ▼]    Server: [vidsrc-embed.ru ▼]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                      VIDEO PLAYER                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Complete Movie Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────┐  Fight Club                                     │
│  │        │  1999                                            │
│  │ POSTER │  ★★★★★ 8.8/10                                   │
│  │        │                                                  │
│  │        │  Runtime: 2h 19m                                 │
│  └────────┘  Genres: [Drama] [Thriller]                     │
│                                                              │
│              Overview                                        │
│              An insomniac office worker and a...            │
│                                                              │
│              [Add to Watchlist]                              │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Related Movies                                              │
│  [Movie 1] [Movie 2] [Movie 3] [Movie 4]                    │
├──────────────────────────────────────────────────────────────┤
│  Watch Now                                                   │
│  [HD]  ← Quality Badge                                      │
│                                                              │
│  Subtitles: [English ▼]    Server: [vidsrc-embed.ru ▼]     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │                   VIDEO PLAYER                         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 4. Complete TV Show Page Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────┐  Game of Thrones                                │
│  │        │  2011 - 2019                                     │
│  │ POSTER │  ★★★★★ 9.2/10                                   │
│  │        │                                                  │
│  │        │  Seasons & Episodes: 8 Seasons • 73 Episodes    │
│  └────────┘  Genres: [Drama] [Fantasy] [Adventure]          │
│              Status: Ended                                   │
│                                                              │
│              Overview                                        │
│              Nine noble families fight for control...        │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Watch Now                                                   │
│  [HD]  ← Quality Badge                                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Season: [1 ▼]  Episode: [1 ▼]  [← Prev] [Next →]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Subtitles: [English ▼]    Server: [vidsrc-embed.ru ▼]     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │                   VIDEO PLAYER                         │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│  Seasons                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │Season 1 │ │Season 2 │ │Season 3 │ │Season 4 │          │
│  │10 Eps   │ │10 Eps   │ │10 Eps   │ │10 Eps   │          │
│  │2011     │ │2012     │ │2013     │ │2014     │          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
└──────────────────────────────────────────────────────────────┘
```

### 5. Mobile Layout (TV Show)

```
┌─────────────────────────┐
│  Game of Thrones        │
│  2011 - 2019            │
│  ★★★★★ 9.2/10          │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │      POSTER       │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  8 Seasons • 73 Eps     │
│  [Drama] [Fantasy]      │
│                         │
│  Overview...            │
│                         │
├─────────────────────────┤
│  Watch Now              │
│  [HD]                   │
│                         │
│  Season: [1 ▼]          │
│  Episode: [1 ▼]         │
│  [← Prev] [Next →]      │
│                         │
│  Subtitles: [EN ▼]      │
│  Server: [vsrc.su ▼]    │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   VIDEO PLAYER    │  │
│  │                   │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

### 6. Interactive Behavior

#### Season Change Flow

```
User selects Season 2
    ↓
Episode automatically resets to 1
    ↓
onSeasonChange(2) callback fires
    ↓
onEpisodeChange(1) callback fires
    ↓
Player reloads with new URL
```

#### Next Button Flow

```
Current: Season 1, Episode 5 (of 10)
User clicks "Next →"
    ↓
Episode changes to 6
    ↓
onEpisodeChange(6) fires
    ↓
Player reloads

Current: Season 1, Episode 10 (last of season)
User clicks "Next →"
    ↓
Season changes to 2
Episode changes to 1
    ↓
onSeasonChange(2) fires
onEpisodeChange(1) fires
    ↓
Player reloads
```

#### Prev Button Flow

```
Current: Season 2, Episode 1
User clicks "← Prev"
    ↓
Season changes to 1
Episode changes to 10 (last episode of Season 1)
    ↓
onSeasonChange(1) fires
onEpisodeChange(10) fires
    ↓
Player reloads
```

### 7. Responsive Breakpoints

```
Mobile (< 640px):
- Selectors stack vertically
- Full-width controls
- Compact spacing

Tablet (640px - 768px):
- Selectors in row
- Medium spacing
- Optimized touch targets

Desktop (> 768px):
- All controls in single row
- Maximum spacing
- Hover effects enabled
```

### 8. Accessibility Features

```
Keyboard Navigation:
- Tab: Move between controls
- Enter/Space: Activate buttons
- Arrow keys: Navigate dropdowns

Screen Reader:
- "Select season" label
- "Select episode" label
- "Previous episode" button
- "Next episode" button
- "Video quality: HD" badge
- "Rating: 8.8 out of 10"

Focus Indicators:
- Blue ring on focus (ring-2 ring-netflix-red)
- Visible on all interactive elements
```

### 9. State Management

```typescript
// Internal state in VidsrcStreamingPlayer
const [currentSeason, setCurrentSeason] = useState(initialSeason || 1);
const [currentEpisode, setCurrentEpisode] = useState(initialEpisode || 1);

// When season changes:
handleSeasonChange(newSeason) {
  setCurrentSeason(newSeason);
  setCurrentEpisode(1);  // Reset to episode 1
  onSeasonChange?.(newSeason);
  onEpisodeChange?.(1);
}

// When episode changes:
handleEpisodeChange(newEpisode) {
  setCurrentEpisode(newEpisode);
  onEpisodeChange?.(newEpisode);
}
```

### 10. URL Structure

```
Movies:
/movies/550
  → Shows movie with ID 550
  → Quality badge: HD

TV Shows:
/tv/1399
  → Shows TV show with ID 1399
  → Default: Season 1, Episode 1

/tv/1399?season=2&episode=5
  → Shows Season 2, Episode 5
  → Selector reflects current season/episode
```

## Component Hierarchy

```
VidsrcStreamingPlayer
├── VideoQualityBadge (if videoQuality provided)
├── SeasonEpisodeSelector (if contentType === 'tv')
│   ├── Season Dropdown
│   ├── Episode Dropdown
│   ├── Prev Button
│   └── Next Button
├── SubtitleLanguageSelector
├── Domain Selector
└── Iframe Player
```

## Styling Details

### Quality Badge Styles

```css
/* Base badge styles */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.25rem;
  border-width: 1px;
}

/* HD Badge */
.badge-hd {
  background-color: rgba(22, 163, 74, 0.2);
  color: rgb(74, 222, 128);
  border-color: rgba(34, 197, 94, 0.5);
}

/* 4K Badge */
.badge-4k {
  background-color: rgba(147, 51, 234, 0.2);
  color: rgb(192, 132, 252);
  border-color: rgba(168, 85, 247, 0.5);
}
```

### Selector Container Styles

```css
.selector-container {
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: rgba(17, 24, 39, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgb(31, 41, 55);
}
```

## Testing Checklist

- [ ] Quality badge displays correctly for all quality types
- [ ] Season selector shows all available seasons
- [ ] Episode selector shows correct episode count
- [ ] Prev button disabled on S1E1
- [ ] Next button disabled on last episode of last season
- [ ] Season change resets episode to 1
- [ ] Callbacks fire correctly
- [ ] Player reloads with new URL
- [ ] Mobile layout works correctly
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Focus indicators visible
- [ ] Colors meet WCAG AA contrast
