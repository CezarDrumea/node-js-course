// Global JWT Fetch Interceptor
// This runs FIRST on every page load and persists across page navigations
(function setupGlobalJwtInterceptor() {
  const TOKEN_KEY = 'pm_jwt_token';
  const originalFetch = window.fetch;

  window.fetch = function(...args) {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[Global Interceptor] Fetch to:', args[0], 'Token:', token ? 'YES' : 'NO');
    
    if (token) {
      // Ensure options object exists
      if (!args[1]) {
        args[1] = {};
      }
      // Ensure headers exist
      if (!args[1].headers) {
        args[1].headers = {};
      }
      // Add Authorization header if not already present
      if (!args[1].headers['Authorization']) {
        args[1].headers['Authorization'] = `Bearer ${token}`;
        console.log('[Global Interceptor] Added Authorization header');
      } else {
        console.log('[Global Interceptor] Authorization header already exists');
      }
    }
    
    return originalFetch.apply(this, args);
  };
})();
