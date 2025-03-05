import {
  type Message,
  // createDataStreamResponse,
  // smoothStream,
  // streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { delay } from 'framer-motion';

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();
  // console.log('session', session);
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  const excuses: string[] =  [
    "Got it, thanks!",
    "Understood! I'll get around to it.",
    "Okay, sounds good!",
    "Noted, appreciate it.",
    "Thanks for the update!",
    "Alright, I'll look into it.",
    "Sounds perfect, I'll handle it.",
    "Okay, I'll get right on it.",
    "Got your message, thanks!",
    "Thanks for the heads-up!",
    "I'll keep that in mind.",
    "Alright, I'll make sure to do that.",
    "Sure thing, I'll follow up.",
    "Thanks for the clarification.",
    "I see, I'll act accordingly.",
    "Got it, I'll update you soon.",
    "Noted, thanks for sharing.",
    "Sounds good to me.",
    "Will do, thanks for letting me know.",
    "Okay, I've got it covered."
  ];
  const dumb: string[] = [
    "Why not both?",
    "I thought that was obvious.",
    "I have no idea, maybe aliens.",
    "It's probably a glitch in the matrix.",
    "I'm not sure, but let's Google it.",
    "That's a great question, I'll ask my dog.",
    "I think it's broken, try turning it off and on.",
    "That's above my pay grade.",
    "I think it's the Wi-Fi's fault.",
    "Can I get back to you after a nap?",
    "It's definitely a pineapple situation.",
    "I was just about to ask you the same thing.",
    "I'm not sure, I just woke up.",
    "Let's just blame it on the weather.",
    "Hmm, maybe it's a quantum thing?",
    "I'm too tired to think right now.",
    "Could be a glitch in the space-time continuum.",
    "I think it's just one of those days.",
    "I'm out of ideas, let's flip a coin.",
    "Maybe it's just magic, who knows?"
  ];
  const baby: string[] = [
    "ga ga",
    "ba ba",
    "waaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "goo goo",
    "skibidi"
  ];

  const generateCustomText = (selectedChatModel: string) => {
    const message = Math.floor(Math.random() * (20));
    if (selectedChatModel === 'chat-model-excuse') {
      return excuses[message];
    } else if (selectedChatModel === 'chat-model-dumb') {
      return dumb[message];
    } else {
      const message = Math.floor(Math.random() * (5));
      return baby[message];
    }
  };

  const simDelay = async (selectedChatModel: string): Promise<void> => {
    let delayTime = 0;
    if (selectedChatModel === 'chat-model-dumb') {
      delayTime = Math.floor(Math.random() * (7000)) + 2000;
    } else {
      delayTime = 0;
    }
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, delayTime);
    });
  };
  const customText = generateCustomText(selectedChatModel);

  const messageId = generateUUID();
  const returnMessage = {
    id: messageId,
    chatId: id,
    role: "system" as const,
    content: customText,
    createdAt: new Date(),
  };
  await saveMessages({
    messages: [returnMessage],
  });
  await simDelay(selectedChatModel);
  return new Response(messageId+"|MIDDLE|"+customText, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
