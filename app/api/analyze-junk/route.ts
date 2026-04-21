import { generateText } from 'ai'

const sizeToPrice: Record<string, { min: number; max: number }> = {
  small: { min: 99, max: 199 },
  medium: { min: 199, max: 399 },
  large: { min: 399, max: 599 },
  xl: { min: 599, max: 899 },
}

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return Response.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    // Validate image data
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      return Response.json(
        { error: 'Invalid image format. Please upload a valid image.' },
        { status: 400 }
      )
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const mediaType = image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg'
    
    console.log('[v0] Processing image, size:', Math.round(base64Data.length / 1024), 'KB, type:', mediaType)

    const { text } = await generateText({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert junk removal estimator. Analyze images and respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{"size":"small|medium|large|xl","items":["item1","item2"],"cubicYards":5,"confidence":85,"description":"Brief description"}

Size guidelines:
- small: 1-3 cubic yards (pickup truck)
- medium: 4-8 cubic yards (quarter trailer)
- large: 9-14 cubic yards (half trailer)  
- xl: 15-20 cubic yards (full trailer)`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image for junk removal. Return ONLY the JSON object.',
            },
            {
              type: 'image',
              image: base64Data,
              mimeType: mediaType,
            },
          ],
        },
      ],
    })

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Failed to parse AI response:', text)
      return Response.json(
        { error: 'Failed to analyze image' },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    // Normalize and validate
    const validSizes = ['small', 'medium', 'large', 'xl']
    const size = validSizes.includes(parsed.size?.toLowerCase()) 
      ? parsed.size.toLowerCase() 
      : 'medium'

    const result = {
      size,
      items: Array.isArray(parsed.items) ? parsed.items : ['Various items'],
      cubicYards: typeof parsed.cubicYards === 'number' ? parsed.cubicYards : 5,
      confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 75,
      description: parsed.description || 'Items identified for removal',
      priceRange: sizeToPrice[size],
    }

    return Response.json({ result })
  } catch (error) {
    console.error('Error analyzing junk image:', error)
    return Response.json(
      { error: 'Failed to analyze image. Please try again.' },
      { status: 500 }
    )
  }
}
