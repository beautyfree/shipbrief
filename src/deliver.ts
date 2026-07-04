import fs from 'node:fs';
import type { DeliveryProvider, ShipbriefConfig } from './types.js';
import { sendTelegramHtml } from './telegram.js';

export interface DeliveryResult {
  provider: DeliveryProvider;
  chunks: number;
  ids: number[];
}

export async function deliverHtml({
  provider,
  html,
  config,
  env
}: {
  provider: DeliveryProvider;
  html: string;
  config: ShipbriefConfig;
  env: NodeJS.ProcessEnv;
}): Promise<DeliveryResult> {
  if (provider === 'telegram') {
    const ids = await sendTelegramHtml({ html, config, env });
    return { provider, chunks: ids.length, ids };
  }
  throw new Error(`unsupported delivery provider: ${provider}`);
}

export function readHtmlFile(file: string): string {
  return fs.readFileSync(file, 'utf8');
}
