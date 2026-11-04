import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generate, names, normalize, select } from "./catalog-seed.mjs";

test("normalization follows current author display and category splitting rules", () => {
  assert.equal(normalize("  Ficção   Científica! "), "ficcao cientifica");
  assert.equal(normalize("nome\u00a0composto"), "nomecomposto");
  assert.deepEqual(
    names({ authors: ["O'Brien, Ana", "O'Brien, Ana"] }, "authors"),
    [{ name: "Ana O'Brien", normalized: "ana obrien" }],
  );
  assert.deepEqual(
    names({ categories: [" Fiction / General / Fiction "] }, "categories"),
    [
      { name: "Fiction", normalized: "fiction" },
      { name: "General", normalized: "general" },
    ],
  );
  assert.throws(() => normalize("東京"));
});
test("SQL safely quotes apostrophes, backslashes, newlines and statement delimiters", () => {
  const volumeInfo = {
    title: "O'Brien; -- não é SQL",
    authors: ["Ana O'Brien"],
    categories: ["Fiction"],
    description: "linha 1\nlinha 2; 'aspas' \\ teste",
  };
  const sql = generate([{ id: "fixture", volumeInfo }]);
  const escaped = JSON.stringify(volumeInfo).replaceAll("'", "''");
  assert.ok(sql.includes("'" + escaped + "'"));
  assert.ok(sql.includes("SET LOCAL standard_conforming_strings = on;"));
  assert.ok(sql.endsWith("COMMIT;\n"));
});
test("versioned catalog is complete, distinct and SQL is reproducible offline", () => {
  const snapshot = JSON.parse(
    fs.readFileSync(
      new URL("../../docs/seed/google-books.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(snapshot.complete, true);
  assert.equal(snapshot.books.length, 60);
  assert.equal(new Set(snapshot.books.map((b) => b.id)).size, 60);
  for (const theme of ["fiction", "technology", "biographies"])
    assert.equal(snapshot.books.filter((b) => b.theme === theme).length, 20);
  assert.ok(
    snapshot.books.some((b) => /^pt(?:-|$)/i.test(b.volumeInfo.language)),
  );
  assert.equal(
    generate(snapshot.books),
    fs.readFileSync(
      new URL("../src/main/resources/db/seed/books.sql", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(select(snapshot.candidates), snapshot.books);
});
