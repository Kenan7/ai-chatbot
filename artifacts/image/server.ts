import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

// Mock logo data - using actual product images from public assets
const MOCK_LOGOS = [
  '/images/scarf.png',
  '/images/socks.png', 
  '/images/tote.png',
  '/images/package.png'
];

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    // Check if this is a logo/product mockup generation request
    const isLogoRequest = title.toLowerCase().includes('brand') ||
                         title.toLowerCase().includes('design') ||
                         title.toLowerCase().includes('product') ||
                         title.toLowerCase().includes('mockup')
    
    if (isLogoRequest) {
      // Return all 4 mock logos as a JSON string
      const logoData = JSON.stringify(MOCK_LOGOS);
      
      dataStream.write({
        type: 'data-imageDelta',
        data: logoData,
        transient: true,
      });

      return logoData;
    }

    // Fallback to original image generation for non-logo requests
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: title,
      n: 1,
    });

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return image.base64;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    // Check if this is a logo/product mockup generation request
    const isLogoRequest = description.toLowerCase().includes('brand') ||
                         description.toLowerCase().includes('design') ||
                         description.toLowerCase().includes('product') ||
                         description.toLowerCase().includes('mockup')
    
    if (isLogoRequest) {
      // Return all 4 mock logos as a JSON string
      const logoData = JSON.stringify(MOCK_LOGOS);
      
      dataStream.write({
        type: 'data-imageDelta',
        data: logoData,
        transient: true,
      });

      return logoData;
    }

    // Fallback to original image generation for non-logo requests
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
    });

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return image.base64;
  },
});
