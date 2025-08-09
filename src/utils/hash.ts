import { createHash } from 'node:crypto';
export function sha1(s: string) { return createHash('sha1').update(s).digest('hex'); }