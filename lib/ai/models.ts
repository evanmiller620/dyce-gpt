import { openai } from '@ai-sdk/openai';
import {
  customProvider,
} from 'ai';

export const DEFAULT_CHAT_MODEL: string = 'chat-model-baby';

export const myProvider = customProvider({
  languageModels: {
    'chat-model-small': openai('gpt-4o-mini'),
    'chat-model-large': openai('gpt-4o'),
    'title-model': openai('gpt-4-turbo'),
    'artifact-model': openai('gpt-4o-mini'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-excuse',
    name: 'Excuse model',
    description: 'Always seems to be too busy',
  },
  {
    id: 'chat-model-dumb',
    name: 'Dumb model',
    description: 'Is a little slow but tries its best',
  },
  {
    id: 'chat-model-baby',
    name: 'Baby model',
    description: 'Goo goo ga ga',
  },
];
