# Loading Issues Troubleshooting Guide

## Common Loading Issues and Fixes

### Issue 1: App Won't Load / White Screen

**Possible Causes:**
1. Firebase not configured
2. Missing environment variables
3. JavaScript errors in console
4. Network issues

**Solutions:**

1. **Check Browser Console**
   - Open DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

2. **Verify Environment Variables**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify all required variables are set
   # Required: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.
   ```

3. **Clear Cache and Reinstall**
   ```bash
   # Clear node_modules
   rm -rf node_modules
   rm -rf .vite
   
   # Reinstall dependencies
   pnpm install
   
   # Clear browser cache
   # Chrome: Ctrl+Shift+Delete
   # Or hard refresh: Ctrl+Shift+R
   ```

4. **Check Firebase Configuration**
   - App will work without Firebase but some features disabled
   - Check console for Firebase warnings
   - Verify Firebase project is active

5. **Check Port Availability**
   ```bash
   # Check if port 5173 is in use
   netstat -ano | findstr :5173
   
   # Kill process if needed (Windows)
   taskkill /PID <PID> /F
   ```

### Issue 2: Components Not Loading

**Possible Causes:**
1. Import errors
2. Missing dependencies
3. Route configuration issues

**Solutions:**

1. **Check Import Paths**
   - Verify all imports are correct
   - Check file paths match exactly
   - Ensure exports are correct

2. **Verify Dependencies**
   ```bash
   # Check if all dependencies are installed
   pnpm list
   
   # Reinstall if needed
   pnpm install
   ```

3. **Check Route Configuration**
   - Verify routes.jsx has all routes
   - Check lazy loading is working
   - Verify route paths are correct

### Issue 3: Firebase Errors

**Solutions:**

1. **Firebase Not Configured**
   - App will still work, just without Firebase features
   - Check console for warnings
   - Firebase features gracefully degrade

2. **Firebase Connection Issues**
   - Check internet connection
   - Verify Firebase project is active
   - Check Firebase console for service status

### Issue 4: Build Errors

**Solutions:**

1. **Clear Build Cache**
   ```bash
   rm -rf dist
   rm -rf .vite
   pnpm run build
   ```

2. **Check for Type Errors**
   - Run: `pnpm run build`
   - Fix any TypeScript/ESLint errors
   - Check console output

### Issue 5: Development Server Issues

**Solutions:**

1. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   pnpm run dev
   ```

2. **Check Port**
   ```bash
   # Use different port
   pnpm run dev -- --port 5174
   ```

3. **Check Proxy Configuration**
   - Verify API_URL in .env
   - Check server is running on correct port
   - Verify proxy settings in vite.config.js

## Quick Fixes

### Quick Fix 1: Full Reset
```bash
# 1. Clear everything
rm -rf node_modules
rm -rf .vite
rm -rf dist

# 2. Reinstall
pnpm install

# 3. Start dev server
pnpm run dev
```

### Quick Fix 2: Check Environment
```bash
# Verify .env file exists and has all variables
cat .env

# Should have at least:
# VITE_FIREBASE_API_KEY
# VITE_FIREBASE_AUTH_DOMAIN
# VITE_FIREBASE_PROJECT_ID
# etc.
```

### Quick Fix 3: Browser Issues
1. **Hard Refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Cache**: DevTools > Application > Clear Storage
3. **Disable Extensions**: Try incognito mode
4. **Check Console**: Look for specific errors

## Getting Help

If issues persist:

1. **Check Browser Console**
   - Copy all error messages
   - Check Network tab for failed requests
   - Take screenshots

2. **Check Server Logs**
   - If backend is running, check server logs
   - Look for API errors
   - Check Firebase logs

3. **Verify Configuration**
   - All environment variables set
   - Firebase project active
   - API endpoints correct
   - Ports not in use

4. **Test in Different Browser**
   - Try Chrome, Firefox, Edge
   - Check if issue is browser-specific

## Common Error Messages

### "Cannot read property of undefined"
- **Fix**: Check if Firebase is initialized
- **Fix**: Verify environment variables are set

### "Failed to fetch"
- **Fix**: Check API_URL is correct
- **Fix**: Verify server is running
- **Fix**: Check CORS settings

### "Module not found"
- **Fix**: Run `pnpm install`
- **Fix**: Check import paths
- **Fix**: Verify file exists

### "Firebase not configured"
- **Fix**: This is a warning, not an error
- **Fix**: App will work without Firebase
- **Fix**: Add Firebase config to enable features

