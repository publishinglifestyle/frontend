/**
 * Utility functions for Endorsely integration
 */

/**
 * Get the Endorsely referral ID from the window object
 * @returns {string|undefined} The referral ID if available
 */
export function getEndorselyReferral() {
  if (typeof window !== 'undefined' && window.endorsely_referral) {
    return window.endorsely_referral;
  }
  return undefined;
}

/**
 * Check if Endorsely script is loaded
 * @returns {boolean} True if Endorsely is available
 */
export function isEndorselyLoaded() {
  return typeof window !== 'undefined' && 'endorsely_referral' in window;
}

/**
 * Log Endorsely referral information for debugging
 */
export function logEndorselyInfo() {
  if (typeof window !== 'undefined') {
    console.log('Endorsely referral ID:', window.endorsely_referral);
    console.log('Endorsely script loaded:', isEndorselyLoaded());
  }
} 