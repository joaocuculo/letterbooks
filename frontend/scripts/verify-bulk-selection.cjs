// Optional browser verification. Uses an externally available Playwright installation;
// it never calls the real API and does not require application dependencies to change.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const base = process.env.BULK_UI_URL || 'http://127.0.0.1:5175';
const output =
    process.env.BULK_UI_OUTPUT ||
    path.resolve(__dirname, '../../backend/target/bulk-ui');
(async () => {
    await fs.mkdir(output, { recursive: true });
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
            : {}),
    });
    let page;
    try {
        const context = await browser.newContext({
            viewport: { width: 1280, height: 900 },
        });
        let authenticated = true,
            failSummary = false,
            failWrite = false,
            unknownWrite = false,
            writeDelay = 0,
            writeCount = 0,
            libraryDelay = 0;
        const requests = [],
            runtimeErrors = [];
        let phase = 'bootstrap';
        await context.exposeBinding('reportBulkError', (_source, message) => {
            runtimeErrors.push(`${message} [${phase}]`);
            console.error(`BROWSER ERROR [${phase}]: ${message}`);
        });
        const covers = (
            await fs.readdir(path.resolve(__dirname, '../public/images/books'))
        )
            .filter((f) => f.endsWith('.jpg'))
            .slice(0, 12);
        const records = Array.from({ length: 48 }, (_, i) => ({
            id: i + 1,
            status: ['WANT_TO_READ', 'READING', 'COMPLETED', 'ABANDONED'][
                i % 4
            ],
            isFavorite: i % 2 === 0,
            currentPage: null,
            book: {
                id: i + 1,
                googleBooksId: 'g' + (i + 1),
                title: 'Livro ' + (i + 1),
                thumbnailUrl: '/images/books/' + covers[i % covers.length],
            },
        }));
        let shelves = Array.from({ length: 42 }, (_, i) => ({
            id: i + 1,
            name: 'Estante ' + (i + 1),
            description: 'Coleção de teste',
            booksCount: 0,
            isPublicShelf: false,
            previewBooks: [],
        }));
        const memberships = new Map(shelves.map((s) => [s.id, new Set()]));
        memberships.get(1).add('g1');
        memberships.get(2).add('g1');
        memberships.get(2).add('g2');
        const paginated = (items, n) => ({
            content: items.slice(n * 20, (n + 1) * 20),
            page: {
                number: n,
                size: 20,
                totalElements: items.length,
                totalPages: Math.ceil(items.length / 20),
            },
        });
        const explore = (items) =>
            items.map((record) => ({
                id: record.book.googleBooksId,
                title: record.book.title,
                thumbnailUrl: record.book.thumbnailUrl,
                authors: ['Autora de teste'],
                publisher: 'Editora',
                publishedDate: '2024',
                isFavorite: record.isFavorite,
                userBookId: record.id,
                averageRating: null,
            }));
        await context.addInitScript(() => {
            if (!['http:', 'https:'].includes(location.protocol)) return;
            window.addEventListener('error', (event) => {
                if (event.message) window.reportBulkError(event.message);
            });
            if (localStorage.getItem('bulk-visitor') !== 'true')
                localStorage.setItem(
                    'letterbooks.token',
                    'x.' + btoa(JSON.stringify({ exp: 4102444800 })) + '.x'
                );
        });
        await context.route('**/*', async (route) => {
            const request = route.request();
            if (!['fetch', 'xhr'].includes(request.resourceType()))
                return route.continue();
            const u = new URL(request.url()),
                p = u.pathname,
                m = request.method();
            let result,
                status = 200;
            requests.push({
                p,
                m,
                params: Object.fromEntries(u.searchParams),
                body: m === 'POST' ? request.postDataJSON() : null,
            });
            if (p.endsWith('/users/me'))
                result = {
                    id: 1,
                    name: 'Leitora',
                    email: 'leitor@example.test',
                    role: 'USER',
                    status: 'ACTIVE',
                };
            else if (p.endsWith('/user-books/me')) {
                if (libraryDelay)
                    await new Promise((r) => setTimeout(r, libraryDelay));
                result = paginated(
                    records.filter(
                        (b) =>
                            (!u.searchParams.get('status') ||
                                b.status === u.searchParams.get('status')) &&
                            (u.searchParams.get('favorite') !== 'true' ||
                                b.isFavorite)
                    ),
                    Number(u.searchParams.get('page')) || 0
                );
            } else if (p.endsWith('/bookshelves/books/membership-summary')) {
                if (failSummary)
                    return route.fulfill({
                        status: 500,
                        json: { message: 'Falha nas contagens' },
                    });
                const body = request.postDataJSON();
                result = {
                    booksCount: body.googleBooksIds.length,
                    shelves: body.bookshelfIds.map((id) => ({
                        bookshelfId: id,
                        existingCount: body.googleBooksIds.filter((g) =>
                            memberships.get(id)?.has(g)
                        ).length,
                    })),
                };
            } else if (p.endsWith('/bookshelves/books/batch')) {
                writeCount++;
                if (writeDelay)
                    await new Promise((r) => setTimeout(r, writeDelay));
                if (failWrite)
                    return route.fulfill({
                        status: 502,
                        json: {
                            message: 'Não foi possível preparar os livros.',
                        },
                    });
                const body = request.postDataJSON();
                const results = [];
                for (const id of body.bookshelfIds) {
                    const existing = body.googleBooksIds.filter((g) =>
                        memberships.get(id).has(g)
                    ).length;
                    body.googleBooksIds.forEach((g) =>
                        memberships.get(id).add(g)
                    );
                    results.push({
                        bookshelfId: id,
                        addedCount: body.googleBooksIds.length - existing,
                        alreadyPresentCount: existing,
                    });
                }
                if (unknownWrite) return route.abort('failed');
                result = {
                    booksCount: body.googleBooksIds.length,
                    shelves: results,
                };
            } else if (/\/bookshelves\/user\/\d+$/.test(p))
                result = paginated(
                    shelves,
                    Number(u.searchParams.get('page')) || 0
                );
            else if (/\/bookshelves\/\d+\/summary$/.test(p)) {
                const s = shelves.find(
                    (s) => s.id === Number(p.split('/').at(-2))
                );
                result = { ...s, booksCount: 12 };
            } else if (/\/bookshelves\/\d+\/books$/.test(p))
                result = paginated(
                    records.slice(0, 12).map((record) => ({
                        book: record.book,
                        userBook: record,
                    })),
                    Number(u.searchParams.get('page')) || 0
                );
            else if (m === 'POST' && p.endsWith('/bookshelves')) {
                result = {
                    id: Math.max(...shelves.map((s) => s.id)) + 1,
                    ...request.postDataJSON(),
                    booksCount: 0,
                    previewBooks: [],
                };
                shelves.unshift(result);
                memberships.set(result.id, new Set());
            } else if (p.endsWith('/books/discover'))
                result = {
                    sections: [
                        {
                            key: 'first',
                            title: 'Primeira seleção',
                            books: explore(records.slice(0, 12)),
                        },
                        {
                            key: 'second',
                            title: 'Segunda seleção',
                            books: explore(records.slice(8, 20)),
                        },
                    ],
                };
            else if (p.endsWith('/books/search'))
                result = paginated(
                    explore(records),
                    Number(u.searchParams.get('page')) || 0
                );
            else if (/\/user-books\/\d+$/.test(p) && m === 'PATCH') {
                const record = records.find(
                    (r) => r.id === Number(p.split('/').at(-1))
                );
                Object.assign(record, request.postDataJSON());
                result = record;
            } else if (/\/bookshelves\/book\/google\/.+\/me$/.test(p))
                result = [];
            else if (p.endsWith('/bookshelves/book/batch')) status = 201;
            else {
                status = 404;
                result = { message: 'Unknown fixture: ' + p };
            }
            return route.fulfill({
                status,
                ...(status === 201 ? { body: '' } : { json: result }),
            });
        });
        page = await context.newPage();
        page.setDefaultTimeout(8000);
        page.on('pageerror', (error) => runtimeErrors.push(error.message));
        const goto = async (url) => {
            await page.goto(base + url);
            await page.getByRole('article').first().waitFor();
        };
        const selectBook = (n) =>
            page.getByRole('checkbox', {
                name: 'Selecionar Livro ' + n,
                exact: true,
            });
        const modal = () => page.locator('[data-slot="dialog-content"]');
        const add = () =>
            page.getByRole('button', {
                name: 'Adicionar às estantes',
                exact: true,
            });
        const action = () =>
            modal().getByRole('button', {
                name: 'Adicionar livros',
                exact: true,
            });
        const start = async () => {
            await page
                .getByRole('button', { name: 'Selecionar livros', exact: true })
                .first()
                .click();
            await selectBook(1).waitFor();
        };
        const selected = async (n) =>
            page
                .getByText(
                    n + ' ' + (n === 1 ? 'selecionado' : 'selecionados'),
                    { exact: true }
                )
                .waitFor();
        const cancel = async () =>
            page.getByRole('button', { name: 'Cancelar', exact: true }).click();
        const step = async (name, fn) => {
            phase = name;
            await fn();
            console.log('PASS ' + name);
        };

        await step(
            'single selection, full-card click, keyboard and mixed select-all',
            async () => {
                await goto('/my-books');
                await start();
                assert.ok(
                    await selectBook(1).evaluate(
                        (e) => e === document.activeElement
                    )
                );
                assert.equal(
                    await page
                        .getByRole('article')
                        .first()
                        .getByRole('link')
                        .count(),
                    0
                );
                await selectBook(1).press('Space');
                await selected(1);
                assert.equal(
                    await page
                        .getByRole('article')
                        .first()
                        .evaluate(
                            (element) =>
                                getComputedStyle(element).borderTopColor
                        ),
                    'rgb(32, 35, 35)'
                );
                assert.equal(
                    await page
                        .getByRole('checkbox', {
                            name: 'Selecionar todos desta página',
                        })
                        .locator('.lucide-minus')
                        .count(),
                    1
                );
                assert.equal(
                    await page
                        .getByRole('checkbox', {
                            name: 'Selecionar todos desta página',
                        })
                        .getAttribute('aria-checked'),
                    'mixed'
                );
                await page
                    .getByRole('article')
                    .nth(1)
                    .locator('.book-selection-hit')
                    .click();
                await selected(2);
                await page
                    .getByRole('checkbox', {
                        name: 'Selecionar todos desta página',
                    })
                    .click();
                await selected(20);
                await page
                    .getByRole('checkbox', {
                        name: 'Selecionar todos desta página',
                    })
                    .click();
                await selected(0);
                assert.ok(await add().isDisabled());
                await cancel();
                await page
                    .getByRole('article')
                    .first()
                    .getByRole('link')
                    .first()
                    .waitFor();
            }
        );
        await step(
            'discard confirmation for status, page, history and site navigation',
            async () => {
                await start();
                await selectBook(1).click();
                await page
                    .getByRole('button', { name: 'Lendo', exact: true })
                    .click();
                await page
                    .getByRole('heading', {
                        name: 'Descartar seleção?',
                        exact: true,
                    })
                    .waitFor();
                await page
                    .getByRole('button', {
                        name: 'Continuar selecionando',
                        exact: true,
                    })
                    .click();
                await selected(1);
                await page
                    .getByRole('button', { name: 'Lendo', exact: true })
                    .click();
                await page
                    .getByRole('button', {
                        name: 'Descartar e continuar',
                        exact: true,
                    })
                    .click();
                await page.getByText('12 livros', { exact: true }).waitFor();
                await page
                    .getByRole('button', { name: 'Todos', exact: true })
                    .click();
                await page.getByRole('article').nth(19).waitFor();
                await start();
                await selectBook(1).click();
                await page
                    .getByRole('button', { name: 'Próxima', exact: true })
                    .click();
                await page
                    .getByRole('button', {
                        name: 'Descartar e continuar',
                        exact: true,
                    })
                    .click();
                await page
                    .getByRole('article', { name: 'Livro 21', exact: true })
                    .waitFor();
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .click();
                await page
                    .getByRole('checkbox', {
                        name: 'Selecionar Livro 21',
                        exact: true,
                    })
                    .click();
                await page.goBack();
                await page
                    .getByRole('heading', {
                        name: 'Descartar seleção?',
                        exact: true,
                    })
                    .waitFor();
                await page
                    .getByRole('button', {
                        name: 'Continuar selecionando',
                        exact: true,
                    })
                    .click();
                await selected(1);
                assert.equal(new URL(page.url()).searchParams.get('page'), '1');
                await page
                    .getByRole('link', { name: 'Explorar', exact: true })
                    .first()
                    .click();
                await page
                    .getByRole('button', {
                        name: 'Descartar e continuar',
                        exact: true,
                    })
                    .click();
                await page
                    .getByRole('heading', {
                        name: 'Primeira seleção',
                        exact: true,
                    })
                    .waitFor();
            }
        );
        await step(
            'one discovery section, duplicate ids and layout switch',
            async () => {
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .first()
                    .click();
                await selectBook(1).click();
                assert.equal(
                    await page
                        .getByRole('checkbox', { name: /Selecionar Livro/ })
                        .count(),
                    12
                );
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .click();
                await page
                    .getByRole('button', {
                        name: 'Continuar selecionando',
                        exact: true,
                    })
                    .click();
                await selected(1);
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .click();
                await page
                    .getByRole('button', {
                        name: 'Descartar e continuar',
                        exact: true,
                    })
                    .click();
                await page
                    .getByRole('checkbox', {
                        name: 'Selecionar Livro 9',
                        exact: true,
                    })
                    .click();
                await selected(1);
                await cancel();
                await goto('/explore?q=livros');
                await start();
                await selectBook(1).click();
                await page
                    .getByRole('button', {
                        name: 'Visualização detalhada',
                        exact: true,
                    })
                    .click();
                await selected(1);
                await page
                    .locator('.book-item-card-detailed')
                    .first()
                    .waitFor();
                await selected(1);
                await cancel();
            }
        );
        await step(
            'membership counts, full destinations, creation and cancellation preserves books',
            async () => {
                await goto('/my-books');
                await start();
                await selectBook(1).click();
                await selectBook(2).click();
                await add().click();
                await modal()
                    .getByText('Já contém 1 de 2', { exact: true })
                    .waitFor();
                assert.ok(
                    await modal()
                        .getByRole('checkbox', { name: /Estante 2\b/ })
                        .isDisabled()
                );
                await modal()
                    .getByRole('checkbox', { name: /Estante 1\b/ })
                    .click();
                await modal()
                    .getByRole('button', { name: 'Criar estante', exact: true })
                    .click();
                const editor = modal().filter({
                    has: page.getByRole('heading', {
                        name: 'Criar estante',
                        exact: true,
                    }),
                });
                await editor
                    .getByLabel('Nome', { exact: true })
                    .fill('Criada no lote');
                await editor
                    .getByRole('button', {
                        name: 'Salvar estante',
                        exact: true,
                    })
                    .click();
                await modal()
                    .getByRole('checkbox', { name: /Criada no lote/ })
                    .waitFor();
                assert.ok(
                    await modal()
                        .getByRole('checkbox', { name: /Criada no lote/ })
                        .isChecked()
                );
                assert.ok(
                    await modal()
                        .getByRole('checkbox', { name: /Estante 1\b/ })
                        .isChecked()
                );
                await modal()
                    .getByRole('button', { name: 'Cancelar', exact: true })
                    .click();
                await selected(2);
                await cancel();
            }
        );
        await step(
            'write error, uncertain response, idempotent retry and busy lock',
            async () => {
                await start();
                await selectBook(1).click();
                await selectBook(2).click();
                await add().click();
                await modal()
                    .getByRole('checkbox', { name: /Estante 3\b/ })
                    .click();
                failWrite = true;
                await action().click();
                await modal()
                    .getByText('Não foi possível preparar os livros.', {
                        exact: true,
                    })
                    .waitFor();
                await modal()
                    .getByRole('checkbox', { name: /Estante 3\b/ })
                    .waitFor();
                assert.ok(
                    await modal()
                        .getByRole('checkbox', { name: /Estante 3\b/ })
                        .isChecked()
                );
                failWrite = false;
                unknownWrite = true;
                await action().click();
                await modal()
                    .getByText(/Não foi possível confirmar o resultado/)
                    .waitFor();
                await modal()
                    .getByText(
                        'Contagens atualizadas. Você pode repetir a operação sem duplicar livros.',
                        { exact: true }
                    )
                    .waitFor();
                unknownWrite = false;
                writeDelay = 500;
                const before = writeCount;
                await action().click();
                assert.ok(
                    await modal()
                        .getByRole('button', {
                            name: 'Adicionando...',
                            exact: true,
                        })
                        .isDisabled()
                );
                assert.ok(
                    await modal()
                        .getByRole('button', { name: 'Cancelar', exact: true })
                        .isDisabled()
                );
                await page.keyboard.press('Escape');
                assert.ok(
                    await page
                        .getByRole('heading', {
                            name: 'Adicionar livros às estantes',
                            exact: true,
                        })
                        .isVisible()
                );
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .waitFor();
                assert.equal(writeCount, before + 1);
                assert.equal(memberships.get(3).size, 2);
                writeDelay = 0;
            }
        );
        await step(
            'destination pagination and 20-destination limit',
            async () => {
                await start();
                await selectBook(4).click();
                await add().click();
                await modal().getByRole('checkbox').first().waitFor();
                for (const checkbox of await modal()
                    .getByRole('checkbox')
                    .all())
                    if (!(await checkbox.isDisabled())) await checkbox.check();
                await modal()
                    .getByText('Limite de 20 estantes por operação.', {
                        exact: true,
                    })
                    .waitFor();
                assert.ok(
                    await modal()
                        .getByRole('button', {
                            name: 'Criar estante',
                            exact: true,
                        })
                        .isDisabled()
                );
                await modal()
                    .getByRole('button', { name: 'Próxima', exact: true })
                    .click();
                await modal()
                    .getByRole('checkbox', { name: /Estante 21\b/ })
                    .waitFor();
                assert.ok(
                    await modal().getByRole('checkbox').first().isDisabled()
                );
                await modal()
                    .getByRole('button', { name: 'Anterior', exact: true })
                    .click();
                await modal().getByRole('checkbox').first().uncheck();
                await modal()
                    .getByRole('button', { name: 'Próxima', exact: true })
                    .click();
                await modal()
                    .getByRole('checkbox', { name: /Estante 21\b/ })
                    .waitFor();
                await modal().getByRole('checkbox').first().check();
                await modal()
                    .getByText('20 selecionadas', { exact: true })
                    .waitFor();
                await modal()
                    .getByRole('button', { name: 'Cancelar', exact: true })
                    .click();
                await cancel();
            }
        );
        await step(
            'summary failure prevents sending and permits retry',
            async () => {
                await start();
                await selectBook(1).click();
                failSummary = true;
                await add().click();
                await modal()
                    .getByText(
                        'O servidor encontrou um erro interno. Tente novamente mais tarde.',
                        { exact: true }
                    )
                    .waitFor();
                assert.ok(await action().isDisabled());
                failSummary = false;
                await modal()
                    .getByRole('button', {
                        name: 'Tentar novamente',
                        exact: true,
                    })
                    .click();
                await modal().getByRole('checkbox').first().waitFor();
                await modal()
                    .getByRole('button', { name: 'Cancelar', exact: true })
                    .click();
                await cancel();
            }
        );
        await step(
            'favorites, shelf detail and reload without removing existing cards',
            async () => {
                await goto('/my-books?favorite=true');
                await start();
                await selectBook(1).click();
                await add().click();
                await modal()
                    .getByRole('checkbox', { name: /Estante 4\b/ })
                    .check();
                libraryDelay = 500;
                await action().click();
                await page.getByRole('article').first().waitFor();
                assert.ok((await page.getByRole('article').count()) > 0);
                await page.waitForFunction(() =>
                    document.activeElement?.hasAttribute('data-selection-entry')
                );
                libraryDelay = 0;
                await goto('/my-books?view=shelves&shelfId=1');
                await start();
                await selectBook(1).click();
                await add().click();
                await modal()
                    .getByRole('checkbox', { name: /Estante 5\b/ })
                    .check();
                await action().click();
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .waitFor();
                assert.ok((await page.getByRole('article').count()) > 0);
                await page.waitForFunction(() =>
                    document.activeElement?.hasAttribute('data-selection-entry')
                );
            }
        );
        await step(
            'responsive selection and dialog in 320, 390, 768, 1280px',
            async () => {
                for (const width of [320, 390, 768, 1280]) {
                    await goto('/my-books');
                    await page.setViewportSize({ width, height: 900 });
                    await start();
                    await selectBook(1).click();
                    assert.equal(
                        await page.evaluate(
                            () =>
                                document.documentElement.scrollWidth >
                                innerWidth
                        ),
                        false
                    );
                    assert.equal(
                        await page
                            .locator('.book-selection-actions')
                            .evaluate((e) => getComputedStyle(e).position),
                        width <= 760 ? 'fixed' : 'static'
                    );
                    await page.screenshot({
                        path: path.join(output, 'selection-' + width + '.png'),
                    });
                    await add().click();
                    await modal().getByRole('checkbox').first().waitFor();
                    assert.equal(
                        await page.evaluate(
                            () =>
                                document.documentElement.scrollWidth >
                                innerWidth
                        ),
                        false
                    );
                    await page.screenshot({
                        path: path.join(output, 'dialog-' + width + '.png'),
                    });
                    await modal()
                        .getByRole('button', { name: 'Cancelar', exact: true })
                        .click();
                    await cancel();
                }
            }
        );
        await step(
            'individual actions and legacy routes remain available',
            async () => {
                await goto('/my-books');
                const card = page.getByRole('article').first();
                await card
                    .getByRole('button', { name: /Remover dos favoritos/ })
                    .click();
                await card
                    .getByRole('button', { name: /Favoritar:/ })
                    .waitFor();
                await card.getByRole('button', { name: /Opções de/ }).click();
                await page
                    .getByRole('menuitem', {
                        name: 'Adicionar a uma estante',
                        exact: true,
                    })
                    .click();
                await modal().getByRole('checkbox').first().check();
                await modal()
                    .getByRole('button', {
                        name: 'Adicionar livro',
                        exact: true,
                    })
                    .click();
                await modal().waitFor({ state: 'detached' });
                assert.ok(
                    requests.some(
                        (request) =>
                            request.p.endsWith('/bookshelves/book/batch') &&
                            request.body.googleBooksId === 'g1'
                    )
                );
                await goto('/my-books/list?status=READING');
                assert.equal(new URL(page.url()).pathname, '/my-books');
                await goto('/search?q=livros');
                assert.equal(new URL(page.url()).pathname, '/explore');
                await goto('/my-books');
            }
        );
        await step(
            'visitor login entry and no selection after sign-out',
            async () => {
                await start();
                await selectBook(1).click();
                await page.evaluate(() => {
                    localStorage.setItem('bulk-visitor', 'true');
                    localStorage.removeItem('letterbooks.token');
                    window.dispatchEvent(
                        new StorageEvent('storage', {
                            key: 'letterbooks.token',
                            newValue: null,
                        })
                    );
                });
                await page.waitForURL('**/login');
                authenticated = false;
                await goto('/explore?q=livros');
                await page
                    .getByRole('button', {
                        name: 'Selecionar livros',
                        exact: true,
                    })
                    .click();
                await page.waitForURL('**/login');
                assert.equal(
                    await page
                        .getByRole('checkbox', { name: /Selecionar Livro/ })
                        .count(),
                    0
                );
            }
        );
        assert.equal(runtimeErrors.length, 0, runtimeErrors.join('\n'));
        await fs.writeFile(
            path.join(output, 'results.json'),
            JSON.stringify(
                { requests, runtimeErrors, writeCount, authenticated },
                null,
                2
            )
        );
        console.log('PASS no browser runtime errors; artifacts: ' + output);
    } catch (error) {
        if (page)
            await page
                .screenshot({
                    path: path.join(output, 'failure.png'),
                    fullPage: true,
                })
                .catch(() => {});
        throw error;
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
