// cleanup-jsx.js — second-pass cleanup for JSX/JS files that still have TS syntax.
// Run AFTER strip-types.js to fix what was missed.

const fs = require("fs");
const path = require("path");

function fix(content) {
  let out = content;

  // 1. Remove `useState<TypeName>` generic → useState(...)
  out = out.replace(/useState<[^>]+>/g, "useState");

  // 2. Remove `useRef<TypeName>`, `useCallback<TypeName, ...>`, `useMemo<TypeName>`
  out = out.replace(/use(Ref|Callback|Memo|Effect|Context|Reducer)<[^>]+>/g, "use$1");

  // 3. Remove `<TypeName>` after other generic-looking calls (e.g. `setState<X>`)
  out = out.replace(/\.useState<[^>]+>/g, ".useState");
  out = out.replace(/\.useRef<[^>]+>/g, ".useRef");
  out = out.replace(/\.useEffect<[^>]+>/g, ".useEffect");

  // 4. Remove `<TypeArg>(` pattern (cast + call). e.g. `(null as string)()`  — not common in this codebase.

  // 5. Remove inline object type annotations on variable assignments: `const x: { foo: number } = {...}`
  //    These are common in this codebase. Match: `: { ... }` followed by `=` or `,` or end-of-line.
  out = out.replace(/:\s*\{[^{}]*\}(\[\])?(?=\s*[=,)\n]|;)/g, "");

  // 6. Remove function return types we missed: `): T {` and `): T =>`
  out = out.replace(/\)\s*:\s*([A-Za-z_$][\w$.<>,\[\]\s|&'"\-]*)(\s*\{|\s*=>)/g, ")$2");

  // 7. Remove function param types: `(x: Type,` or `(x: Type)`
  out = out.replace(/(\(|,\s*)([A-Za-z_$][\w$]*)\s*:\s*([A-Za-z_$][\w$.<>,\[\]\s|&'"\-]*?)(?=\s*[,)=]|\s*$|\s*\n)/g, "$1$2");

  // 8. Remove `as const` if missed
  out = out.replace(/\s+as\s+const\b/g, "");

  // 9. Remove `as Type` if missed
  out = out.replace(/\s+as\s+[A-Z][A-Za-z0-9_$]*/g, "");

  // 10. Remove union type literal: `"phone" | "otp"` → just delete (but keep the call to useState)
  out = out.replace(/"[^"]*"\s*\|\s*"[^"]*"/g, "");

  // 11. Remove `key: type` pattern inside `{ ... }` if missed
  out = out.replace(/(\w+)\s*:\s*[A-Z][A-Za-z0-9_$.<>,\[\]\s|&'"]*?(?=[,}\n])/g, "$1");

  // 12. Remove type-only generic parameter syntax `<T>` in JSX (e.g. `<Foo<string>>` would break)
  //     Already handled by the script — skip.

  return out;
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("usage: node cleanup-jsx.js <file...>");
  process.exit(1);
}

for (const t of targets) {
  const original = fs.readFileSync(t, "utf8");
  const fixed = fix(original);
  if (fixed !== original) {
    fs.writeFileSync(t, fixed);
    console.log("cleaned:", t);
  }
}
