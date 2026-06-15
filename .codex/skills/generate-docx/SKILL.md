---
name: "generate-docx"
description: "Generate professional Word (.docx) documents from Markdown or HTML content. Use when creating Word documents, converting markdown to docx, generating reports, building document templates, or exporting content to Microsoft Word format — even if the user doesn't explicitly say 'docx' or 'Word'. Supports headings, paragraphs, bold/italic/code, tables, bullet/numbered lists, blockquotes, page breaks, headers, footers, page numbers, and table of contents."
---

# Generate DOCX Skill

Convert Markdown or HTML into professional `.docx` Word documents via a Node.js CLI.

## Prerequisites

Dependencies must be installed once:

```bash
cd "$CODEX_HOME/skills/generate-docx/scripts"
npm install
```

Requires Node.js 16+.

## Quick Reference

### From a Markdown string

```bash
node "$CODEX_HOME/skills/generate-docx/scripts/generate-docx.js" \
  -i "# Project Report\n\nThis is **bold** and *italic*." \
  --title "Project Report" \
  --author "AI Agent" \
  -o report.docx
```

### From a file

```bash
node "$CODEX_HOME/skills/generate-docx/scripts/generate-docx.js" \
  -f input.md \
  --title "Documentation" \
  --header "Confidential" \
  --footer "Internal Use Only" \
  --page-numbers total \
  --toc \
  -o documentation.docx
```

### Via stdin

```bash
cat README.md | node "$CODEX_HOME/skills/generate-docx/scripts/generate-docx.js" --stdin --title "README" -o readme.docx
```

### HTML input (skip markdown conversion)

```bash
node "$CODEX_HOME/skills/generate-docx/scripts/generate-docx.js" \
  -f page.html --format html --author "Generator" -o output.docx
```

### Base64 output (no file I/O)

```bash
node "$CODEX_HOME/skills/generate-docx/scripts/generate-docx.js" -i "# Hello" --title "Test"
# Outputs base64-encoded docx to stdout
```

## CLI Options

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `-i`, `--input` | `<text>` | — | Markdown or HTML content as a string |
| `-f`, `--file` | `<path>` | — | Read content from a file |
| `--stdin` | flag | — | Read content from stdin |
| `--title` | `<text>` | `Untitled Document` | Document title metadata |
| `--author` | `<text>` | `Unknown` | Document author metadata |
| `--header` | `<text>` | — | Header text on every page |
| `--footer` | `<text>` | — | Footer text on every page |
| `--page-numbers` | `none\|simple\|total` | `none` | Page numbering style |
| `--toc` | flag | off | Add a Table of Contents page |
| `--no-page-breaks` | flag | off | Disable page breaks for `<hr>` |
| `--format` | `markdown\|html` | `markdown` | Input format |
| `-o`, `--output` | `<path>` | stdout base64 | Save `.docx` to file |

## Supported Elements

| Element | Markdown | DOCX Result |
|---------|----------|-------------|
| Heading 1-4 | `# H1` ... `#### H4` | Heading styles (TOC-compatible) |
| Paragraph | plain text | Paragraph with spacing |
| Bold | `**text**` | Bold TextRun |
| Italic | `*text*` | Italic TextRun |
| Inline code | `` `code` `` | Monospace + shaded |
| Bullet list | `- item` | Bulleted paragraphs |
| Numbered list | `1. item` | Numbered paragraphs |
| Table | GFM table syntax | Styled table with header row |
| Code block | ` ```code``` ` | Monospace lines with shading |
| Blockquote | `> quote` | Indented italic paragraph |
| Page break | `---` (hr) | PageBreak |
| Table of Contents | `--toc` flag | TOC field + page break |
