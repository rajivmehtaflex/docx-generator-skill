#!/usr/bin/env node

/**
 * generate-docx.js — Agent Skill CLI
 *
 * Converts Markdown or HTML content into a professional .docx file.
 * Compatible with agent-skills.io spec for use with Codex and other AI agents.
 *
 * Usage:
 *   generate-docx -i "# Hello" --title "Doc" -o output.docx
 *   cat report.md | generate-docx --stdin --header "Confidential" -o report.docx
 *   generate-docx -f input.html --author "AI" --page-numbers total --toc
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const cheerio = require('cheerio');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    Header,
    Footer,
    PageNumber,
    TableOfContents,
    StyleLevel,
    PageBreak,
    BorderStyle,
    ShadingType,
} = require('docx');

// ─── CLI Argument Parser ──────────────────────────────────────────────────

function parseArgs(argv) {
    const args = {
        input: null,
        file: null,
        stdin: false,
        title: 'Untitled Document',
        author: 'Unknown',
        header: null,
        footer: null,
        pageNumbers: 'none',       // none | simple | total
        toc: false,
        pageBreaks: true,
        output: null,              // null = stdout base64
        format: 'markdown',        // markdown | html
        help: false,
    };

    const raw = argv.slice(2);

    for (let i = 0; i < raw.length; i++) {
        switch (raw[i]) {
            case '-i':
            case '--input':
                args.input = raw[++i];
                break;
            case '-f':
            case '--file':
                args.file = raw[++i];
                break;
            case '--stdin':
                args.stdin = true;
                break;
            case '--title':
                args.title = raw[++i];
                break;
            case '--author':
                args.author = raw[++i];
                break;
            case '--header':
                args.header = raw[++i];
                break;
            case '--footer':
                args.footer = raw[++i];
                break;
            case '--page-numbers':
                args.pageNumbers = raw[++i];
                break;
            case '--toc':
                args.toc = true;
                break;
            case '--no-page-breaks':
                args.pageBreaks = false;
                break;
            case '-o':
            case '--output':
                args.output = raw[++i];
                break;
            case '--format':
                args.format = raw[++i];
                break;
            case '-h':
            case '--help':
                args.help = true;
                break;
            default:
                if (raw[i].startsWith('--') && i + 1 < raw.length && !raw[i + 1].startsWith('-')) {
                    args[raw[i].slice(2)] = raw[++i];
                }
        }
    }

    return args;
}

function showHelp() {
    console.log(`
generate-docx — Convert Markdown/HTML to professional Word documents

USAGE:
  generate-docx [options]

INPUT (one required):
  -i, --input <text>      Markdown or HTML content as a string
  -f, --file <path>       Read content from a file
  --stdin                 Read content from stdin

OPTIONS:
  --title <text>          Document title (default: "Untitled Document")
  --author <text>         Document author (default: "Unknown")
  --header <text>         Header text on every page
  --footer <text>         Footer text on every page
  --page-numbers <type>   Page numbering: none | simple | total (default: none)
  --toc                   Add a Table of Contents page
  --no-page-breaks        Disable page breaks for <hr> elements
  --format <type>         Input format: markdown | html (default: markdown)
  -o, --output <path>     Save .docx to file (omit for base64 stdout)

EXAMPLES:
  # Basic markdown to docx
  generate-docx -i "# Hello World\\n\\nThis is a test." -o hello.docx

  # Markdown from file with headers and footers
  generate-docx -f report.md --title "Q4 Report" --header "Confidential" --footer "Internal" -o report.docx

  # Via stdin (pipe)
  cat report.md | generate-docx --stdin --page-numbers total --toc -o report.docx

  # HTML input with table of contents
  generate-docx -f input.html --format html --author "AI Agent" --toc -o output.docx

  # Base64 output (for programmatic use)
  generate-docx -i "# Quick Doc" --title "Test"
`);
}

// ─── Markdown → HTML ──────────────────────────────────────────────────────

function markdownToHtml(markdownText) {
    marked.setOptions({
        gfm: true,
        breaks: false,
    });
    return marked.parse(markdownText);
}

// ─── HTML → docx Elements ─────────────────────────────────────────────────

function parseInlineRuns(text) {
    /**
     * Parse a text string for bold (**text**), italic (*text*),
     * and inline code (`text`) markers and return TextRun[] array.
     */
    const runs = [];
    // Regex: **bold** | *italic* | `code`
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Plain text before the match
        if (match.index > lastIndex) {
            runs.push(new TextRun({ text: text.slice(lastIndex, match.index) }));
        }

        if (match[2] !== undefined) {
            // Bold
            runs.push(new TextRun({ text: match[2], bold: true }));
        } else if (match[3] !== undefined) {
            // Italic
            runs.push(new TextRun({ text: match[3], italics: true }));
        } else if (match[4] !== undefined) {
            // Inline code
            runs.push(new TextRun({ text: match[4], font: 'Courier New', shading: { type: ShadingType.SOLID, color: 'auto', fill: 'EEEEEE' } }));
        }

        lastIndex = regex.lastIndex;
    }

    // Remaining plain text
    if (lastIndex < text.length) {
        runs.push(new TextRun({ text: text.slice(lastIndex) }));
    }

    return runs.length > 0 ? runs : [new TextRun({ text })];
}

function processTable($, tableEl) {
    const rows = [];
    let isHeader = false;

    $(tableEl)
        .find('tr')
        .each((_, tr) => {
            const cells = [];
            const cellEls = $(tr).find('th, td');

            // Check if this row has <th> elements (header row)
            const hasTh = $(tr).find('th').length > 0;
            if (hasTh) isHeader = true;

            cellEls.each((_, cell) => {
                const text = $(cell).text().trim();
                const cellOpts = {
                    children: [new Paragraph({ children: parseInlineRuns(text) })],
                    width: { size: Math.floor(100 / cellEls.length), type: WidthType.PERCENTAGE },
                };

                if (hasTh || (isHeader && rows.length === 0)) {
                    cellOpts.shading = { type: ShadingType.SOLID, color: 'auto', fill: '4472C4' };
                    cellOpts.children = [
                        new Paragraph({
                            children: parseInlineRuns(text).map(
                                (r) =>
                                    new TextRun({
                                        ...r.options,
                                        bold: true,
                                        color: 'FFFFFF',
                                    })
                            ),
                        }),
                    ];
                }

                cells.push(new TableCell(cellOpts));
            });

            if (cells.length > 0) {
                rows.push(new TableRow({ children: cells, tableHeader: hasTh }));
            }
        });

    if (rows.length === 0) return null;

    return new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
    });
}

function htmlToDocxElements(htmlContent, options) {
    const $ = cheerio.load(htmlContent);
    const elements = [];

    // Iterate over top-level children of <body>
    $('body')
        .children()
        .each((_, el) => {
            const $el = $(el);
            const tag = el.tagName;

            switch (tag) {
                case 'h1':
                    elements.push(
                        new Paragraph({
                            text: $el.text(),
                            heading: HeadingLevel.HEADING_1,
                            spacing: { before: 240, after: 120 },
                        })
                    );
                    break;

                case 'h2':
                    elements.push(
                        new Paragraph({
                            text: $el.text(),
                            heading: HeadingLevel.HEADING_2,
                            spacing: { before: 200, after: 100 },
                        })
                    );
                    break;

                case 'h3':
                    elements.push(
                        new Paragraph({
                            text: $el.text(),
                            heading: HeadingLevel.HEADING_3,
                            spacing: { before: 160, after: 80 },
                        })
                    );
                    break;

                case 'h4':
                    elements.push(
                        new Paragraph({
                            text: $el.text(),
                            heading: HeadingLevel.HEADING_4,
                            spacing: { before: 120, after: 60 },
                        })
                    );
                    break;

                case 'p':
                    elements.push(
                        new Paragraph({
                            children: parseInlineRuns($el.text()),
                            spacing: { after: 120 },
                        })
                    );
                    break;

                case 'ul':
                    $el.find('li').each((_, li) => {
                        elements.push(
                            new Paragraph({
                                children: parseInlineRuns($(li).text()),
                                bullet: { level: 0 },
                                spacing: { after: 40 },
                            })
                        );
                    });
                    break;

                case 'ol':
                    $el.find('li').each((_, li) => {
                        elements.push(
                            new Paragraph({
                                children: parseInlineRuns($(li).text()),
                                numbering: { reference: 'default-numbering', level: 0 },
                                spacing: { after: 40 },
                            })
                        );
                    });
                    break;

                case 'table': {
                    const table = processTable($, el);
                    if (table) elements.push(table);
                    break;
                }

                case 'hr':
                    if (options.pageBreaks) {
                        elements.push(new Paragraph({ children: [new PageBreak()] }));
                    }
                    break;

                case 'pre':
                case 'code': {
                    const codeText = $el.text();
                    codeText.split('\n').forEach((line) => {
                        elements.push(
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: line || ' ',
                                        font: 'Courier New',
                                        size: 20,
                                        shading: { type: ShadingType.SOLID, color: 'auto', fill: 'F5F5F5' },
                                    }),
                                ],
                                spacing: { after: 0 },
                            })
                        );
                    });
                    break;
                }

                case 'blockquote': {
                    const quoteText = $el.text();
                    elements.push(
                        new Paragraph({
                            children: parseInlineRuns(quoteText).map(
                                (r) => new TextRun({ ...r.options, italics: true, color: '666666' })
                            ),
                            indent: { left: 720 },
                            spacing: { before: 120, after: 120 },
                        })
                    );
                    break;
                }

                default:
                    // Unknown tags: extract text and add as paragraph
                    if ($el.text().trim()) {
                        elements.push(
                            new Paragraph({
                                children: parseInlineRuns($el.text()),
                            })
                        );
                    }
            }
        });

    return elements;
}

// ─── Build Document ──────────────────────────────────────────────────────

async function buildDocument(content, options) {
    // Convert markdown to HTML if needed
    let htmlContent;
    if (options.format === 'markdown') {
        htmlContent = markdownToHtml(content);
    } else {
        htmlContent = content;
    }

    // Parse HTML into docx elements
    const bodyElements = htmlToDocxElements(htmlContent, options);

    // Build header
    const headerChildren = [];
    if (options.header) {
        headerChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: options.header,
                        size: 20,
                        color: '424242',
                    }),
                ],
            })
        );
    }

    // Build footer
    const footerChildren = [];
    if (options.footer) {
        footerChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({
                        text: options.footer,
                        size: 20,
                        color: '424242',
                    }),
                ],
            })
        );
    }

    // Page numbers
    if (options.pageNumbers === 'simple') {
        footerChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: 'Page ', size: 18, color: '424242' }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '424242' }),
                ],
            })
        );
    } else if (options.pageNumbers === 'total') {
        footerChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: 'Page ', size: 18, color: '424242' }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 18, color: '424242' }),
                    new TextRun({ text: ' of ', size: 18, color: '424242' }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: '424242' }),
                ],
            })
        );
    }

    // Table of Contents
    const finalElements = [];
    if (options.toc) {
        finalElements.push(
            new Paragraph({
                text: 'Table of Contents',
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 240 },
            })
        );
        finalElements.push(new TableOfContents('Contents', { hyperlink: true, headingStyleRange: '1-3' }));
        finalElements.push(new Paragraph({ children: [new PageBreak()] }));
    }
    finalElements.push(...bodyElements);

    // Create Document
    const doc = new Document({
        creator: options.author,
        title: options.title,
        description: options.title,
        sections: [
            {
                properties: {
                    page: {
                        margin: {
                            top: 1440,
                            right: 1440,
                            bottom: 1440,
                            left: 1440,
                        },
                    },
                },
                headers: headerChildren.length > 0 ? { default: new Header({ children: headerChildren }) } : undefined,
                footers: footerChildren.length > 0 ? { default: new Footer({ children: footerChildren }) } : undefined,
                children: finalElements,
            },
        ],
        numbering: {
            config: [
                {
                    reference: 'default-numbering',
                    levels: [
                        {
                            level: 0,
                            format: 'decimal',
                            text: '%1.',
                            alignment: AlignmentType.START,
                            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                        },
                    ],
                },
            ],
        },
    });

    return doc;
}

// ─── Main Entry Point ─────────────────────────────────────────────────────

async function main() {
    const args = parseArgs(process.argv);

    if (args.help) {
        showHelp();
        process.exit(0);
    }

    // Resolve input content
    let content = null;

    if (args.stdin) {
        content = await new Promise((resolve) => {
            let data = '';
            process.stdin.setEncoding('utf-8');
            process.stdin.on('data', (chunk) => (data += chunk));
            process.stdin.on('end', () => resolve(data));
            // Timeout after 30s if no stdin
            setTimeout(() => {
                if (!data) {
                    console.error('Error: No input received on stdin after 30s');
                    process.exit(1);
                }
            }, 30000);
        });
    } else if (args.file) {
        if (!fs.existsSync(args.file)) {
            console.error(`Error: File not found: ${args.file}`);
            process.exit(1);
        }
        content = fs.readFileSync(args.file, 'utf-8');
    } else if (args.input) {
        content = args.input;
    } else {
        console.error('Error: No input provided. Use -i <text>, -f <file>, or --stdin');
        showHelp();
        process.exit(1);
    }

    if (!content || !content.trim()) {
        console.error('Error: Content is empty');
        process.exit(1);
    }

    // Build document
    try {
        const doc = await buildDocument(content, args);

        // Pack to buffer
        const buffer = await Packer.toBuffer(doc);

        if (args.output) {
            // Write to file
            const outputPath = path.resolve(args.output);
            fs.writeFileSync(outputPath, buffer);
            console.error(`✅ DOCX generated: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
        } else {
            // Output base64 to stdout (for programmatic / Codex use)
            process.stdout.write(buffer.toString('base64'));
        }
    } catch (err) {
        console.error(`Error generating DOCX: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    }
}

main();
