import { generateUUID } from '@/lib/utils';
import { tool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';
import type { ChatMessage } from '@/lib/types';

interface CreateDocumentProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
  messages?: ChatMessage[];  // Add conversation context
}

// Helper function to extract uploaded images from conversation
function findUploadedImages(messages?: ChatMessage[]): string[] {
  if (!messages) return [];
  
  const imageUrls: string[] = [];
  
  // Look through all messages for file attachments
  for (const message of messages) {
    for (const part of message.parts || []) {
      if (part.type === 'file' && part.mediaType?.startsWith('image/')) {
        imageUrls.push(part.url);
      }
    }
  }
  
  return imageUrls;
}

export const createDocument = ({ session, dataStream, messages }: CreateDocumentProps) =>
  tool({
    description:
      'Create a visual artifact (image, document, or visualization). For image generation, you can automatically detect and use any images uploaded by the user in the conversation as reference images, OR you can specify a specific reference image URL. Use this for: 1) Creating variations of uploaded images, 2) Applying uploaded brand guidelines/logos, 3) Combining uploaded images with new content, 4) Using any uploaded image as a base for modifications. If the user has uploaded images and wants to create something based on them, those images will automatically be detected and used.',
    inputSchema: z.object({
      title: z.string().describe('The prompt or description for generating the content'),
      kind: z.enum(artifactKinds).describe('The type of artifact to create'),
      referenceImageUrl: z.string().url().optional().describe('Optional URL of a specific image to use as reference. If not provided, the system will automatically use the most recent uploaded image from the conversation if available.'),
      useUploadedImage: z.boolean().optional().describe('Set to true to explicitly use the most recently uploaded image as reference. Set to false to avoid using uploaded images. If not specified, uploaded images will be used automatically when relevant.'),
    }),
    execute: async ({ title, kind, referenceImageUrl, useUploadedImage }) => {
      const id = generateUUID();

      // Auto-detect uploaded images if no specific reference URL provided
      let finalReferenceImageUrl = referenceImageUrl;
      
      if (!finalReferenceImageUrl && useUploadedImage !== false) {
        const uploadedImages = findUploadedImages(messages);
        if (uploadedImages.length > 0) {
          // Use the most recent uploaded image
          finalReferenceImageUrl = uploadedImages[uploadedImages.length - 1];
          console.log('Auto-detected uploaded image for reference:', finalReferenceImageUrl);
        }
      }

      dataStream.write({
        type: 'data-kind',
        data: kind,
        transient: true,
      });

      dataStream.write({
        type: 'data-id',
        data: id,
        transient: true,
      });

      dataStream.write({
        type: 'data-title',
        data: title,
        transient: true,
      });

      dataStream.write({
        type: 'data-clear',
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
        referenceImageUrl: finalReferenceImageUrl,
      });

      dataStream.write({ type: 'data-finish', data: null, transient: true });

      return {
        id,
        title,
        kind,
        content: finalReferenceImageUrl 
          ? 'A document was created using the reference image and is now visible to the user.'
          : 'A document was created and is now visible to the user.',
      };
    },
  });
