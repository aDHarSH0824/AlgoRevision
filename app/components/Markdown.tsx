import React from "react";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null;

  // Split by double line breaks to get logical paragraphs / blocks
  const blocks = content.split(/\n\n+/);

  // Simple parser for **bold** and `code` inline elements
  const parseInlineStyles = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    let lastIndex = 0;
    let idx = 0;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      const matchStr = match[0];

      // Push preceding text
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={idx++}>
            {text.substring(lastIndex, matchIndex)}
          </span>
        );
      }

      if (matchStr.startsWith("**")) {
        parts.push(
          <strong key={idx++} className="font-bold text-body-strong">
            {matchStr.substring(2, matchStr.length - 2)}
          </strong>
        );
      } else {
        parts.push(
          <code key={idx++} className="font-mono bg-surface-soft px-1.5 py-0.5 rounded text-primary font-semibold text-[11px]">
            {matchStr.substring(1, matchStr.length - 1)}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={idx++}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="flex flex-col gap-3 text-left w-full">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code block check
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          // Remove start code mark and end code mark if they exist
          const codeLines = lines.slice(
            1, 
            lines[lines.length - 1].trim() === "```" ? lines.length - 1 : lines.length
          );
          return (
            <pre key={bIdx} className="font-mono bg-surface-dark text-on-dark p-4 rounded-lg my-2 overflow-x-auto text-[11px] leading-relaxed border border-surface-dark-elevated shadow-inner w-full">
              <code>{codeLines.join("\n")}</code>
            </pre>
          );
        }

        // List item check (lines starting with * or -)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.includes("\n* ") || trimmed.includes("\n- ")) {
          const lines = trimmed.split("\n");
          return (
            <ul key={bIdx} className="list-disc pl-5 my-1 flex flex-col gap-1.5 text-xs text-body">
              {lines.map((line, lIdx) => {
                const cleanLine = line.replace(/^[\*\-\s]+/, "").trim();
                if (!cleanLine) return null;
                return <li key={lIdx}>{parseInlineStyles(cleanLine)}</li>;
              })}
            </ul>
          );
        }

        // Header check
        if (trimmed.startsWith("#")) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const headerText = match[2];
            const classes = 
              level === 1 ? "text-lg font-bold text-ink mt-3 mb-1" :
              level === 2 ? "text-base font-bold text-ink mt-2.5 mb-1" :
              "text-xs font-semibold text-body-strong mt-2 mb-0.5";
            const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
            return <Tag key={bIdx} className={classes}>{parseInlineStyles(headerText)}</Tag>;
          }
        }

        // Paragraph check (lines joined inline to prevent vertical stacking columns)
        const lines = trimmed.split("\n");
        return (
          <p key={bIdx} className="text-xs leading-relaxed text-body text-justify my-0.5">
            {lines.map((line, lIdx) => (
              <span key={lIdx} className="inline mr-1">
                {parseInlineStyles(line.trim())}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
