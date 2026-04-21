# Google Places API Setup Guide

## Current Errors You're Seeing
- `ApiNotActivatedMapError` - The Places API is not enabled in your Google Cloud project
- `RefererNotAllowedMapError` - The referrer domains are not authorized in your API key

## Step-by-Step Fix

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Create or Select Your Project
- Click "Select a Project" at the top
- Create new project called "No Junk Left Behind" or select existing

### 3. Enable Required APIs
Go to **APIs & Services → Library** and search for + enable:
- **Places API** (NOT "Places API New")
- **Maps JavaScript API**

### 4. Create/Configure Your API Key
Go to **APIs & Services → Credentials**

**If you don't have a key yet:**
1. Click **"+ Create Credentials"** → **API Key**
2. Copy the key and add to Vercel as `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

**If you already have a key:**
1. Click the key name to edit it
2. Under **Application restrictions**, select **HTTP referrers (web sites)**
3. Click **Add an HTTP referrer** and add ALL of these:
   ```
   https://nojunkleft.com/*
   https://www.nojunkleft.com/*
   https://*.vercel.app/*
   https://*.vusercontent.net/*
   http://localhost:3000/*
   ```
4. Under **API restrictions**, select **Restrict key** and add:
   - Places API
   - Maps JavaScript API

### 5. Verify in Vercel
1. Go to your Vercel project settings
2. Go to **Settings → Environment Variables**
3. Make sure `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` is set with your API key

### 6. Test
After 5-10 minutes for changes to propagate, go to `/estimate` and type in the address field.

## Troubleshooting

**Still seeing ApiNotActivatedMapError:**
- Wait 10 minutes for API activation to propagate
- Verify both "Places API" and "Maps JavaScript API" are enabled
- Check that you're using the regular "Places API", not "Places API New"

**Still seeing RefererNotAllowedMapError:**
- Verify your API key has HTTP referrer restrictions set
- Make sure you added the exact domains above (with wildcards and trailing /*)
- Check that your current domain is in the list

**No suggestions appearing:**
- The API is loaded but may be slow to respond
- Try typing a full address like "123 Main Street, San Francisco"
- Check browser console for any error messages

## Fallback Behavior
If Google Places API is unavailable, the address field still works - users can type their address manually. The form will submit successfully even without autocomplete suggestions.
