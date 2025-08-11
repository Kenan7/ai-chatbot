# AI Chatbot Image Generation System Guide

## Overview

Your AI chatbot uses a sophisticated image generation system that can create various types of visual content. Here's a complete breakdown of how it works and where you can customize it.

## System Architecture

### 1. **Image Generation Flow**

```
User Request → AI Model → createDocument/updateDocument Tool → Image Server → FAL AI API → Generated Image
```

### 2. **Key Files & Their Purpose**

#### **`artifacts/image/server.ts`** - Core Image Generation Logic
This is the **MAIN FILE** where image generation happens:

- **Image Model**: Uses `fal-ai/flux/schnell` model via FAL AI
- **Prompt Enhancement**: Now includes smart prompt enhancement based on request type
- **Mock Logo System**: Has commented code for serving pre-made product mockups
- **Two Functions**:
  - `onCreateDocument`: Handles new image creation
  - `onUpdateDocument`: Handles image updates/modifications

#### **`artifacts/image/client.tsx`** - Frontend Image Display
- Handles how images are displayed to the user
- Provides copy-to-clipboard functionality
- Manages version history (undo/redo)

#### **`components/image-editor.tsx`** - Image Viewer Component
- Displays generated images
- Handles both single images and multi-product mockups
- Shows loading states during generation

#### **`lib/ai/prompts.ts`** - AI Instructions
- Contains system prompts that tell the AI when to create images
- **Key Section**: `artifactsPrompt` tells AI to use image artifacts for:
  - Logos, branding designs
  - Product mockups
  - Packaging examples
  - Merchandise designs

## How to Customize Image Generation

### 1. **Enhance Image Prompts** (Already Added!)

I've added a smart prompt enhancement system in `artifacts/image/server.ts`:

```typescript
const enhanceImagePrompt = (originalPrompt: string): string => {
  const prompt = originalPrompt.toLowerCase();
  
  // Brand/Logo/Product specific enhancements
  if (prompt.includes('brand') || prompt.includes('logo') || prompt.includes('product')) {
    return `Professional product photography style: ${originalPrompt}. High quality, clean background, professional lighting, commercial photography aesthetic, detailed and crisp.`;
  }
  
  // Package/Gift specific enhancements
  if (prompt.includes('package') || prompt.includes('gift') || prompt.includes('box')) {
    return `Professional product packaging design: ${originalPrompt}. Modern, elegant design, premium materials, clean aesthetic, photorealistic rendering.`;
  }
  
  // Cultural/Holiday themes (like Nowruz)
  if (prompt.includes('nowruz') || prompt.includes('persian') || prompt.includes('cultural')) {
    return `Cultural design with authentic elements: ${originalPrompt}. Incorporate traditional patterns, cultural symbols, appropriate color palettes, respectful cultural representation.`;
  }
  
  // General enhancement for better quality
  return `${originalPrompt}. High quality, detailed, professional photography style, good lighting, crisp and clear.`;
};
```

### 2. **Add More Prompt Categories**

You can extend the `enhanceImagePrompt` function with more specific enhancements:

```typescript
// Corporate/Business themes
if (prompt.includes('corporate') || prompt.includes('business') || prompt.includes('professional')) {
  return `Corporate professional style: ${originalPrompt}. Clean, modern, business-appropriate, sophisticated design.`;
}

// Event-specific themes
if (prompt.includes('conference') || prompt.includes('meeting') || prompt.includes('event')) {
  return `Event marketing style: ${originalPrompt}. Engaging, professional, suitable for corporate events.`;
}
```

### 3. **Change Image Generation Model**

In `artifacts/image/server.ts`, you can switch to different models:

```typescript
// Current model
model: fal.imageModel('fal-ai/flux/schnell')

// Other options you could try:
model: fal.imageModel('fal-ai/flux/pro')           // Higher quality, slower
model: fal.imageModel('fal-ai/stable-diffusion')  // Different style
```

### 4. **Add Image Generation Parameters**

You can enhance the generation with more parameters:

```typescript
const { image } = await experimental_generateImage({
  model: fal.imageModel('fal-ai/flux/schnell'),
  prompt: enhancedPrompt,
  n: 1,
  // Add these for more control:
  aspectRatio: '16:9',      // Control image dimensions
  guidance: 7.5,            // How closely to follow prompt
  steps: 20,                // Generation quality vs speed
});
```

### 5. **Enable Mock Product System**

Uncomment the logo handling code in `artifacts/image/server.ts` to show pre-made product mockups:

```typescript
// Uncomment these sections to enable mock products
const isLogoRequest = title.toLowerCase().includes('brand') ||
                     title.toLowerCase().includes('design') ||
                     title.toLowerCase().includes('product') ||
                     title.toLowerCase().includes('mockup')

if (isLogoRequest) {
  const logoData = JSON.stringify(MOCK_LOGOS);
  // ... rest of the code
}
```

### 6. **Customize AI Instructions**

In `lib/ai/prompts.ts`, modify `artifactsPrompt` to change when the AI creates images:

```typescript
export const artifactsPrompt = `
Artifacts is a special user interface mode that helps users with image generation tasks. 

When asked to create logos, branding designs, product mockups, packaging examples, or merchandise designs, use the image artifact type.

// Add more triggers:
When users request visualization of concepts, mood boards, design inspiration, or visual mockups, create image artifacts.

For logo, branding, product mockup, packaging, or merchandise design requests (use kind: 'image')
`;
```

## Common Use Cases & Prompt Patterns

### **Brand/Logo Design**
- User: "Create a logo for our tech company"
- Enhanced: "Professional product photography style: Create a logo for our tech company. High quality, clean background, professional lighting, commercial photography aesthetic, detailed and crisp."

### **Cultural/Holiday Themes** 
- User: "Design Nowruz gift packaging"
- Enhanced: "Cultural design with authentic elements: Design Nowruz gift packaging. Incorporate traditional patterns, cultural symbols, appropriate color palettes, respectful cultural representation."

### **Product Mockups**
- User: "Show our brand on a tote bag"
- Enhanced: "Professional product photography style: Show our brand on a tote bag. High quality, clean background, professional lighting, commercial photography aesthetic, detailed and crisp."

## Testing Your Changes

1. **Start the development server**: `npm run dev`
2. **Test with prompts like**:
   - "Create a Nowruz-themed bottle design"
   - "Design a corporate gift package"
   - "Show me product mockups for our brand"
3. **Check the console** for any errors during image generation
4. **Monitor the FAL AI usage** as each generation uses API credits

## Advanced Customization Ideas

### **Multi-Image Generation**
Modify the generation to create multiple variations:

```typescript
const { images } = await experimental_generateImage({
  model: fal.imageModel('fal-ai/flux/schnell'),
  prompt: enhancedPrompt,
  n: 4, // Generate 4 variations
});
```

### **Conditional Generation Logic**
Add sophisticated logic for different request types:

```typescript
const generateImageBasedOnType = async (prompt: string) => {
  if (prompt.includes('comparison')) {
    // Generate side-by-side comparison
  } else if (prompt.includes('series')) {
    // Generate a series of related images
  }
  // ... more conditional logic
};
```

### **Integration with External APIs**
Add company logo fetching, brand color extraction, etc.

This system gives you complete control over how images are generated, what enhancements are applied, and how they're presented to users. The prompt enhancement system I added will immediately improve the quality and relevance of generated images for your branding and merchandising use cases!
