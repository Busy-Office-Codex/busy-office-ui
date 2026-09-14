/**
 * Pulls the first fenced ```jsx code block out of a doc's raw markdown body. Every
 * `docs/*.md` page's Accept (ROADMAP item 15) has exactly one such block — the same
 * text is rendered as visible source (via Astro's own markdown renderer, `render(entry)`)
 * and, compiled, as the live demo. This is a single small regex, not a markdown parser.
 */
export function extractJsxBlock(body: string): string | null {
  const match = body.match(/```jsx\n([\s\S]*?)```/);
  return match ? match[1].trim() : null;
}
