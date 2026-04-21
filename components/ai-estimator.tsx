"use client"

import { useState, useRef } from "react"
import { Upload, Loader2, CheckCircle, ArrowRight, Trash2, RotateCcw, Zap, AlertCircle, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type LoadSize = "quarter" | "half" | "three_quarter" | "full"
type Confidence = "low" | "medium" | "high"

interface EstimateResult {
  success: true
  loadSize: LoadSize
  items: string[]
  priceMin: number
  priceMax: number
  confidence: Confidence
  summary: string
}

interface EstimateError {
  success: false
  error: string
}

type EstimateResponse = EstimateResult | EstimateError

const sizeInfo: Record<LoadSize, {
  label: string
  description: string
  cubicYards: string
  color: string
  examples: string[]
}> = {
  quarter: {
    label: "Quarter Load",
    description: "Fits in a pickup truck bed",
    cubicYards: "1-4",
    color: "bg-chart-4",
    examples: ["Few bags of trash", "Small furniture items", "Minor cleanout"],
  },
  half: {
    label: "Half Load",
    description: "Half trailer load",
    cubicYards: "5-8",
    color: "bg-chart-2",
    examples: ["Room cleanout", "Appliances", "Mattresses & furniture"],
  },
  three_quarter: {
    label: "3/4 Load",
    description: "Three-quarter trailer load",
    cubicYards: "9-12",
    color: "bg-primary",
    examples: ["Garage cleanout", "Estate items", "Multiple rooms"],
  },
  full: {
    label: "Full Load",
    description: "Full trailer load",
    cubicYards: "13-20",
    color: "bg-destructive",
    examples: ["Full house cleanout", "Construction debris", "Major renovation"],
  },
}

const confidenceLabels: Record<Confidence, { label: string; percent: number }> = {
  low: { label: "Low", percent: 60 },
  medium: { label: "Medium", percent: 80 },
  high: { label: "High", percent: 95 },
}

export function AIEstimator() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log("[v0] File selected:", file.name, file.size, file.type)
    
    // Reset previous state
    setError(null)
    setResult(null)
    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError("Please select an image first.")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    console.log("[v0] Starting analysis for:", selectedFile.name)

    try {
      // Create FormData and append file
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Send request - DO NOT set Content-Type header for FormData
      const response = await fetch("/api/analyze-junk", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)

      // Read raw text first for safe parsing
      const rawText = await response.text()
      console.log("[v0] Raw response:", rawText.substring(0, 200))

      // Parse JSON safely
      let data: EstimateResponse
      try {
        data = JSON.parse(rawText)
      } catch {
        console.error("[v0] Failed to parse JSON:", rawText)
        throw new Error("Invalid response from server")
      }

      // Check for error response
      if (!data.success) {
        throw new Error(data.error || "Analysis failed")
      }

      console.log("[v0] Analysis result:", data)
      setResult(data)

    } catch (err) {
      console.error("[v0] Analysis error:", err)
      const message = err instanceof Error ? err.message : "Failed to analyze image"
      setError(message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetEstimator = () => {
    // Revoke previous preview URL to free memory
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setIsAnalyzing(false)
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <section id="estimate" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI Technology</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Instant AI Load Estimation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Upload a photo of your junk, and our AI will analyze the size, 
            identify items, and provide an accurate price estimate in seconds.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="bg-secondary/50">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Photo Estimator
              </CardTitle>
              <CardDescription>
                Upload an image of items you need removed
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {!previewUrl && (
                <div className="flex flex-col items-center">
                  <Button
                    variant="outline"
                    className="w-full max-w-md h-48 flex flex-col gap-4 border-dashed border-2 hover:border-primary hover:bg-primary/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-16 w-16 text-primary" />
                    <div className="text-center">
                      <div className="text-lg font-semibold">Upload Image</div>
                      <div className="text-sm text-muted-foreground">Select a photo from your device</div>
                    </div>
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Tap to select a photo from your gallery
                  </p>
                </div>
              )}

              {previewUrl && (
                <div className="space-y-6">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Uploaded junk"
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium">Analyzing your load...</p>
                        <p className="text-sm text-muted-foreground">AI is identifying items and estimating size</p>
                      </div>
                    )}
                  </div>

                  {result && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Size Result */}
                      <div className="bg-secondary rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Estimated Load Size</div>
                            <div className="flex items-center gap-3">
                              <div className={cn("w-4 h-4 rounded-full", sizeInfo[result.loadSize].color)} />
                              <span className="text-2xl font-bold">{sizeInfo[result.loadSize].label}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                            <div className="flex items-center gap-2 text-chart-4">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-xl font-bold">{confidenceLabels[result.confidence].percent}%</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{result.summary}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-secondary rounded-xl p-5">
                          <div className="text-sm text-muted-foreground mb-2">Estimated Volume</div>
                          <div className="text-3xl font-bold text-primary">
                            {sizeInfo[result.loadSize].cubicYards} <span className="text-lg text-muted-foreground">cubic yards</span>
                          </div>
                        </div>
                        <div className="bg-secondary rounded-xl p-5">
                          <div className="text-sm text-muted-foreground mb-2">Price Estimate</div>
                          <div className="text-3xl font-bold text-primary">
                            ${result.priceMin} - ${result.priceMax}
                          </div>
                        </div>
                      </div>

                      {/* Detected Items */}
                      <div className="bg-secondary rounded-xl p-5">
                        <div className="text-sm text-muted-foreground mb-3">Detected Items</div>
                        <div className="flex flex-wrap gap-2">
                          {result.items.map((item, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 bg-background rounded-full text-sm font-medium"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button asChild className="flex-1 h-12 gap-2">
                          <a href="#schedule">
                            Schedule Pickup
                            <ArrowRight className="h-5 w-5" />
                          </a>
                        </Button>
                        <Button variant="outline" onClick={resetEstimator} className="h-12 gap-2">
                          <RotateCcw className="h-5 w-5" />
                          Try Another Photo
                        </Button>
                      </div>
                    </div>
                  )}

                  {!result && !isAnalyzing && (
                    <div className="flex gap-3">
                      <Button onClick={analyzeImage} className="flex-1 h-12 gap-2">
                        <Zap className="h-5 w-5" />
                        Analyze with AI
                      </Button>
                      <Button variant="outline" onClick={resetEstimator} className="h-12">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Size Guide */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-center mb-6">Load Size Guide</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.entries(sizeInfo) as [LoadSize, typeof sizeInfo.quarter][]).map(([key, info]) => (
                <Card key={key} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className={cn("w-full h-2 rounded-full mb-3", info.color)} />
                    <h4 className="font-semibold mb-1">{info.label}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{info.cubicYards} cubic yards</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {info.examples.map((ex, i) => (
                        <li key={i}>• {ex}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
