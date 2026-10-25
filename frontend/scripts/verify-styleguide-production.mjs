import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

// Run after `npm run build`: prevent development-only examples from shipping.
const output = new URL('../dist/', import.meta.url);
const forbidden = ['/styleguide', 'StyleGuidePage', 'LETTERBOOKS_STYLEGUIDE_DEV_ONLY', '.sg-swatches', '.styleguide', 'local-styleguide-book', 'Pessoa de demonstração'];
let assets = 0;
async function inspect(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const file = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory);
        if (entry.isDirectory()) await inspect(file);
        else {
            assert.ok(!/styleguide/i.test(entry.name), `Development-only file: ${entry.name}`);
            if (!/\.(js|css|html)$/.test(entry.name)) continue;
            assets++;
            const content = await readFile(file, 'utf8');
            for (const marker of forbidden) {
                assert.ok(!content.includes(marker), `Style Guide marker ${marker} found in ${file.pathname}`);
            }
        }
    }
}
await inspect(output);
assert.ok(assets > 0, `No build assets in ${resolve('dist')}; run npm run build first.`);
console.log(`Production isolation passed: ${assets} assets checked; no Style Guide route, code or styles.`);
