import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('image-model'),
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
    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('image-model'),
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
