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



  const generateCustomText = (selectedChatModel: string) => {
    // You can customize this function to return different text based on the model type
    if (selectedChatModel === 'chat-model-excuse') {
      return "This is a custom response based on the excyse model.";
    } else if (selectedChatModel === 'chat-model-dumb') {
      return "What the sigma (dumb?";
    } else {
      return "Ga ga ga(baby)";
    }
  };

  // 
  console.log("Selected chat model:", selectedChatModel);
  console.log("User message:", userMessage.content);
  const customText = generateCustomText(selectedChatModel);
  const messageId = generateUUID();
  const returnMessage = {
    id: messageId,
    chatId: id,
    role: "system" as const,
    content: customText, // Save the custom text
    createdAt: new Date(),
  };
  await saveMessages({
    messages: [returnMessage],
  });
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
