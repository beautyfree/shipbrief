import type { ShipbriefConfig } from './types.js';

export function chunkText(text: string, maxLength = 3800): string[] {
  const chunks = [];
  let current = '';
  for (const block of text.split(/\n(?=## )/)) {
    const next = current ? `${current}\n${block}` : block;
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = block;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export async function sendTelegram({ text, config, env = process.env }: { text: string; config: ShipbriefConfig; env?: NodeJS.ProcessEnv }): Promise<number[]> {
  const telegram = config.telegram || {};
  const token = env[telegram.botTokenEnv || 'TELEGRAM_BOT_TOKEN'];
  const chatId = env[telegram.chatIdEnv || 'TELEGRAM_COMMIT_REPORT_CHAT_ID'];
  const threadId = env[telegram.threadIdEnv || 'TELEGRAM_COMMIT_REPORT_THREAD_ID'];
  if (!token || !chatId) throw new Error('Missing Telegram bot token or chat id env var');

  const messageIds: number[] = [];
  for (const chunk of chunkText(text)) {
    const body = new URLSearchParams({
      chat_id: chatId,
      text: chunk,
      disable_web_page_preview: 'true'
    });
    if (threadId) body.set('message_thread_id', threadId);

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      body
    });
    const data = await response.json();
    if (!data.ok) throw new Error(data.description || 'Telegram sendMessage failed');
    messageIds.push(data.result.message_id);
  }
  return messageIds;
}
