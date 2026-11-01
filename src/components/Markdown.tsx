import type { ReactNode } from "react";

// Minimal renderer for the markdown the MedNova skills produce: headings, bold/italic,
// inline code, bullet and numbered lists, tables and rules. Builds React elements
// (no raw HTML), so model output can't inject markup.

const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) parts.push(<strong key={key}>{renderInline(token.slice(2, -2), key)}</strong>);
    else if (token.startsWith("`")) parts.push(<code key={key} className="px-1 rounded bg-muted text-xs">{token.slice(1, -1)}</code>);
    else parts.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

const splitRow = (line: string) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());

const isTableSeparator = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

export const Markdown = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const key = `b${i}`;

    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^\s*-{3,}\s*$/.test(line)) {
      blocks.push(<hr key={key} className="my-3 border-primary/10" />);
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const size = heading[1].length <= 2 ? "text-base" : "text-sm";
      blocks.push(<p key={key} className={`${size} font-bold mt-3`}>{renderInline(heading[2], key)}</p>);
      i++;
      continue;
    }

    if (line.trim().startsWith("|") && i + 1 < lines.length && isTableSeparator(lines[i + 1])) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      blocks.push(
        <div key={key} className="overflow-x-auto my-2">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {header.map((cell, c) => (
                  <th key={c} className="border border-primary/10 bg-primary/5 px-2 py-1 text-left font-semibold">{renderInline(cell, `${key}h${c}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={c} className="border border-primary/10 px-2 py-1 align-top">{renderInline(cell, `${key}r${r}c${c}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    const listItem = /^\s*(?:[-*]|\d+\.)\s+/;
    if (listItem.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && listItem.test(lines[i])) {
        items.push(lines[i].replace(listItem, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag key={key} className={`${ordered ? "list-decimal" : "list-disc"} pl-5 space-y-0.5 my-1`}>
          {items.map((item, n) => (
            <li key={n}>{renderInline(item, `${key}i${n}`)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !listItem.test(lines[i]) &&
      !lines[i].trim().startsWith("|") &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^\s*-{3,}\s*$/.test(lines[i])
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    if (paragraph.length === 0) {
      // A stray table row without a separator - show it as plain text
      paragraph.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key} className="my-1">
        {paragraph.map((p, n) => (
          <span key={n}>
            {n > 0 && <br />}
            {renderInline(p, `${key}p${n}`)}
          </span>
        ))}
      </p>,
    );
  }

  return <div className="text-sm text-left leading-relaxed">{blocks}</div>;
};
