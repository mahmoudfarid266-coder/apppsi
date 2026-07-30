/**
 * COPY LINT — T019/T020, research R5. Constitution Principles IV and XI.
 *
 * Two checks:
 *   1. No string in the catalogue matches the banned-pattern list.
 *   2. No user-facing string literal exists outside the catalogue, so check 1
 *      cannot be bypassed by inlining.
 *
 * These rules are absolutes about ABSENCE. Behaviour tests cannot verify them —
 * only inspecting the artefact set can. A failing build is the only durable
 * enforcement, because each individual violation looks harmless in isolation
 * ("just a red badge", "just a streak counter").
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const CATALOGUE = 'src/ui/copy.catalogue.ts';

interface Rule {
  name: string;
  principle: string;
  re: RegExp;
  /** Companion voice only, or all user-facing copy. */
  companionOnly?: boolean;
}

const RULES: Rule[] = [
  { name: 'money', principle: 'XI (FR-024)', re: /[$£€]|\b(charge|owe|forfeit|stake|paid|refund|balance|owed)\b/i },
  { name: 'shame / failure', principle: 'IV (FR-023)', re: /\b(failed|failure|missed|behind|should have|neglect|you lost|broke your|streak)\b/i },
  { name: 'manufactured urgency', principle: 'XI', re: /\b(hurry|last chance|don'?t forget|finally)\b/i },
  { name: 'count of not-done', principle: 'IV (FR-031)', re: /\b(overdue|remaining|days since|left to do)\b/i },
  { name: 'absence reference', principle: 'IV (FR-022)', re: /\b(been a while|long time|where have you been|welcome back)\b/i },
  { name: 'exclamation in companion voice', principle: 'XI', re: /!/, companionOnly: true },
];

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.ts', '.tsx'].includes(extname(p))) out.push(p);
  }
  return out;
}

let failures = 0;
const fail = (msg: string) => {
  console.error(`  FAIL  ${msg}`);
  failures++;
};

/* ---- check 1: banned patterns in the catalogue ---- */
const cat = readFileSync(CATALOGUE, 'utf8');
const catLines = cat.split('\n');

// The companion block runs from `export const companion` to the next export.
const compStart = catLines.findIndex((l) => /export const companion/.test(l));
const compEnd = catLines.findIndex((l, i) => i > compStart && /^export const (?!companion)/.test(l));

catLines.forEach((line, i) => {
  if (line.trim().startsWith('*') || line.trim().startsWith('//')) return; // comments
  const strings = line.match(/'([^']{2,})'|"([^"]{2,})"|`([^`]{2,})`/g) ?? [];
  if (strings.length === 0) return;
  const inCompanion = i > compStart && (compEnd === -1 || i < compEnd);
  for (const rule of RULES) {
    if (rule.companionOnly && !inCompanion) continue;
    for (const s of strings) {
      if (rule.re.test(s)) {
        fail(`${CATALOGUE}:${i + 1} [${rule.name}] ${rule.principle} -> ${s}`);
      }
    }
  }
});

/* ---- check 2: user-facing literals outside the catalogue ---- */
// A literal is "user-facing" if it sits in a JSX text position or a Text child.
// Heuristic, deliberately narrow: >3 words with a space, inside app/ or src/ui,
// excluding the catalogue itself and style/accessibility props.
const IGNORE_PROP = /(accessibilityLabel|accessibilityHint|accessibilityRole|testID|placeholderTextColor|fontFamily|backgroundColor|borderBottomColor|color|name|key|id)=/;

for (const file of [...walk('app'), ...walk('src/ui')]) {
  if (file.replace(/\\/g, '/').endsWith(CATALOGUE)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const t = line.trim();
    if (t.startsWith('*') || t.startsWith('//') || t.startsWith('import')) return;
    if (IGNORE_PROP.test(line)) return;
    // JSX text between tags, or a quoted phrase passed as label=
    const jsxText = line.match(/>\s*([A-Z][a-z]+(?:\s+\w+){2,})\s*</);
    const labelStr = line.match(/label="([^"]{8,})"/);
    const hit = jsxText?.[1] ?? labelStr?.[1];
    if (hit) fail(`${file}:${i + 1} literal outside catalogue -> "${hit}"`);
  });
}

console.log(failures === 0 ? 'copy lint: clean' : `copy lint: ${failures} violation(s)`);
process.exit(failures === 0 ? 0 : 1);
