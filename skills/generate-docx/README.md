# generate-docx — Agent Skill

> Convert Markdown or HTML to professional `.docx` Word documents. Built as a [agent-skills.io](https://agentskills.io) compatible skill for use with Codex and other AI agents.

## Install

```bash
cd skills/generate-docx
npm install
```

## Usage

### Markdown → DOCX

```bash
node generate-docx.js -i "# Hello World\n\nThis is **bold**." --title "Test" -o test.docx
```

### File → DOCX with full formatting

```bash
node generate-docx.js -f report.md \
  --title "Q4 Report" \
  --author "Finance Team" \
  --header "Confidential" \
  --footer "Internal Use Only" \
  --page-numbers total \
  --toc \
  -o report.docx
```

### Pipe via stdin

```bash
cat README.md | node generate-docx.js --stdin --title "README" -o readme.docx
```

### Base64 output (no file I/O)

```bash
node generate-docx.js -i "# Hello" --title "Test"
# Outputs base64-encoded docx to stdout
```

## Options

| Flag | Description |
|------|-------------|
| `-i, --input <text>` | Input content as string |
| `-f, --file <path>` | Read from file |
| `--stdin` | Read from stdin |
| `--title <text>` | Document title |
| `--author <text>` | Document author |
| `--header <text>` | Page header text |
| `--footer <text>` | Page footer text |
| `--page-numbers <type>` | `none`, `simple`, or `total` |
| `--toc` | Add table of contents |
| `--no-page-breaks` | Disable `<hr>` → page break |
| `--format <type>` | `markdown` (default) or `html` |
| `-o, --output <path>` | Output file (omit = base64 stdout) |

## Dependencies

- [docx](https://www.npmjs.com/package/docx) — Pure JS OOXML document builder
- [marked](https://www.npmjs.com/package/marked) — Markdown → HTML parser
- [cheerio](https://www.npmjs.com/package/cheerio) — HTML parser (jQuery-like API)

## License

MIT
