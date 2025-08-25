# Image-to-Image Generation Examples

## Overview

The enhanced `createDocument` and `updateDocument` tools now support image-to-image operations by accepting an optional `referenceImageUrl` parameter. This enables the AI to create variations, apply styles, or make modifications to existing images.

## How It Works

### 1. AI Decision Making
The AI will automatically decide when to use a reference image based on:
- User provides an image URL in their request
- User mentions wanting to modify/extend an existing image
- User references brand guidelines, logos, or existing designs
- User asks to create something "based on" or "similar to" an existing image

### 2. Tool Usage Examples

#### Creating New Images with Reference
```typescript
// The AI will call this when user says something like:
// "Create a new image based on this logo: https://example.com/logo.png, but add a donut next to it"

createDocument({
  title: "Add a donut next to the company logo",
  kind: "image",
  referenceImageUrl: "https://example.com/logo.png"
})
```

#### Updating Existing Images
```typescript
// The AI will call this when user says:
// "Update the previous image but use this brand color scheme: https://example.com/palette.png"

updateDocument({
  documentId: "existing-doc-id",
  description: "Apply the brand color scheme from the reference image",
  referenceImageUrl: "https://example.com/palette.png"
})
```

## Sample User Interactions

### Example 1: Brand Guidelines
**User**: "Here's our brand guideline image: https://brand.com/guidelines.png. Create a marketing banner following these guidelines with the text 'Summer Sale 50% Off'"

**AI Response**: The AI will call `createDocument` with:
- title: "Summer Sale 50% Off marketing banner following brand guidelines"
- kind: "image"
- referenceImageUrl: "https://brand.com/guidelines.png"

### Example 2: Logo Modification
**User**: "Take this logo https://company.com/logo.png and put a donut next to the flour bag"

**AI Response**: The AI will call `createDocument` with:
- title: "Put a donut next to the flour bag in the company logo"
- kind: "image" 
- referenceImageUrl: "https://company.com/logo.png"

### Example 3: Style Transfer
**User**: "I want to create an image of a sunset, but in the style of this artwork: https://art.com/style.jpg"

**AI Response**: The AI will call `createDocument` with:
- title: "Sunset landscape in the artistic style of the reference image"
- kind: "image"
- referenceImageUrl: "https://art.com/style.jpg"

### Example 4: Product Mockups
**User**: "Using this product photo https://shop.com/product.png, create a lifestyle image showing it being used in a modern kitchen"

**AI Response**: The AI will call `createDocument` with:
- title: "Lifestyle image showing the product being used in a modern kitchen setting"
- kind: "image"
- referenceImageUrl: "https://shop.com/product.png"

## Technical Implementation

### 1. FAL Provider Integration
The system uses FAL's image generation with `providerOptions`:

```typescript
const generationOptions = {
  model: myProvider.imageModel('image-model'),
  prompt: title,
  n: 1,
  // Only added if referenceImageUrl is provided
  providerOptions: {
    fal: {
      image_url: referenceImageUrl,
    },
  },
};
```

### 2. Backward Compatibility
- If no `referenceImageUrl` is provided, the system works exactly as before
- All existing functionality remains unchanged
- The `providerOptions` are only added when needed

### 3. Error Handling
- Invalid URLs are validated by Zod schema
- Missing reference images will be handled by the FAL provider
- Graceful fallback to text-only generation if image processing fails

## Testing the Implementation

### Test Case 1: Basic Image Generation (No Reference)
```bash
# This should work exactly as before
curl -X POST /api/chat \
  -d '{"message": "Create an image of a sunset"}'
```

### Test Case 2: Image-to-Image Generation
```bash
# This should use the reference image
curl -X POST /api/chat \
  -d '{"message": "Create an image based on https://example.com/logo.png with added text"}'
```

### Test Case 3: Image Update with Reference
```bash
# First create an image, then update it with a reference
curl -X POST /api/chat \
  -d '{"message": "Update the previous image using this style: https://example.com/style.jpg"}'
```

## Provider Support

### Currently Supported
- ✅ **FAL AI**: Full support with `image_url` in `providerOptions.fal`

### Future Support
- 🔄 **OpenAI DALL-E**: Could be extended with similar provider options
- 🔄 **Midjourney**: Could be added with appropriate provider configuration
- 🔄 **Stable Diffusion**: Could be integrated through various providers

## Benefits

1. **Enhanced User Experience**: Users can provide visual references instead of just text descriptions
2. **Brand Consistency**: Easy to maintain brand guidelines and visual consistency
3. **Creative Flexibility**: Combine existing assets with new generated content
4. **Professional Workflows**: Support for design workflows that build upon existing materials
5. **AI-Driven Decision Making**: The AI automatically determines when to use references

## Limitations

1. **Provider Dependent**: Feature availability depends on the underlying image generation provider
2. **Image URL Accessibility**: Reference images must be publicly accessible URLs
3. **Quality Dependent**: Results depend on the quality and relevance of the reference image
4. **Processing Time**: Image-to-image generation may take longer than text-to-image
