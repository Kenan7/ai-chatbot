'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { type Dispatch, type SetStateAction } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import { BoxIcon, SparklesIcon, InvoiceIcon, GPSIcon, PaperclipIcon, ImageIcon, FileIcon, HomeIcon, LogoOpenAI, PencilEditIcon } from './icons';

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
  setInput: Dispatch<SetStateAction<string>>;
  input: string;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
  setInput,
  input,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'Eco-friendly kits ',
      label: 'under $30',
      action: 'Eco-friendly kits under $30',
      icons: [BoxIcon, HomeIcon, InvoiceIcon],
    },
    {
      title: 'Creative merch',
      label: 'for IT',
      action: 'Creative merch for IT companies',
      icons: [SparklesIcon, PencilEditIcon, ImageIcon],
    },
    {
      title: 'Items in stock',
      label: 'locally',
      action: 'What eco-friendly packaging items are in stock locally?',
      icons: [InvoiceIcon, BoxIcon, PaperclipIcon],
    },
    {
      title: 'Exclusive items',
      label: '',
      action: 'Show me exclusive items',
      icons: [LogoOpenAI, FileIcon, ImageIcon],
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            key={`suggested-action-${suggestedAction.title}-${index}`}
            className={index > 1 ? 'hidden sm:block' : 'block'}
          >
            <Button
              variant="ghost"
              onClick={async () => {
                window.history.replaceState({}, '', `/chat/${chatId}`);

                sendMessage({
                  role: 'user',
                  parts: [{ type: 'text', text: suggestedAction.action }],
                });

                // Clear the input after a suggestion is clicked
                setInput('');
              }}
              onMouseEnter={() => {
                // Only prefill when the input is empty so we don't overwrite user-typed text
                if (input.trim().length === 0) {
                  setInput(suggestedAction.action);
                }
              }}
              onMouseLeave={() => {
                // Restore only if we were the ones who prefilled
                if (input === suggestedAction.action) {
                  setInput('');
                }
              }}
              className="relative text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start hover:bg-accent/50 transition-colors"
            >
              <div className="absolute top-2 right-2 flex gap-1 opacity-60">
                {suggestedAction.icons.map((IconComponent, iconIndex) => (
                  <IconComponent key={iconIndex} size={12} />
                ))}
              </div>
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        );
      })}
    </div>
  );
}

export const SuggestedActions = PureSuggestedActions;
