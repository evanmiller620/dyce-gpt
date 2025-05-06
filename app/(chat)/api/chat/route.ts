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
import Dyce from 'dyce';

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
  const apiKey = '531195068840511842be81710acc031cbcdc27cc961fa0614f233ba334ead097';
  const userId = "apple";
  const amount = 1;
  const dyce = new Dyce(apiKey);
  try {
    const ret = await dyce.requestPayment(userId, amount);
    if (!ret) {
      return new Response('Payment returned failure', { status: 400 });
    }
    console.log(ret);
  } catch (error) {
    console.error(error);
    return new Response('Payment threw error', { status: 400 });
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
    "I would answer but I'm too busy thinking about cryptocurrency.",
  ];
  const dumb: string[] = [
    "I hate crypto :(",
    ];
  const baby: string[] = [
    "That is very correct. Each message will charge you one USDC token on the ethereum network."
  ];

  const generateCustomText = (selectedChatModel: string) => {
    const message = Math.floor(Math.random() * (20));
    if (selectedChatModel === 'chat-model-excuse') {
      return excuses[message];
    } else if (selectedChatModel === 'chat-model-dumb') {
      return dumb[message];
    } else {
      const message = Math.floor(Math.random() * (5));
      return baby[0];
    }
  };

  const simDelay = async (selectedChatModel: string): Promise<void> => {
    let delayTime = 0;
    if (selectedChatModel === 'chat-model-dumb') {
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
  // await simDelay(selectedChatModel);

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
