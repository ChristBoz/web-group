# Event Filter Module

## Overview

The Event Filter module (`scripts/event-filter.js`) provides robust client-side event filtering with support for:

- **Normalized category matching**: Case-insensitive, handles whitespace variations, ampersands (&, &amp;), and punctuation
- **Multiple types per event**: Supports comma, pipe, or slash-separated event types
- **Data attribute support**: Uses `data-category-slug` and `data-event-slug` for stable matching
- **Backwards compatible**: Falls back to text content when data attributes aren't present
- **Delegated event handling**: Works with dynamically added elements
- **Pre-selected categories**: Automatically applies filters on page load if a category is active

## Usage

### Basic Setup

Include the script in your HTML before your main application script:

```html
<script src="scripts/event-filter.js"></script>
<script type="module" src="scripts/index.js"></script>
```

### Programmatic Filtering

Filter events by category slug or label:

```javascript
// Filter by category slug
EventFilter.filter('music');

// Filter by label (will be normalized)
EventFilter.filter('Food & Drinks');

// Show all events
EventFilter.filter('');
```

### Automatic Click Handling (Optional)

To enable automatic click handling for category buttons:

```javascript
EventFilter.setup();
```

This sets up delegated event handlers that:
- Listen for clicks on `.category-btn` or `.genre-chip` elements
- Update the active state
- Apply the filter automatically

**Note**: If you already have custom click handlers, you can skip calling `setup()` and just use `EventFilter.filter()` directly.

## Adding Data Attributes to Templates

### Category Buttons

Add `data-category-slug` to category/genre buttons:

```html
<button class="genre-chip" data-category-slug="music">
  Music
</button>

<button class="genre-chip" data-category-slug="food-drink">
  Food & Drinks
</button>
```

The slug should be:
- Lowercase
- Hyphenated (not spaces)
- Normalized (no ampersands, use "and" instead)

### Event Items

Add `data-event-slug` or `data-type` to event elements:

```html
<div class="event-card" 
     data-event-slug="music" 
     data-type="Music, Concert">
  <!-- Event content -->
</div>
```

For events with multiple types, separate them with commas, pipes, or slashes:

```html
<div class="event-card" data-type="Junkbox, Music">
  <!-- Event content -->
</div>
```

## How Filtering Works

### String Normalization

All category names and event types are normalized before comparison:
1. Trimmed of whitespace
2. Converted to lowercase
3. Multiple spaces collapsed to single space
4. `&amp;` and `&` replaced with "and"
5. Dashes and underscores normalized

Examples:
- "Food & Drinks" → "food and drinks"
- "Arts  &amp;  Culture" → "arts and culture"
- "Junk Box" → "junk box"

### Matching Logic

An event is shown if ANY of its types match the selected category:

```javascript
// Event with data-type="Music, Concert"
// Will match filters: "music", "concert", "Music & Concerts"
```

### Multiple Types

Events can have multiple types by separating them with:
- Commas: `"Music, Concert, Festival"`
- Pipes: `"Music | Concert | Festival"`
- Slashes: `"Music / Concert / Festival"`

## Integration with Existing Code

### JavaScript Integration

In your main script (e.g., `index.js`), call `EventFilter.filter()` when the category changes:

```javascript
function selectGenre(genreSlug) {
  selectedGenre = genreSlug || "";
  
  // Update UI
  document.querySelectorAll(".genre-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.genre === selectedGenre);
  });
  
  // Apply filter
  if (window.EventFilter) {
    window.EventFilter.filter(selectedGenre);
  }
}
```

### Dynamic Event Rendering

When rendering event cards dynamically, add data attributes:

```javascript
function createEventCard(event) {
  const card = document.createElement("div");
  card.className = "event-card";
  
  // Add data attributes for filtering
  if (event.genre_slug) {
    card.dataset.eventSlug = event.genre_slug;
  }
  if (event.genre_name) {
    card.dataset.type = event.genre_name;
  }
  
  // ... rest of card creation
  
  return card;
}
```

After rendering events, optionally call the filter to apply current selection:

```javascript
function renderEvents() {
  const container = document.getElementById("events-container");
  container.innerHTML = "";
  allEvents.forEach((event) => container.appendChild(createEventCard(event)));
  
  // Apply current filter
  if (window.EventFilter && selectedGenre) {
    window.EventFilter.filter(selectedGenre);
  }
}
```

## Backwards Compatibility

The module gracefully handles missing data attributes:

1. **Category buttons without `data-category-slug`**: Falls back to `data-genre` or text content
2. **Event items without `data-event-slug`**: Falls back to `data-type`, `data-genre`, or visible genre tags (`.event-genre-tag`)

This means you can gradually add data attributes without breaking existing functionality.

## Testing

### Manual Testing

1. **Basic filtering**: Click different category buttons and verify events are shown/hidden correctly
2. **Case variations**: Test with categories like "Music" vs "music"
3. **Ampersands**: Test with "Food & Drinks" vs "Food and Drinks"
4. **Multiple types**: Create events with comma-separated types and verify they appear in multiple categories
5. **Pre-selected**: Load page with a category already active and verify filter is applied
6. **Dynamic elements**: Add events or category buttons dynamically and verify filtering still works

### Programmatic Testing

```javascript
// Test normalization
console.log(EventFilter._normalize("Food & Drinks")); // "food and drinks"
console.log(EventFilter._normalize("  Arts  &amp;  Culture  ")); // "arts and culture"

// Test type extraction
console.log(EventFilter._extractTypes("Music, Concert, Festival")); 
// ["music", "concert", "festival"]

// Test filtering
EventFilter.filter('music');  // Should show only music events
EventFilter.filter('');       // Should show all events
```

## Troubleshooting

### Events not showing after filter

1. Check that event elements have class `.event-card`
2. Verify data attributes are set correctly: `data-event-slug` or `data-type`
3. Check console for JavaScript errors
4. Verify the category slug matches event types (after normalization)

### Filter not applying on page load

1. Ensure the active category button has class `.active`
2. Verify the button has `data-category-slug`, `data-genre`, or text content
3. Check that events are rendered BEFORE the filter is applied

### Multiple clicks needed

This was the original bug that this module fixes. If you still experience this:
1. Verify you're using `EventFilter.filter()` instead of server-side reloads
2. Check that the filter is applied after events are rendered
3. Ensure there are no conflicting click handlers

## Example Implementation

See `scripts/index.js` for a complete implementation example of integrating the Event Filter module with genre chips and event cards.
