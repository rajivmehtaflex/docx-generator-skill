# DocX Generator Skill

## Description
Browser-based Word document generator that converts HTML/Markdown to .docx files using Python-WASM (PyScript). Designed as an agentic skill for Codex integration with complex layout support including headers, footers, and page breaks.

## Prerequisites
- Python 3.8+ for development
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server for testing

## Installation
```bash
# Install development dependencies
pip install pyscript markdown2 beautifulsoup4 python-docx

# Or for production PyScript deployment
# No installation needed - runs entirely in browser
```

## Usage

### Development Mode
```bash
cd docx-generator-skill
python -m http.server 8000
# Open http://localhost:8000 in browser
```

### As Codex Skill
The skill integrates with Codex for agentic document generation workflows.

## Input Format
Accepts HTML or Markdown content with support for:
- Headings (h1-h6)
- Text formatting (bold, italic, underline)
- Lists (ordered, unordered)
- Tables
- Images
- Page breaks
- Custom headers and footers

## Output Format
Generates Microsoft Word .docx files with:
- Complex layouts and styling
- Custom headers and footers
- Page breaks and sections
- Table formatting
- Image embedding
- Document metadata

## Features
- Pure browser-based execution (no server required)
- Real-time document preview
- Custom styling templates
- Batch processing support
- Download as .docx file
- Codex agent integration

## Limitations
- Browser memory constraints for very large documents
- Limited python-docx feature set in WASM environment
- No direct file system access
- Dependent on browser JavaScript capabilities

## Performance Considerations
- Initial WASM load time: ~3-5 seconds
- Generation speed: ~1-2 pages per second
- Memory usage: ~50-100MB for typical documents
- Recommended max document size: ~50 pages

## Troubleshooting
- **WASM loading fails**: Check browser console for CORS issues
- **Memory errors**: Reduce document complexity or size
- **Style issues**: Ensure CSS is compatible with python-docx
- **Download fails**: Check browser popup settings

## Advanced Usage
See `examples/` directory for:
- Template-based generation
- Custom styling
- Batch processing
- Codex integration patterns