import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream, referenceImageUrl }) => {
    // Build generation options with optional reference image
    const generationOptions: any = {
      model: myProvider.imageModel('image-model'),
      prompt: title,
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
