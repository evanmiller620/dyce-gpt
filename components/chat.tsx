'use client';

import type { Attachment, Message, CreateMessage, ChatRequestOptions } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import { message, type Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';

import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';

type UseMockChatProps = {
  id: string;
  body: { id: string; selectedChatModel: string };
  initialMessages: Message[];
  generateId: () => string;
  onFinish?: (message: Message) => void;
  onError?: (error: string) => void;
  reload?: (chatRequestOptions?: ChatRequestOptions) => Promise<string | null | undefined>;
};



function useMockChat({ id, body, initialMessages, generateId, onFinish, onError }: UseMockChatProps) {
  const [messages, setMessages] = useState<Array<Message>>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const append = (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions): Promise<string | null | undefined> => {
    return new Promise((resolve) => {
      const userMessage = { id: generateId(), body, sender: 'user', content: message.content, role: 'user' as const };
      internalAppend(userMessage).then(() => {
        if (api) {
          const responseStream = fetch(api, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, messages: messages, selectedChatModel: body.selectedChatModel }),
          });

          responseStream.then(response => {
            if (!response.ok) {
              if (onError) onError('Error occurred while fetching AI response');
              setIsLoading(false);
              return;
            }

            reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiResponseContent = '';

            reader?.read().then(function processText({ done, value }) {
              if (done) {
                const extractedId = aiResponseContent.split("|MIDDLE|")[0];
                const data = aiResponseContent.split("|MIDDLE|")[1];
                const aiResponse = { id: extractedId, body, sender: 'ai', content: data, role: 'system' as const };
                internalAppend(aiResponse).then(() => {
                  setIsLoading(false);
                  if (onFinish) onFinish(aiResponse);
                });
                return;
              }

              aiResponseContent += decoder.decode(value, { stream: true });
              reader?.read().then(processText);
            });
          }).catch(err => {
            if (err.name === 'AbortError') {
              if (onError) onError('AI response stopped');
            } else {
              if (onError) onError('Network error occurred while fetching AI response');
            }
            setIsLoading(false);
          });
          resolve('Message appended successfully');
        }
      });
    });
  };

  const internalAppend = (message: Message | CreateMessage, chatRequestOptions?: ChatRequestOptions): Promise<string | null | undefined> => {
    return new Promise((resolve) => {
      const resolvedMessage: Message = {
        ...message,
        id: message.id || generateId(),
      };

      setMessages((prevMessages) => {
        const newMessages = [...prevMessages, resolvedMessage];
        return newMessages;
      });

      resolve('Message appended successfully');
    });
  };
  const api = '/api/chat';
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined = undefined;
  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = { id: generateId(), body, sender: 'user', content: input, role: 'user' as const };
    internalAppend(userMessage).then(() => {
      setInput('');
      setIsLoading(true);

      if (api) {
        const responseStream = fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, messages: [...messages, userMessage], selectedChatModel: body.selectedChatModel }),
        });

        responseStream.then(response => {
          if (!response.ok) {
            if (onError) onError('Error occurred while fetching AI response');
            setIsLoading(false);
            return;
          }

          reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let aiResponseContent = '';

          reader?.read().then(function processText({ done, value }) {
            if (done) {
              const extractedId = aiResponseContent.split("|MIDDLE|")[0];
              const data = aiResponseContent.split("|MIDDLE|")[1];
              const aiResponse = { id: extractedId, body, sender: 'ai', content: data, role: 'system' as const };
              internalAppend(aiResponse).then(() => {
                setIsLoading(false);
                if (onFinish) onFinish(aiResponse);
              });
              return;
            }

            aiResponseContent += decoder.decode(value, { stream: true });
            reader?.read().then(processText);
          });
        }).catch(err => {
          if (err.name === 'AbortError') {
            if (onError) onError('AI response stopped');
          } else {
            if (onError) onError('Network error occurred while fetching AI response');
          }
          setIsLoading(false);
        });
      }
    });
  };

  const stop = () => {
    setIsLoading(false);
    if (onError) onError('AI response stopped');
  };

  const handleReload = async (): Promise<string | null | undefined> => {
    return new Promise(async (resolve, reject) => {
      if (api) {
        const responseStream = fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id, messages: messages, selectedChatModel: body.selectedChatModel }),
        });

        responseStream.then(response => {
          if (!response.ok) {
            if (onError) onError('Error occurred while fetching AI response');
            setIsLoading(false);
            return;
          }

          reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let aiResponseContent = '';

          reader?.read().then(function processText({ done, value }) {
            if (done) {
              const extractedId = aiResponseContent.split("|MIDDLE|")[0];
              const data = aiResponseContent.split("|MIDDLE|")[1];
              const aiResponse = { id: extractedId, body, sender: 'ai', content: data, role: 'system' as const };
              internalAppend(aiResponse).then(() => {
                setIsLoading(false);
                if (onFinish) onFinish(aiResponse);
              });
              return;
            }

            aiResponseContent += decoder.decode(value, { stream: true });
            reader?.read().then(processText);
          });
        }).catch(err => {
          if (err.name === 'AbortError') {
            if (onError) onError('AI response stopped');
          } else {
            if (onError) onError('Network error occurred while fetching AI response');
          }
          setIsLoading(false);
        });
      }
    });
  };
  const error = null;

  return { messages, setMessages, handleSubmit, input, setInput, append, isLoading, stop, reload: handleReload, error };
};

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useMockChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      toast.error('An error occured, please try again!');
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
