import crypto from 'node:crypto';

export type AzureEnv = {
  endpoint?: string; apiKey?: string; deployment?: string; apiVersion?: string;
};
export function getAzureEnv(): AzureEnv {
  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION
  };
}

export type ChatMessage = { role: 'system'|'user'|'assistant'; content: string };

/**
 * Calls Azure OpenAI Chat Completions with strict JSON output expectations.
 * - temperature low, no tools, single choice
 * - throws if response isn't valid JSON or missing
 */
export async function chatJson<T>(messages: ChatMessage[]): Promise<T> {
  const env = getAzureEnv();
  if (!env.endpoint || !env.apiKey || !env.deployment || !env.apiVersion)
    throw new Error('Azure OpenAI env not fully configured');

  const url = `${env.endpoint}/openai/deployments/${env.deployment}/chat/completions?api-version=${env.apiVersion}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.apiKey
    },
    body: JSON.stringify({
      messages,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      n: 1
    })
  });
  if (!resp.ok) throw new Error(`Azure OpenAI error: ${resp.status} ${resp.statusText}`);
  const data = (await resp.json()) as any;
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('Azure response missing content');
  try {
    return JSON.parse(content) as T;
  } catch (e) {
    throw new Error('Azure response was not valid JSON: ' + (e as Error).message);
  }
}

export function sha256(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
