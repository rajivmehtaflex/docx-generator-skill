---
name: generate-docx
description: >-
  Generates professional Word (.docx) documents from Markdown or HTML content
  with support for headers, footers, page numbers, tables, lists, code blocks,
  blockquotes, and table of contents. Use when creating Word documents,
  converting markdown to docx, generating reports, building document templates,
  or exporting content to Microsoft Word format — even if the user doesn't
  explicitly say "docx" or "Word".
license: MIT
compatibility: >-
  Requires Node.js 16+ and npm. Dependencies (docx, marked, cheerio) must be
  installed via `npm install` in the skill directory. No Python or system
  packages required.
metadata:
  author: rajivmehtaflex
  version: "1.0.0"
  repository: https://github.com/rajivmehtaflex/docx-generator-skill
---

# generate-docx

Converts Markdown or HTML into professionally formatted `.docx` Word documents via a Node.js CLI script.

## Setup

Before first use, install dependencies:

```bash
cd skills/generate-docx
npm install
```

## Quick Reference

### From a Markdown string

```bash
node generate-docx.js \
  -i "# Project Report\n\nThis is **bold** and *italic*." \
  --title "Project Report" \
  --author "AI Agent" \
  -o report.docx
```

### From a file

```bash
node generate-docx.js \
  -f input.md \
  --title "Documentation" \
  --header "Confidential" \
  --footer "Internal Use Only" \
  --page-numbers total \
  --toc \
  -o documentation.docx
```

### Via stdin (pipe from another command)

```bash
cat README.md | node generate-docx.js --stdin --title "README" -o readme.docx
```

### HTML input (skip markdown conversion)

```bash
node generate-docx.js \
  -f page.html \
  --format html \
  --author "Generator" \
  -o output.docx
```

### Base64 output (for programmatic use without file I/O)

```bash
node generate-docx.js -i "# Hello" --title "Test"
# → outputs base64-encoded docx to stdout
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

## Supported Markdown/HTML Elements

| Element | Markdown | HTML | DOCX Result |
|---------|----------|------|-------------|
| Heading 1-4 | `# H1` ... `#### H4` | `<h1>` ... `<h4>` | Heading styles (mapped to TOC) |
| Paragraph | plain text | `<p>` | Paragraph with spacing |
| Bold | `**text**` | — | Bold TextRun |
| Italic | `*text*` | — | Italic TextRun |
| Inline code | `` `code` `` | — | Monospace + shaded |
| Bullet list | `- item` | `<ul><li>` | Bulleted paragraphs |
| Numbered list | `1. item` | `<ol><li>` | Numbered paragraphs |
| Table | GFM table syntax | `<table>` | Styled table with header row |
| Code block | ` ```code``` ` | `<pre>` | Monospace lines with shading |
| Blockquote | `> quote` | `<blockquote>` | Indented italic paragraph |
| Page break | `---` (hr) | `<hr>` | PageBreak |
| Table of Contents | `--toc` flag | — | TOC field + page break |

## Files

```
skills/generate-docx/
├── SKILL.md           ← This file (agent skill definition)
├── generate-docx.js   ← Node.js CLI script (main entry point)
├── package.json       ← Dependencies and metadata
├── README.md          ← Human-readable documentation
└── node_modules/      ← Installed dependencies (after npm install)
```

## How It Works

```
Input (Markdown/HTML)
    │
    ├── marked ──────► HTML (if markdown input)
    │
    ├── cheerio ─────► Parse HTML elements
    │
    ├── docx (npm) ──► Build OOXML document
    │                   ├── Headers / Footers
    │                   ├── Page numbers
    │                   ├── Headings / Paragraphs
    │                   ├── Tables / Lists
    │                   ├── Code blocks / Blockquotes
    │                   └── Table of Contents
    │
    └── Output ──────► .docx file OR base64 string
```
