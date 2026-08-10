/**
 * Utility functions for UTM parameter tracking
 * Follows the same pattern as endorsely.js
 */

const UTM_STORAGE_KEY = 'utm_data';
// Everything an ad or funnel may arrive with. `funnel` matters most: the CSV export
// reads it before any utm_* key, so dropping it here meant the Funnel column could
// never be filled. Click ids let a purchase be traced back when utm_* are absent.
const UTM_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'funnel', 'gclid', 'fbclid', 'ttclid',
];

/**
 * Capture UTM parameters from URL and store in localStorage (first-touch attribution).
 * @param {URLSearchParams} [searchParams] - URL search parameters; read from the current
 *   URL when omitted, so this works from any entry point without a Suspense boundary.
 * @returns {object|null} The captured UTM data or null if none found or already exists
 */
export function captureUtmParams(searchParams) {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = searchParams ?? new URLSearchParams(window.location.search);

  // First-touch attribution: only capture if no UTM data exists
  if (localStorage.getItem(UTM_STORAGE_KEY)) {
    return null;
  }

  const utmData = {};
  let hasUtmParams = false;

  UTM_PARAMS.forEach((param) => {
    const value = params.get(param);
    if (value) {
      utmData[param] = value;
      hasUtmParams = true;
    }
  });

  if (hasUtmParams) {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
    return utmData;
  }

  return null;
}

/**
 * Get stored UTM data from localStorage
 * @returns {object|null} The stored UTM data or null
 */
export function getUtmData() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(UTM_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing UTM data:', e);
      return null;
    }
  }
  return null;
}

/**
 * Clear UTM data from localStorage
 */
export function clearUtmData() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(UTM_STORAGE_KEY);
  }
}
