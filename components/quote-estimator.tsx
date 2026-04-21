"use client"

import { useState, useRef, useEffect } from "react"
import { 
  Upload, Loader2, CheckCircle, ArrowRight, Trash2, 
  Phone, MapPin, FileText, Zap, AlertCircle, ImageIcon, Mail, Search, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { compressImage } from "@/lib/compress-image"
import { getAddressSuggestions, loadGooglePlacesScript } from "@/lib/address-autocomplete"

// ============================================================
// TYPES
// ============================================================
type LoadSize = "small" | "medium" | "large" | "xl"
type Confidence = "low" | "medium" | "high"

interface EstimateResult {
  success: true
  estimatedSize: LoadSize
  quoteMin: number
  quoteMax: number
  confidence: Confidence
  explanation: string
}

interface EstimateError {
  success: false
  error: string
}

interface AddressSuggestion {
  label: string
  value: string
}

type EstimateResponse = EstimateResult | EstimateError

// ============================================================
// SIZE INFO - Display labels for each load size
// ============================================================
const sizeInfo: Record<LoadSize, {
  label: string
  description: string
  color: string
}> = {
  small: {
    label: "Small Load",
    description: "Pickup truck size (1-3 cubic yards)",
    color: "bg-emerald-500",
  },
  medium: {
    label: "Medium Load",
    description: "Quarter trailer (4-8 cubic yards)",
    color: "bg-amber-500",
  },
  large: {
    label: "Large Load",
    description: "Half to 3/4 trailer (9-14 cubic yards)",
    color: "bg-orange-500",
  },
  xl: {
    label: "Extra Large Load",
    description: "Full trailer (15-20 cubic yards)",
    color: "bg-red-500",
  },
}

const confidenceLabels: Record<Confidence, { label: string; percent: number }> = {
  low: { label: "Low", percent: 60 },
  medium: { label: "Medium", percent: 80 },
  high: { label: "High", percent: 95 },
}

// ============================================================
// COMPONENT
// ============================================================
export function QuoteEstimator() {
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const addressInputRef = useRef<HTMLInputElement>(null)
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [compressionNote, setCompressionNote] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load Google Places API on mount
  useEffect(() => {
    loadGooglePlacesScript()
  }, [])

  // Handle address input with autocomplete
  const handleAddressChange = async (value: string) => {
    setAddress(value)
    
    if (value.length < 3) {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      return
    }

    try {
      const suggestions = await getAddressSuggestions(value)
      setAddressSuggestions(suggestions)
      setShowAddressSuggestions(true)
    } catch (err) {
      console.error("Error fetching address suggestions:", err)
      setAddressSuggestions([])
    }
  }

  // Select address from suggestions
  const selectAddress = (suggestion: AddressSuggestion) => {
    setAddress(suggestion.value)
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Reset state
    setError(null)
    setResult(null)
    setCompressionNote(null)
    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  // Convert file to base64 data URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!selectedFile) {
      setError("Please upload a photo of your junk")
      return
    }
    if (!fullName.trim()) {
      setError("Please enter your name")
      return
    }
    if (!address.trim()) {
      setError("Please enter your address")
      return
    }
    if (!phone.trim()) {
      setError("Please enter your phone number")
      return
    }
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Compress image if needed (target under 900KB for Vercel limits)
      let fileToUpload: File = selectedFile
      const originalSize = selectedFile.size

      if (originalSize > 900 * 1024) {
        const compressResult = await compressImage(selectedFile)
        fileToUpload = compressResult.file
        setCompressionNote(
          `Image optimized: ${formatFileSize(originalSize)} → ${formatFileSize(compressResult.compressedSize)}`
        )
      }

      // Convert to base64
      const base64Image = await fileToBase64(fileToUpload)

      // Submit to API
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Image,
          fullName: fullName.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          notes: notes.trim() || undefined,
        }),
      })

      // Parse response
      const text = await response.text()
      let data: EstimateResponse

      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Invalid response from server")
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate estimate")
      }

      setResult(data)

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setFullName("")
    setAddress("")
    setPhone("")
    setEmail("")
    setNotes("")
    setResult(null)
    setError(null)
    setCompressionNote(null)
    setShowAddressSuggestions(false)
    setAddressSuggestions([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <section id="estimate" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Instant AI Quote</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Get Your Free Quote
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Upload a photo, enter your info, and get an instant estimate from No Junk Left Behind.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Quote Request
              </CardTitle>
              <CardDescription>
                nojunkleft.com - Fast, reliable junk removal
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {/* Error display */}
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Compression note */}
              {compressionNote && (
                <div className="mb-6 p-3 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
                  {compressionNote}
                </div>
              )}

              {/* Result display */}
              {result && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6">
                  {/* Estimate summary */}
                  <div className="bg-secondary rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Estimated Load Size</div>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-4 h-4 rounded-full", sizeInfo[result.estimatedSize].color)} />
                          <span className="text-2xl font-bold">{sizeInfo[result.estimatedSize].label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {sizeInfo[result.estimatedSize].description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                        <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-xl font-bold">{confidenceLabels[result.confidence].percent}%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{result.explanation}</p>
                  </div>

                  {/* Quote range */}
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center">
                    <div className="text-sm text-muted-foreground mb-2">Your Estimated Quote</div>
                    <div className="text-4xl font-bold text-primary">
                      ${result.quoteMin} - ${result.quoteMax}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Final price confirmed on-site
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="flex-1 h-12 gap-2">
                      <a href="#schedule">
                        Schedule Pickup
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </Button>
                    <Button variant="outline" onClick={resetForm} className="h-12 gap-2">
                      <Trash2 className="h-5 w-5" />
                      Start Over
                    </Button>
                  </div>
                </div>
              )}

              {/* Form */}
              {!result && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image upload */}
                  {!previewUrl ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Photo of your junk *
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-40 flex flex-col gap-3 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-12 w-12 text-primary" />
                        <div className="text-center">
                          <div className="font-semibold">Upload Photo</div>
                          <div className="text-sm text-muted-foreground">JPG, PNG, HEIC</div>
                        </div>
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your photo
                      </label>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                        <img
                          src={previewUrl}
                          alt="Uploaded junk"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            if (previewUrl) URL.revokeObjectURL(previewUrl)
                            setPreviewUrl(null)
                            setSelectedFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Your Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="John Smith"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  {/* Address with autocomplete */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Pickup Address *
                    </label>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          ref={addressInputRef}
                          type="text"
                          placeholder="123 Main St, City, State ZIP"
                          value={address}
                          onChange={(e) => handleAddressChange(e.target.value)}
                          onFocus={() => address.length >= 3 && setShowAddressSuggestions(true)}
                          className="h-12 pl-9"
                          required
                        />
                      </div>
                      
                      {/* Address suggestions dropdown */}
                      {showAddressSuggestions && addressSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                          {addressSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => selectAddress(suggestion)}
                              className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm flex items-center gap-2 border-b border-border last:border-b-0"
                            >
                              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span>{suggestion.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12"
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Additional Notes (optional)
                    </label>
                    <Textarea
                      placeholder="Describe the items, access issues, stairs, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full h-14 text-lg gap-2"
                    disabled={isSubmitting || !selectedFile}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Get Instant Quote
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to be contacted by No Junk Left Behind about your quote.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
