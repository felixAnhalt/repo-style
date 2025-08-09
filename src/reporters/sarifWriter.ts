import { writeFile } from 'node:fs/promises';

export async function writeSarif(sarif: object, path = 'results.sarif') {
  await writeFile(path, JSON.stringify(sarif, null, 2), 'utf8');
}
