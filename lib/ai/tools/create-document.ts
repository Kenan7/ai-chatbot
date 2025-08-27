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
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a visual artifact (image, document, or visualization). You can optionally provide reference image URLs to use as a base for generation.',
    inputSchema: z.object({
      title: z.string().describe('The prompt or description for generating the content'),
      kind: z.enum(artifactKinds).describe('The type of artifact to create'),
      referenceImageUrls: z.array(z.string().url()).optional().describe('Optional array of image URLs to use as reference. Can contain one or more images that will be used as a base for generation.'),
    }),
    execute: async ({ title, kind, referenceImageUrls }) => {
      const id = generateUUID();

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
        referenceImageUrls,
      });

      dataStream.write({ type: 'data-finish', data: null, transient: true });

      return {
        id,
        title,
        kind,
        content: referenceImageUrls
          ? 'A document was created using the reference images and is now visible to the user.'
          : 'A document was created and is now visible to the user.',
      };
    },
  });
