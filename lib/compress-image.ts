/**
 * Client-side image compression utility
 * Resizes and compresses images before upload to avoid 413 errors
 */

export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export interface CompressResult {
  file: File
  originalSize: number
  compressedSize: number
  wasCompressed: boolean
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.75,
  maxSizeKB: 900, // Target under 1MB to avoid Vercel payload limits
}

/**
 * Compresses an image file to reduce size for upload
 * Handles HEIC, PNG, JPEG, WebP and converts to JPEG
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const originalSize = file.size

  // If already small enough, return as-is (but still convert to JPEG for consistency)
  const shouldCompress = originalSize > opts.maxSizeKB * 1024

  return new Promise((resolve, reject) => {
    // Create blob URL for the file
    const blobUrl = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(blobUrl)
          reject(new Error('Canvas context not available'))
          return
        }

        // Draw with white background (for transparency)
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to JPEG blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(blobUrl)

            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Create new File object
            const compressedFile = new File(
              [blob],
              'compressed-upload.jpg',
              { type: 'image/jpeg' }
            )

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
              wasCompressed: shouldCompress || file.type !== 'image/jpeg',
            })
          },
          'image/jpeg',
          opts.quality
        )
      } catch (err) {
        URL.revokeObjectURL(blobUrl)
        reject(err)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = blobUrl
  })
}

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
