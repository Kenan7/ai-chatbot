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
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
  setInput,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'I need custom packaging',
      label: 'for my product line',
      action: 'I need custom packaging for my product line',
      icons: [BoxIcon, HomeIcon, InvoiceIcon],
    },
    {
      title: 'Can you help me',
      label: 'design branded merch?',
      action: 'Can you help me design branded merchandise for my business?',
      icons: [SparklesIcon, PencilEditIcon, ImageIcon],
    },
    {
      title: 'I\'m in the food industry',
      label: 'what are my packaging options?',
      action: 'I\'m in the food industry. What kind of packaging do you offer?',
      icons: [InvoiceIcon, BoxIcon, PaperclipIcon],
    },
    {
      title: 'I already have a logo',
      label: 'can you apply it to mockups?',
      action: 'I already have a logo. Can you apply it to some packaging mockups?',
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
              }}
              onMouseEnter={() => {
                setInput(suggestedAction.action);
              }}
              onMouseLeave={() => {
                setInput('');
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
