/**
 * React Cache Buster Utility
 * 
 * Adapted cache busting for React applications. Forces browsers to fetch
 * fresh assets by appending version query parameters.
 * 
 * Usage in React components:
 * import { useCacheBuster } from '../utils/cache-buster';
 * useCacheBuster({ verbose: true });
 */

import { useEffect } from 'react';

/**
 * Forces browsers to fetch fresh assets by appending version query parameters
 * @param {Object} options - Configuration options
 * @param {boolean} options.useTimestamp - Use timestamp for versioning (default: true)
 * @param {string} options.customVersion - Custom version string to use instead of timestamp
 * @param {boolean} options.updateCSS - Update CSS link tags (default: true)
 * @param {boolean} options.forceReload - Force page reload after cache busting (default: false)
 * @param {boolean} options.verbose - Log actions to console (default: false)
 */
export function bustCache(options = {}) {
  const {
    useTimestamp = true,
    customVersion = null,
    updateCSS = true,
    forceReload = false,
    verbose = false
  } = options;

  // Generate version string
  const version = customVersion || (useTimestamp ? Date.now().toString() : 'v1');
  
  if (verbose) {
    console.log(`[CacheBuster] Starting cache bust with version: ${version}`);
  }

  let updatedCount = 0;

  // Update CSS files (mainly for external stylesheets)
  if (updateCSS) {
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"][href]');
    cssLinks.forEach((link) => {
      const originalHref = link.getAttribute('href');
      
      // Skip Vite's CSS modules and internal assets
      if (originalHref.includes('/assets/') || originalHref.startsWith('data:')) {
        return;
      }
      
      const cleanHref = originalHref.split('?')[0];
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
 * React hook for cache busting
 * Usage: useCacheBuster({ verbose: true });
 */
export function useCacheBuster(options = {}) {
  useEffect(() => {
    bustCache(options);
  }, []);
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

export default bustCache;