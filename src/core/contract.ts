import { readFile, writeFile } from 'node:fs/promises';
import { Contract, Rule } from './types.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export async function writeContract(repo: Contract['repo'], rules: Rule[]): Promise<Contract> {
  const contract: Contract = {
    schemaVersion: '1.0',
    repo,
    generatedAt: new Date().toISOString(),
    rules
  };
  await validateContract(contract);
  await writeFile('repostyle.contract.yaml', yaml(contract), 'utf8');
  return contract;
}

export async function loadContract(): Promise<Contract> {
  const raw = await readFile('repostyle.contract.yaml', 'utf8');
  const doc = parseYaml(raw) as Contract; // basic parse, validated below
  await validateContract(doc);
  return doc;
}

function yaml(obj: unknown): string {
  const { dump } = await import('js-yaml');
  // @ts-expect-error dynamic import typing
  return dump(obj, { lineWidth: 100 });
}
function parseYaml(s: string): unknown {
  const { load } = require('js-yaml');
  return load(s);
}

async function validateContract(c: Contract) {
  const schema = JSON.parse(await (await import('node:fs/promises')).readFile('schema/contract.schema.json', 'utf8'));
  const ajv = new Ajv({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(c)) {
    throw new Error('Contract invalid: ' + JSON.stringify(validate.errors, null, 2));
  }
}