import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream, referenceImageUrl }) => {
    console.log('🎨 [imageDocumentHandler] Starting image generation...');
    console.log('🎨 [imageDocumentHandler] Received params:', {
      title,
      referenceImageUrl,
      hasDataStream: !!dataStream
    });
    
    // Build generation options with optional reference image
    const generationOptions: any = {
      model: myProvider.imageModel('image-model'),
      prompt: title,
      n: 1,
    };
    
    console.log('🔧 [imageDocumentHandler] Base generation options:', generationOptions);

    // Add providerOptions with reference image if provided
    if (referenceImageUrl) {
      console.log('✅ [imageDocumentHandler] Adding reference image to providerOptions');
      generationOptions.providerOptions = {
        fal: {
          image_url: referenceImageUrl,
        },
      };
      console.log('🔧 [imageDocumentHandler] Updated generation options with providerOptions:', 
        JSON.stringify(generationOptions, null, 2)
      );
    } else {
      console.log('❌ [imageDocumentHandler] No referenceImageUrl provided, using text-only generation');
    }
    
    console.log('🚀 [imageDocumentHandler] Calling experimental_generateImage...');
    try {
      const { image } = await experimental_generateImage(generationOptions);
      console.log('✅ [imageDocumentHandler] Image generation successful, image size:', image.base64?.length || 'unknown');

      dataStream.write({
        type: 'data-imageDelta',
        data: image.base64,
        transient: true,
      });
      
      console.log('✅ [imageDocumentHandler] Image data written to stream');
      return image.base64;
    } catch (error) {
      console.error('❌ [imageDocumentHandler] Image generation failed:', error);
      throw error;
    }
  },
  onUpdateDocument: async ({ description, dataStream, referenceImageUrl }) => {
    // Build generation options with optional reference image
    const generationOptions: any = {
      model: myProvider.imageModel('image-model'),
      prompt: description,
      n: 1,
    };

    // Add providerOptions with reference image if provided
    if (referenceImageUrl) {
      generationOptions.providerOptions = {
        fal: {
          image_url: referenceImageUrl,
        },
      };
    }

    const { image } = await experimental_generateImage(generationOptions);

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return image.base64;
  },
});
