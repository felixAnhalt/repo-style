import { readFile as rf } from 'node:fs/promises';
export async function readFile(path: string): Promise<string> { return rf(path, 'utf8'); }