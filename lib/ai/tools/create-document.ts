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
  console.log('🔍 [findUploadedImages] Starting search for uploaded images...');
  console.log('🔍 [findUploadedImages] Messages provided:', messages ? messages.length : 'none');
  
  if (!messages) {
    console.log('❌ [findUploadedImages] No messages provided, returning empty array');
    return [];
  }
  
  const imageUrls: string[] = [];
  
  // Look through all messages for file attachments
  for (const message of messages) {
    console.log('🔍 [findUploadedImages] Checking message:', {
      id: message.id,
      role: message.role,
      partsCount: message.parts?.length || 0
    });
    
    for (const part of message.parts || []) {
      console.log('🔍 [findUploadedImages] Checking part:', {
        type: part.type,
        mediaType: (part as any).mediaType,
        url: (part as any).url
      });
      
      if (part.type === 'file' && (part as any).mediaType?.startsWith('image/')) {
        console.log('✅ [findUploadedImages] Found image:', (part as any).url);
        imageUrls.push((part as any).url);
      }
    }
  }
  
  console.log('🔍 [findUploadedImages] Total images found:', imageUrls.length);
  console.log('🔍 [findUploadedImages] Image URLs:', imageUrls);
  
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
      console.log('🚀 [createDocument] Starting execution with params:', {
        title,
        kind,
        referenceImageUrl,
        useUploadedImage,
        messagesProvided: !!messages,
        messagesCount: messages?.length
      });
      
      const id = generateUUID();

      // Auto-detect uploaded images if no specific reference URL provided
      let finalReferenceImageUrl = referenceImageUrl;
      
      console.log('🔄 [createDocument] Processing reference image logic...');
      console.log('🔄 [createDocument] Initial referenceImageUrl:', referenceImageUrl);
      console.log('🔄 [createDocument] useUploadedImage:', useUploadedImage);
      
      if (!finalReferenceImageUrl && useUploadedImage !== false) {
        console.log('🔄 [createDocument] No explicit URL provided, checking for uploaded images...');
        const uploadedImages = findUploadedImages(messages);
        if (uploadedImages.length > 0) {
          // Use the most recent uploaded image
          finalReferenceImageUrl = uploadedImages[uploadedImages.length - 1];
          console.log('✅ [createDocument] Auto-detected uploaded image for reference:', finalReferenceImageUrl);
        } else {
          console.log('❌ [createDocument] No uploaded images found');
        }
      } else {
        console.log('🔄 [createDocument] Skipping auto-detection:', {
          hasExplicitUrl: !!finalReferenceImageUrl,
          useUploadedImageIsFalse: useUploadedImage === false
        });
      }
      
      console.log('🎯 [createDocument] Final referenceImageUrl:', finalReferenceImageUrl);

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

      console.log('📄 [createDocument] Looking for document handler for kind:', kind);
      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        console.log('❌ [createDocument] No document handler found for kind:', kind);
        throw new Error(`No document handler found for kind: ${kind}`);
      }
      
      console.log('✅ [createDocument] Document handler found, calling onCreateDocument...');
      console.log('📄 [createDocument] Passing to handler:', {
        id,
        title,
        hasSession: !!session,
        referenceImageUrl: finalReferenceImageUrl
      });

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
        referenceImageUrl: finalReferenceImageUrl,
      });
      
      console.log('✅ [createDocument] Document handler completed successfully');

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
