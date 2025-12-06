/**
 * Event Filter Module
 * 
 * Provides robust client-side event filtering with:
 * - Normalized category matching (case-insensitive, whitespace, ampersands)
 * - Support for multiple types per event (comma/pipe-separated)
 * - Data attribute support for stable slugs (data-category-slug, data-event-slug)
 * - Delegated event handling for dynamically added elements
 * - Backwards-compatible label fallback when data attributes aren't present
 */

(function() {
  'use strict';

  /**
   * Normalize a string for comparison
   * - Trim whitespace
   * - Convert to lowercase
   * - Collapse multiple spaces to single space
   * - Replace &amp; and & with "and"
   * - Normalize dashes and underscores
   */
  function normalizeString(str) {
    if (!str) return '';
    return String(str)
      .trim()
      .toLowerCase()
      .replace(/&amp;/gi, 'and')
      .replace(/&/g, 'and')
      .replace(/\s+/g, ' ')
      .replace(/[-_]+/g, '-');
  }

  /**
   * Extract multiple types from a string (split by comma, pipe, or slash)
   */
  function extractTypes(typeString) {
    if (!typeString) return [];
    return String(typeString)
      .split(/[,|\/]/)
      .map(t => normalizeString(t))
      .filter(t => t.length > 0);
  }

  /**
   * Get the normalized category slug from a button element
   * Prefers data-category-slug, falls back to data-genre, then text content
   */
  function getCategorySlug(button) {
    if (!button) return '';
    
    // Prefer explicit slug attribute
    if (button.dataset.categorySlug) {
      return normalizeString(button.dataset.categorySlug);
    }
    
    // Try genre attribute (existing in the codebase)
    if (button.dataset.genre) {
      return normalizeString(button.dataset.genre);
    }
    
    // Fallback to visible text
    return normalizeString(button.textContent);
  }

  /**
   * Get normalized event types from an event element
   * Checks data-event-slug, data-type, data-genre, and visible genre tags
   */
  function getEventTypes(eventElement) {
    const types = [];
    
    // Check data-event-slug attribute
    if (eventElement.dataset.eventSlug) {
      types.push(...extractTypes(eventElement.dataset.eventSlug));
    }
    
    // Check data-type attribute
    if (eventElement.dataset.type) {
      types.push(...extractTypes(eventElement.dataset.type));
    }
    
    // Check data-genre attribute (existing in codebase)
    if (eventElement.dataset.genre) {
      types.push(...extractTypes(eventElement.dataset.genre));
    }
    
    // Fallback: check visible genre tags
    const genreTags = eventElement.querySelectorAll('.event-genre-tag');
    genreTags.forEach(tag => {
      const normalized = normalizeString(tag.textContent);
      if (normalized) types.push(normalized);
    });
    
    // Remove duplicates
    return [...new Set(types)];
  }

  /**
   * Check if an event matches a category
   */
  function eventMatchesCategory(eventElement, categorySlug) {
    // Empty category means "all events"
    if (!categorySlug || categorySlug === 'all' || categorySlug === 'all-events') {
      return true;
    }
    
    const eventTypes = getEventTypes(eventElement);
    const normalizedCategory = normalizeString(categorySlug);
    
    // Check if any event type matches the category
    return eventTypes.some(type => {
      return type === normalizedCategory || 
             type.includes(normalizedCategory) ||
             normalizedCategory.includes(type);
    });
  }

  /**
   * Apply filter to show/hide events based on category
   */
  function applyFilter(categorySlug) {
    const eventItems = document.querySelectorAll('.event-card');
    
    eventItems.forEach(event => {
      const matches = eventMatchesCategory(event, categorySlug);
      
      // Use inline style.display to toggle visibility
      // Preserve any existing visibility classes
      if (matches) {
        event.style.display = '';
      } else {
        event.style.display = 'none';
      }
    });
  }

  /**
   * Handle category button click
   */
  function handleCategoryClick(event) {
    const button = event.target.closest('.category-btn, .genre-chip');
    if (!button) return;
    
    event.preventDefault();
    
    // Get category slug
    const categorySlug = getCategorySlug(button);
    
    // Update active state
    const allButtons = document.querySelectorAll('.category-btn, .genre-chip');
    allButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    // Apply filter
    applyFilter(categorySlug);
  }

  /**
   * Initialize event filter on page load
   */
  function initOnLoad() {
    // Check if there's a pre-selected category
    const activeButton = document.querySelector('.category-btn.active, .genre-chip.active');
    if (activeButton) {
      const categorySlug = getCategorySlug(activeButton);
      applyFilter(categorySlug);
    }
  }

  /**
   * Setup the event filter system
   * Uses delegated event handling for dynamic elements
   */
  function setup() {
    // Use delegated event handling on document for dynamic elements
    document.addEventListener('click', handleCategoryClick);
    
    // Apply filter on load if there's an active category
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initOnLoad);
    } else {
      initOnLoad();
    }
  }

  /**
   * Public API - programmatically filter by category slug or label
   */
  function filter(slugOrLabel) {
    const normalized = normalizeString(slugOrLabel);
    applyFilter(normalized);
  }

  // Export public API
  window.EventFilter = {
    setup: setup,
    filter: filter,
    // Expose utilities for testing
    _normalize: normalizeString,
    _extractTypes: extractTypes,
    _getCategorySlug: getCategorySlug,
    _getEventTypes: getEventTypes
  };
})();
