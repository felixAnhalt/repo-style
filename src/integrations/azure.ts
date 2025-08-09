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
// TODO: add bounded JSON chat completion helper.