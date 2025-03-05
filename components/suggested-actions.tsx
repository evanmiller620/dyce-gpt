'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'How many',
      label: 'records can my records break?',
      action: 'How many records can my records break?',
    },
    {
      title: 'Develop a',
      label: `chatGPT clone`,
      action: `Develop a chatGPT clone`,
    },
    {
      title: 'Find',
      label: `my lost grandma`,
      action: `Find my lost grandma`,
    },
    {
      title: 'How much wood could a woodchuck',
      label: 'chuck if a wood chuck could chuck wood?',
      action: 'How much wood could a woodchuck chuck if a wood chuck could chuck wood',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
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
              
              append({
                role: 'user',
                content: suggestedAction.action,
              })
              // .then(() => {
              //   window.history.replaceState({}, '', `/chat/${chatId}`);
              // }).catch((error) => {
              //   console.error(error);
              //   window.history.replaceState({}, '', `/`);
              // });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
