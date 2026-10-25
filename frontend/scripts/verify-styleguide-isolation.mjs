import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import ts from 'typescript';

// Inspect runtime imports only: DTO type imports do not execute their modules.
const root = fileURLToPath(new URL('../src/', import.meta.url));
const seen = new Set();
function inspect(file) {
    if (seen.has(file)) return;
    seen.add(file);
    assert.ok(
        !relative(root, file).replaceAll('\\', '/').startsWith('services/'),
        `API service reachable from Style Guide: ${file}`
    );
    assert.ok(
        !/[/\\]AuthProvider\.tsx$/.test(file),
        `Real authentication provider reachable: ${file}`
    );
    const source = ts.createSourceFile(
        file,
        readFileSync(file, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
    );
    function walk(node) {
        if (ts.isCallExpression(node)) {
            const call = node.expression.getText(source);
            assert.ok(
                !/^(fetch|api\.(get|post|put|patch|delete|request)|axios\.(get|post|put|patch|delete|request|create))$/.test(
                    call
                ),
                `Network call reachable from Style Guide: ${file}`
            );
        }
        if (ts.isNewExpression(node))
            assert.notEqual(
                node.expression.getText(source),
                'XMLHttpRequest',
                `Network constructor: ${file}`
            );
        ts.forEachChild(node, walk);
    }
    walk(source);
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement)) continue;
        const clause = statement.importClause;
        if (clause?.isTypeOnly) continue;
        if (
            clause?.namedBindings &&
            ts.isNamedImports(clause.namedBindings) &&
            !clause.name &&
            clause.namedBindings.elements.every((e) => e.isTypeOnly)
        )
            continue;
        const specifier = statement.moduleSpecifier.text;
        if (!specifier.startsWith('.') && !specifier.startsWith('@/')) continue;
        const base = specifier.startsWith('@/')
            ? resolve(root, specifier.slice(2))
            : resolve(dirname(file), specifier);
        if (/\.(css|svg|png|jpg)$/.test(base)) continue;
        const target = [
            base,
            base + '.tsx',
            base + '.ts',
            resolve(base, 'index.tsx'),
            resolve(base, 'index.ts'),
        ].find((p) => existsSync(p) && /\.tsx?$/.test(p));
        assert.ok(target, `Unresolved local import: ${specifier} in ${file}`);
        inspect(target);
    }
}
inspect(resolve(root, 'pages/StyleGuidePage.tsx'));
console.log(
    `Style Guide isolation passed: ${seen.size} runtime source modules checked; no API services, authentication provider or direct network calls.`
);
