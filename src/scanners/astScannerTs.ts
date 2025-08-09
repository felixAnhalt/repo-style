import ts from 'typescript';
import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import type { Signal } from '../core/signals.js';

export async function scanASTTs(root: string, max?: number): Promise<Signal[]> {
  const files = (await fg(['**/*.{ts,tsx}', '!**/node_modules/**'], { cwd: root, dot: false }))
    .slice(0, max ?? 200);
  const signals: Signal[] = [];

  for (const file of files) {
    const abs = `${root}/${file}`.replaceAll('//', '/');
    const code = await readFile(abs, 'utf8').catch(() => '');
    if (!code) continue;

    const sf = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.ES2022,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    let exportedAny = 0;
    const visit = (node: ts.Node) => {
      const isExportNode =
        ts.isFunctionDeclaration(node) ||
        ts.isVariableStatement(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isClassDeclaration(node);

      if (isExportNode) {
        const flags = ts.getCombinedModifierFlags(node as any);
        const isExported = (flags & ts.ModifierFlags.Export) !== 0;
        if (isExported) {
          const text = node.getText(sf);
          if (/:\s*any\b/.test(text)) exportedAny++;
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sf);
    if (exportedAny > 0) {
      signals.push({
        kind: 'ts.export.any.count',
        value: exportedAny,
        source: { path: file, lines: [1, 200] },
        weight: 1
      });
    }
  }

  return signals;
}
