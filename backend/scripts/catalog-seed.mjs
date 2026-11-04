import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const snapshotPath = path.join(root, "docs/seed/google-books.json");
const sqlPath = path.join(root, "backend/src/main/resources/db/seed/books.sql");
const themes = {
  fiction: {
    terms: [
      "fiction",
      "ficção",
      "literatura",
      "Machado de Assis",
      "Clarice Lispector",
      "José Saramago",
      "Franz Kafka",
      "Dostoiévski",
      "Tolkien",
    ],
    matches: /fiction|fic[cç][aã]o/i,
  },
  technology: {
    terms: [
      "technology",
      "tecnologia",
      "engineering",
      "engenharia",
      "electrical engineering",
      "civil engineering",
      "mechanical engineering",
      "technology and engineering",
      "industrial technology",
    ],
    matches: /technology|tecnologia/i,
  },
  biographies: {
    terms: [
      "biography",
      "biographies",
      "biografia",
      "autobiography",
      "memoirs",
      "Steve Jobs",
      "Albert Einstein",
      "Nelson Mandela",
      "Marie Curie",
    ],
    matches: /biograph|biograf/i,
  },
};

export function normalize(value) {
  // Java's default regex \s is ASCII whitespace (unlike JavaScript's \s).
  const result = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-zA-Z0-9 \t\n\x0B\f\r]/g, "")
    .replace(/[ \t\n\x0B\f\r]+/g, " ")
    .trim()
    .toLowerCase();
  if (!result) throw new Error("Name without valid normalized characters");
  return result;
}
export function names(volume, type) {
  const result = new Map();
  for (const raw of volume[type] ?? []) {
    if (!raw?.trim()) continue;
    const values =
      type === "authors"
        ? [
            raw.trim().includes(",")
              ? raw
                  .trim()
                  .split(",")
                  .map((s) => s.trim())
                  .reverse()
                  .join(" ")
              : raw.trim(),
          ]
        : raw
            .split("/")
            .map((s) => s.trim())
            .filter(Boolean);
    for (const name of values)
      result.set(normalize(name), { name, normalized: normalize(name) });
  }
  return [...result.values()];
}
function keyFromConfiguration() {
  let key = process.env.GOOGLE_BOOKS_API_KEY || process.env.GOOGLEBOOKS_API_KEY;
  for (const relative of [
    "backend/src/main/resources/application-dev.properties",
    "backend/.env",
    ".env",
  ]) {
    const file = path.join(root, relative);
    if (!key && fs.existsSync(file)) {
      const match = fs
        .readFileSync(file, "utf8")
        .match(
          /^(?:googlebooks\.api\.key|GOOGLE_BOOKS_API_KEY|GOOGLEBOOKS_API_KEY)\s*=\s*(.+)$/m,
        );
      if (match) key = match[1].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  if (key?.startsWith("${")) key = process.env[key.slice(2, -1)];
  if (!key)
    throw new Error(
      "Configure GOOGLE_BOOKS_API_KEY or the existing application-dev.properties key.",
    );
  return key;
}
function acceptable(book, theme) {
  const v = book?.volumeInfo;
  if (
    !book.id ||
    !v?.title ||
    !v.authors?.length ||
    !v.categories?.some((c) => themes[theme].matches.test(c))
  )
    return false;
  try {
    return names(v, "authors").length > 0 && names(v, "categories").length > 0;
  } catch {
    return false;
  }
}
export function select(candidates) {
  const ids = new Set(),
    works = new Set(),
    books = [];
  for (const theme of Object.keys(themes)) {
    const pool = candidates
      .filter((b) => acceptable(b, theme))
      .sort((a, b) => {
        const score = (b) =>
          (/^pt(?:-|$)/i.test(b.volumeInfo.language ?? "") ? 10 : 0) +
          (b.volumeInfo.imageLinks?.thumbnail ? 2 : 0);
        return score(b) - score(a);
      });
    let count = 0;
    for (const book of pool) {
      const work =
        normalize(book.volumeInfo.title) +
        ":" +
        names(book.volumeInfo, "authors")
          .map((n) => n.normalized)
          .sort()
          .join("|");
      if (ids.has(book.id) || works.has(work)) continue;
      books.push({ theme, ...book });
      ids.add(book.id);
      works.add(work);
      if (++count === 20) break;
    }
  }
  return books;
}
async function collect(snapshot) {
  const key = keyFromConfiguration();
  for (const [theme, definition] of Object.entries(themes)) {
    for (const lang of ["pt", ""])
      for (const q of definition.terms) {
        if (
          select(snapshot.candidates).filter((b) => b.theme === theme).length >=
          20
        )
          break;
        if (
          snapshot.requests.some(
            (r) =>
              r.theme === theme &&
              r.query === q &&
              r.language === (lang || null) &&
              r.status === 200 &&
              r.items > 0,
          )
        )
          continue;
        let entry;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const url = new URL("https://www.googleapis.com/books/v1/volumes");
            url.search = new URLSearchParams({
              q,
              maxResults: "40",
              printType: "books",
              key,
              ...(lang ? { langRestrict: lang } : {}),
            });
            const response = await fetch(url, {
              signal: AbortSignal.timeout(12000),
            });
            const data = await response.json();
            entry = {
              theme,
              query: q,
              language: lang || null,
              at: new Date().toISOString(),
              status: response.status,
              items: data.items?.length ?? 0,
            };
            if (response.ok) {
              const byId = new Map(snapshot.candidates.map((b) => [b.id, b]));
              for (const book of data.items ?? [])
                if (book.id && book.volumeInfo)
                  byId.set(book.id, {
                    id: book.id,
                    volumeInfo: book.volumeInfo,
                  });
              snapshot.candidates = [...byId.values()];
              break;
            }
            if (response.status !== 429 && response.status < 500) break;
          } catch {
            entry = {
              theme,
              query: q,
              language: lang || null,
              at: new Date().toISOString(),
              status: "connection-or-timeout",
              items: 0,
            };
          }
          if (!attempt)
            await new Promise((resolve) => setTimeout(resolve, 750));
        }
        snapshot.requests.push(entry);
        save(snapshot);
        console.log(JSON.stringify(entry));
      }
  }
}
function save(snapshot) {
  snapshot.collectedAt =
    snapshot.requests.at(-1)?.at ?? snapshot.collectedAt ?? null;
  snapshot.books = select(snapshot.candidates);
  snapshot.counts = Object.fromEntries(
    Object.keys(themes).map((theme) => [
      theme,
      snapshot.books.filter((b) => b.theme === theme).length,
    ]),
  );
  snapshot.languages = snapshot.books.reduce((counts, book) => {
    const language = book.volumeInfo.language ?? "unknown";
    counts[language] = (counts[language] ?? 0) + 1;
    return counts;
  }, {});
  snapshot.complete = snapshot.books.length === 60;
  fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2) + "\n");
}

// SQL literals are generated from metadata, never interpolated as identifiers.
const literal = (value) =>
  value == null ? "NULL" : "'" + String(value).replaceAll("'", "''") + "'";
export function generate(books) {
  const rows = books.map((b) =>
    [b.id, JSON.stringify(b.volumeInfo)].map(literal).join(", "),
  );
  const associations = (type) =>
    books.flatMap((b) =>
      names(b.volumeInfo, type).map(
        (n) =>
          `(${literal(b.id)}, ${literal(n.name)}, ${literal(n.normalized)})`,
      ),
    );
  let sql = `-- Generated by backend/scripts/catalog-seed.mjs. Google Books metadata only.\n-- Selected books: ${books.length}/60. Existing catalog records and personal data are preserved.\nBEGIN;\nSET LOCAL standard_conforming_strings = on;\nLOCK TABLE books, authors, author_name, categories, category_name, book_author, book_category IN SHARE ROW EXCLUSIVE MODE;\nCREATE TEMP TABLE lb_seed_books (google_id text PRIMARY KEY, info jsonb) ON COMMIT DROP;\n`;
  if (rows.length)
    sql +=
      "INSERT INTO lb_seed_books (google_id, info) VALUES\n" +
      rows.map((r) => "(" + r + ")").join(",\n") +
      ";\n";
  sql += `DELETE FROM lb_seed_books s WHERE EXISTS (SELECT 1 FROM books b WHERE b.google_books_id = s.google_id);\n`;
  for (const [type, entity, table] of [
    ["authors", "author", "authors"],
    ["categories", "category", "categories"],
  ]) {
    const rows = associations(type);
    sql += `CREATE TEMP TABLE lb_seed_${type}_raw (google_id text, name text, normalized text) ON COMMIT DROP;\n`;
    if (rows.length)
      sql += `INSERT INTO lb_seed_${type}_raw VALUES\n${rows.join(",\n")};\n`;
    sql += `CREATE TEMP TABLE lb_seed_${type} ON COMMIT DROP AS
SELECT n.normalized, MIN(n.name) AS name,
       COALESCE((SELECT existing.${entity}_id FROM ${entity}_name existing WHERE existing.normalized_name = n.normalized), nextval(pg_get_serial_sequence('${table}', 'id'))) AS entity_id,
       NOT EXISTS (SELECT 1 FROM ${entity}_name e WHERE e.normalized_name = n.normalized) AS is_new
FROM lb_seed_${type}_raw n JOIN lb_seed_books b ON b.google_id = n.google_id GROUP BY n.normalized;
INSERT INTO ${table} (id) SELECT entity_id FROM lb_seed_${type} s WHERE s.is_new;
INSERT INTO ${entity}_name (name, normalized_name, is_primary, ${entity}_id)
SELECT name, normalized, true, entity_id FROM lb_seed_${type} s WHERE NOT EXISTS (SELECT 1 FROM ${entity}_name e WHERE e.normalized_name = s.normalized);
`;
  }
  sql += `INSERT INTO books (google_books_id, title, subtitle, description, publisher, published_date, published_year, image_url, thumbnail_url, page_count, language, isbn, maturity_rating, created_at)
SELECT google_id, info->>'title', info->>'subtitle', info->>'description', info->>'publisher', info->>'publishedDate',
CASE WHEN left(info->>'publishedDate',4) ~ '^[0-9]{4}$' THEN left(info->>'publishedDate',4)::integer ELSE NULL END,
COALESCE(info#>>'{imageLinks,extraLarge}',info#>>'{imageLinks,large}',info#>>'{imageLinks,medium}',info#>>'{imageLinks,small}',info#>>'{imageLinks,thumbnail}'),
COALESCE(info#>>'{imageLinks,thumbnail}',info#>>'{imageLinks,smallThumbnail}'), (info->>'pageCount')::integer, info->>'language',
COALESCE((SELECT value->>'identifier' FROM jsonb_array_elements(info->'industryIdentifiers') WHERE value->>'type'='ISBN_13' LIMIT 1),(SELECT value->>'identifier' FROM jsonb_array_elements(info->'industryIdentifiers') WHERE value->>'type'='ISBN_10' LIMIT 1)),
CASE WHEN upper(info->>'maturityRating') IN ('MATURE','NOT_MATURE') THEN upper(info->>'maturityRating') ELSE 'NOT_MATURE' END, CURRENT_TIMESTAMP
FROM lb_seed_books;
`;
  for (const [type, entity] of [
    ["authors", "author"],
    ["categories", "category"],
  ])
    sql += `INSERT INTO book_${entity} (book_id, ${entity}_id)
SELECT DISTINCT b.id, n.entity_id FROM lb_seed_${type}_raw r JOIN lb_seed_books s ON s.google_id = r.google_id JOIN books b ON b.google_books_id = r.google_id JOIN lb_seed_${type} n ON n.normalized = r.normalized;
`;
  return sql + "COMMIT;\n";
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const snapshot = fs.existsSync(snapshotPath)
    ? JSON.parse(fs.readFileSync(snapshotPath, "utf8"))
    : {
        source: "Google Books API v1",
        candidates: [],
        requests: [],
        books: [],
      };
  if (process.argv.includes("--collect")) await collect(snapshot);
  save(snapshot);
  fs.mkdirSync(path.dirname(sqlPath), { recursive: true });
  fs.writeFileSync(sqlPath, generate(snapshot.books));
  console.log(
    JSON.stringify({
      complete: snapshot.complete,
      selected: snapshot.books.length,
      counts: snapshot.counts,
    }),
  );
}
