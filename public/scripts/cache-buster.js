/**
 * Cache Buster Utility
 * 
 * A reusable module for forcing browsers to fetch fresh assets by appending
 * version query parameters to CSS and JS files. Perfect for development
 * and immediate updates on static sites.
 * 
 * Usage:
 * - Vanilla JS: import { bustCache } from './cache-buster.js'; bustCache();
 * - React: import { bustCache } from './utils/cache-buster.js'; useEffect(() => bustCache(), []);
 */

/**
 * Forces browsers to fetch fresh assets by appending version query parameters
 * @param {Object} options - Configuration options
 * @param {boolean} options.useTimestamp - Use timestamp for versioning (default: true)
 * @param {string} options.customVersion - Custom version string to use instead of timestamp
 * @param {boolean} options.updateCSS - Update CSS link tags (default: true)
 * @param {boolean} options.updateJS - Update JS script tags with data-bust attribute (default: true)
 * @param {boolean} options.forceReload - Force page reload after cache busting (default: false)
 * @param {boolean} options.verbose - Log actions to console (default: false)
 */
export function bustCache(options = {}) {
  const {
    useTimestamp = true,
    customVersion = null,
    updateCSS = true,
    updateJS = true,
    forceReload = false,
    verbose = false
  } = options;

  // Generate version string
  const version = customVersion || (useTimestamp ? Date.now().toString() : 'v1');
  
  if (verbose) {
    console.log(`[CacheBuster] Starting cache bust with version: ${version}`);
  }

  let updatedCount = 0;

  // Update CSS files
  if (updateCSS) {
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"][href]');
    cssLinks.forEach((link) => {
      const originalHref = link.getAttribute('href');
      const cleanHref = originalHref.split('?')[0]; // Remove existing query params
      const newHref = `${cleanHref}?v=${version}`;
      
      if (originalHref !== newHref) {
        link.setAttribute('href', newHref);
        updatedCount++;
        
        if (verbose) {
          console.log(`[CacheBuster] Updated CSS: ${cleanHref} -> ${newHref}`);
        }
      }
    });
  }

  // Update JS files marked with data-bust attribute
  if (updateJS) {
    const scriptTags = document.querySelectorAll('script[data-bust][src]');
    scriptTags.forEach((oldScript) => {
      const originalSrc = oldScript.getAttribute('src');
      const cleanSrc = originalSrc.split('?')[0]; // Remove existing query params
      const newSrc = `${cleanSrc}?v=${version}`;
      
      if (originalSrc !== newSrc) {
        // Create new script element
        const newScript = document.createElement('script');
        newScript.src = newSrc;
        
        // Copy all attributes except src
        Array.from(oldScript.attributes).forEach((attr) => {
          if (attr.name !== 'src') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        // Replace old script with new one
        oldScript.parentNode.replaceChild(newScript, oldScript);
        updatedCount++;
        
        if (verbose) {
          console.log(`[CacheBuster] Updated JS: ${cleanSrc} -> ${newSrc}`);
        }
      }
    });
  }

  if (verbose) {
    console.log(`[CacheBuster] Cache bust complete. Updated ${updatedCount} files.`);
  }

  // Optional: Force page reload
  if (forceReload) {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  return {
    version,
    updatedCount,
    success: true
  };
}

/**
 * React-specific hook for cache busting
 * Usage: useCacheBuster({ verbose: true });
 */
export function useCacheBuster(options = {}) {
  // Check if React is available
  if (typeof window !== 'undefined' && window.React && window.React.useEffect) {
    const { useEffect } = window.React;
    
    useEffect(() => {
      bustCache(options);
    }, []);
  } else {
    console.warn('[CacheBuster] React not detected. Use bustCache() directly instead.');
  }
}

/**
 * Automatic cache busting that runs immediately when module loads
 * Good for development environments
 */
export function autoBustCache(options = {}) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bustCache(options));
  } else {
    bustCache(options);
  }
}

/**
 * Advanced: Service Worker cleanup + cache bust
 * Use this if you have persistent caching issues
 */
export async function nukeCacheAndReload() {
  try {
    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // Clear browser cache (if supported)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Force reload with cache bust
    const url = window.location.href.split('?')[0].split('#')[0];
    const hash = window.location.hash || '';
    window.location.replace(`${url}?_nuke=${Date.now()}${hash}`);
    
  } catch (error) {
    console.error('[CacheBuster] Error during cache nuke:', error);
    // Fallback to regular cache bust + reload
    bustCache({ forceReload: true });
  }
}

// Default export for convenience
export default bustCache;