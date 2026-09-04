// strip-types.js — Strip TypeScript syntax from a .jsx / .js file (subset of TS).
// Designed for this codebase; not a full TS-to-JS compiler.

const fs = require("fs");
const path = require("path");

function strip(content) {
  let out = content;

  // 1. Remove `import type { ... } from "...";` (full line)
  out = out.replace(/^\s*import\s+type\s+\{[^}]*\}\s+from\s+["'][^"']+["'];?\s*$/gm, "");

  // 2. Remove `import type X from "...";` (full line, default import)
  out = out.replace(/^\s*import\s+type\s+[A-Za-z_$][\w$]*\s+from\s+["'][^"']+["'];?\s*$/gm, "");

  // 3. Remove `import type X, { Y } from "...";`
  out = out.replace(/^\s*import\s+type\s+[^"';]+from\s+["'][^"']+["'];?\s*$/gm, "");

  // 4. Remove `export type { ... }` lines
  out = out.replace(/^\s*export\s+type\s+\{[^}]*\}\s+;?\s*$/gm, "");

  // 5. Strip `type X` (and `type X, Y`) modifiers from mixed `import { type X, Y, type Z } from "...";`
  out = out.replace(
    /import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g,
    (m, inner, src) => {
      const items = inner
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && !/^type(\s|$)/.test(s) && !/^type\s*\{/.test(s));
      if (items.length === 0) return "";
      return `import { ${items.join(", ")} } from "${src}";`;
    },
  );

  // 6. Remove `export type Name = ...;` (top-level; single line up to ;)
  out = out.replace(/^\s*export\s+type\s+[A-Za-z_$][\w$]*\s*(<[^>]+>)?\s*=\s*[^;\n]+;?\s*$/gm, "");

  // 7. Remove `type Name = ...;` (top-level, single line)
  out = out.replace(/^\s*type\s+[A-Za-z_$][\w$]*\s*(<[^>]+>)?\s*=\s*[^;\n]+;?\s*$/gm, "");

  // 8. Remove `interface Name { ... }` blocks (handles single-line `{ ... }` too)
  out = out.replace(
    /^\s*(export\s+)?interface\s+[A-Za-z_$][\w$]*\s*(<[^>]+>)?\s+(extends\s+[A-Za-z_$][\w$.<>,\[\]\s|&'"]*\s*)?\{[\s\S]*?^\s*\}\s*$/gm,
    "",
  );

  // 9. Remove `as <Type>` (but be careful — only for known TS keyword types or capitalized identifiers)
  //    Patterns: `as Type`, `as "literal"`, `as const`
  out = out.replace(/\s+as\s+(const\b|[A-Z][A-Za-z0-9_$]*|["'][^"']*["'])/g, "");

  // 10. Remove parameter type annotations like `(e: FormEvent)`, `(props: MyProps)`, `(x: string)`.
  //     Only matches when colon is followed by an identifier (TS type), then `,` `)` `=` or `{` (default).
  out = out.replace(/(\(|,\s*)([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$.<>,\[\]\s|&'"\-]*?)(?=\s*[,)=]|\s*$|\s*\n)/g, "$1$2");

  // 11. Remove function return type annotations: `): T {` and `): T =>`
  out = out.replace(/\)\s*:\s*([A-Za-z_$][\w$.<>,\[\]\s|&'"\-]*)(\s*\{|\s*=>)/g, ")$2");

  // 12. Remove variable type annotations: `const x: T = ...`, `let x: T = ...`
  //     Conservative: only after identifier and before `=` or `,` or end of statement.
  out = out.replace(
    /(\b(?:const|let|var)\s+[A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$.<>,\[\]\s|&'"\-]*?)\s*(?==|,|\n|$)/g,
    "$1",
  );

  // 13. Remove function param default-value type annotations like `(x: T = defaultValue)`.
  //     (Already covered by #10 since we strip until `=,)` boundary.)

  // 14. Remove trailing `?` on optional fields? — Leave as-is, optional chaining is JS.

  // 15. Remove `<T>` generic type parameters in calls and class declarations
  //     This is dangerous; skip for now and rely on Vite/JSX to handle.

  // 16. Remove `declare module` blocks
  out = out.replace(/^\s*declare\s+module\s+["'][^"']+["']\s*\{[\s\S]*?^\s*\}\s*$/gm, "");

  // 17. Remove `// @ts-ignore`, `// @ts-expect-error`
  out = out.replace(/^\s*\/\/\s*@ts-(?:ignore|expect-error|nocheck)[^\n]*$/gm, "");

  // 18. Remove non-null assertion `!` after identifiers (used in `.tsx` like `getElementById("root")!`)
  //     Be conservative: only `)!` patterns (closing paren + bang).
  out = out.replace(/\)!/g, ")");

  // 19. Collapse multiple blank lines
  out = out.replace(/\n{3,}/g, "\n\n");

  return out;
}

function processFile(file) {
  const original = fs.readFileSync(file, "utf8");
  const stripped = strip(original);
  if (stripped !== original) {
    fs.writeFileSync(file, stripped);
    console.log("stripped:", file);
  }
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("usage: node strip-types.js <file...>");
  process.exit(1);
}

for (const t of targets) processFile(t);
