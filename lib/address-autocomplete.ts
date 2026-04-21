/**
 * Address autocomplete using Google Places API
 * Provides suggestions as user types their address
 * 
 * SETUP REQUIRED IN GOOGLE CLOUD CONSOLE:
 * 1. Enable "Places API" (not Places API New)
 * 2. Enable "Maps JavaScript API"
 * 3. Add HTTP referrers to your API key restrictions:
 *    - https://nojunkleft.com/*
 *    - https://www.nojunkleft.com/*
 *    - https://*.vercel.app/*
 *    - https://*.vusercontent.net/*
 *    - http://localhost:3000/*
 */

declare global {
  interface Window {
    google?: typeof google
    initGooglePlaces?: () => void
    googlePlacesError?: string
  }
}

export interface AddressSuggestion {
  label: string
  value: string
  placeId: string
}

let googlePlacesLoaded = false
let googlePlacesLoading = false
let googlePlacesError: string | null = null
const loadCallbacks: ((success: boolean) => void)[] = []

// Load Google Places API script with callback
export function loadGooglePlacesScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // If there was an error, don't retry
    if (googlePlacesError) {
      resolve(false)
      return
    }

    // Already loaded successfully
    if (googlePlacesLoaded && window.google?.maps?.places) {
      resolve(true)
      return
    }

    // Add to callbacks if currently loading
    if (googlePlacesLoading) {
      loadCallbacks.push(resolve)
      return
    }

    // Check if script already exists and loaded
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      googlePlacesLoaded = true
      resolve(true)
      return
    }

    // Start loading
    googlePlacesLoading = true
    loadCallbacks.push(resolve)

    // Get API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    if (!apiKey) {
      console.warn('[autocomplete] Missing NEXT_PUBLIC_GOOGLE_PLACES_API_KEY environment variable')
      googlePlacesLoading = false
      googlePlacesError = 'Missing API key'
      loadCallbacks.forEach(cb => cb(false))
      loadCallbacks.length = 0
      return
    }

    // Create success callback
    window.initGooglePlaces = () => {
      googlePlacesLoaded = true
      googlePlacesLoading = false
      googlePlacesError = null
      loadCallbacks.forEach(cb => cb(true))
      loadCallbacks.length = 0
    }

    // Create and load script
    const script = document.createElement('script')
    script.id = 'google-places-script'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`
    script.async = true
    script.defer = true
    
    script.onerror = (e) => {
      console.error('[autocomplete] Failed to load Google Places API script:', e)
      googlePlacesLoading = false
      googlePlacesError = 'Script load failed'
      loadCallbacks.forEach(cb => cb(false))
      loadCallbacks.length = 0
    }
    
    // Check if script already exists
    if (!document.getElementById('google-places-script')) {
      document.head.appendChild(script)
    }
  })
}

// Check if Google Places API has an error
export function getGooglePlacesError(): string | null {
  return googlePlacesError || window.googlePlacesError || null
}

// Get address suggestions
export async function getAddressSuggestions(input: string): Promise<AddressSuggestion[]> {
  if (!input.trim() || input.length < 3) return []

  // Wait for Google Places to load
  const loaded = await loadGooglePlacesScript()
  
  if (!loaded) {
    // Silently fail - user can still type address manually
    return []
  }

  // Check if API is available
  if (!window.google?.maps?.places) {
    return []
  }

  try {
    const service = new window.google.maps.places.AutocompleteService()
    
    const predictions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve) => {
      service.getPlacePredictions(
        {
          input,
          componentRestrictions: { country: 'us' },
          types: ['address'],
        },
        (predictions, status) => {
          if (status === window.google!.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions)
          } else {
            // Log specific error for debugging
            if (status !== window.google!.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              console.warn('[autocomplete] Places API status:', status)
            }
            resolve([])
          }
        }
      )
    })

    return predictions.slice(0, 5).map((prediction) => ({
      label: prediction.description,
      value: prediction.description,
      placeId: prediction.place_id,
    }))
  } catch (error) {
    console.error('[autocomplete] Error fetching suggestions:', error)
    return []
  }
}

// Geocode address to get lat/lng (optional for later use)
export async function geocodeAddress(placeId: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const geocoder = new window.google.maps.Geocoder()
    
    return new Promise((resolve) => {
      geocoder.geocode({ placeId }, (results) => {
        if (results?.[0]?.geometry?.location) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          })
        } else {
          resolve(null)
        }
      })
    })
  } catch (error) {
    console.error('[geocode] Error geocoding address:', error)
    return null
  }
}
