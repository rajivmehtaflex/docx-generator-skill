# DocX Generator - Quick Reference Guide

## 🚀 Quick Start

### Browser Mode (Recommended)
```bash
cd docx-generator-skill
./start.sh
# Or: python -m http.server 8000
# Open http://localhost:8000
```

### Development Mode
```bash
./start.sh --dev
# Runs tests and starts server with full dependencies
```

### Test Mode
```bash
./start.sh --test
# Runs all tests without starting server
```

## 📝 Basic Usage

### In Browser
1. Open http://localhost:8000
2. Type Markdown or HTML in editor
3. Set document options (title, author, etc.)
4. Click "Generate DocX"
5. Click "Download DocX"

### Python Library
```python
from docx_generator import generate_docx_from_markdown

markdown_content = """
# My Document

**Bold text** and *italic text*

## List
- Item 1
- Item 2
"""

options = {
    "title": "My Document",
    "author": "Author Name",
    "header": "Header Text",
    "footer": "Footer Text",
    "page_number_format": "total"
}

docx_base64 = generate_docx_from_markdown(markdown_content, options)
```

## 🎨 Input Formats

### Markdown
```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold** and *italic* text

- Unordered list item
- Another item

1. Ordered list item
2. Another item

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |

[Link text](https://example.com)

---

Horizontal rule (becomes page break)
```

### HTML
```html
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>

<p><strong>Bold</strong> and <em>italic</em> text</p>

<ul>
    <li>Unordered list item</li>
    <li>Another item</li>
</ul>

<ol>
    <li>Ordered list item</li>
    <li>Another item</li>
</ol>

<table>
    <tr>
        <th>Header 1</th>
        <th>Header 2</th>
    </tr>
    <tr>
        <td>Cell 1</td>
        <td>Cell 2</td>
    </tr>
</table>

<hr /> <!-- Horizontal rule -->
```

## ⚙️ Configuration Options

```python
options = {
    # Document metadata
    "title": "Document Title",           # Document title
    "author": "Author Name",             # Document author

    # Header and footer
    "header": "Header Text",             # Header content
    "footer": "Footer Text",             # Footer content

    # Page numbering
    "page_number_format": "total",       # "none", "simple", "total"

    # Document features
    "add_toc": True,                     # Add table of contents
    "enable_page_breaks": True,          # Convert <hr> to page breaks

    # Advanced styling
    "header_alignment": "center",        # "left", "center", "right"
    "footer_alignment": "center",        # "left", "center", "right"
    "header_font_size": 10,              # Header font size
    "footer_font_size": 10               # Footer font size
}
```

## 🔧 Advanced Usage

### Custom Document Builder
```python
from docx_generator import DocxGenerator

# Create generator
generator = DocxGenerator()
generator.create_document(title="Custom Doc", author="Me")

# Add cover page
generator.add_cover_page(
    title="Annual Report",
    subtitle="2024 Summary",
    author="Finance Dept",
    date="2024-01-01"
)

# Add headers/footers
generator.add_header("Confidential", alignment="center")
generator.add_footer("Internal Use Only", alignment="center")
generator.add_page_numbers(format_type="total")

# Add content
html_content = "<h1>Summary</h1><p>Content here...</p>"
generator.process_html_content(html_content)

# Add table of contents
generator.add_table_of_contents()

# Get result
docx_base64 = generator.save_to_base64()
```

### Error Handling
```python
def safe_generate(content, options=None):
    try:
        docx_base64 = generate_docx_from_markdown(content, options)
        return {"success": True, "content": docx_base64}
    except Exception as e:
        return {"success": False, "error": str(e)}

result = safe_generate("# Test\nContent here...")
if result["success"]:
    print("Document generated!")
else:
    print(f"Error: {result['error']}")
```

## 🧪 Testing

```bash
# Run all tests
python3 test_docx_generator.py

# Or use the script
./start.sh --test
```

## 📁 Project Files

```
docx-generator-skill/
├── index.html              # Main web application
├── docx_generator.py       # Core Python library
├── test_docx_generator.py  # Test suite
├── start.sh               # Setup/launch script
├── requirements.txt       # Python dependencies
├── package.json           # Project metadata
├── SKILL.md              # Skill documentation
├── README.md             # Full documentation
├── EXAMPLES.md           # Code examples
└── QUICKSTART.md         # This file
```

## 🌐 Browser Requirements

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## ⚡ Performance Tips

1. **Initial Load**: 3-5 seconds (WASM initialization)
2. **Document Size**: Keep under 50 pages for best performance
3. **Complex Tables**: Simplify for faster generation
4. **Images**: Limit size and number for better performance

## 🐛 Common Issues

### WASM Won't Load
- **Issue**: "Loading Python packages..." stuck
- **Solution**: Use local server, not file:// protocol
- **Command**: `python -m http.server 8000`

### Memory Errors
- **Issue**: Browser crashes on large documents
- **Solution**: Split into smaller documents, reduce complexity
- **Limit**: ~50 pages recommended

### Formatting Issues
- **Issue**: Styles not applied correctly
- **Solution**: Use simpler HTML/Markdown, test incrementally
- **Check**: Validate HTML structure

### Download Fails
- **Issue**: "Download error" message
- **Solution**: Check browser popup settings, try different browser
- **Test**: Try generating smaller document first

## 🔒 Security Notes

- ✅ Runs entirely in browser
- ✅ No server required
- ✅ No data leaves browser
- ✅ Safe for sensitive documents
- ✅ No external API calls

## 📚 Additional Resources

- **Full Documentation**: See README.md
- **Code Examples**: See EXAMPLES.md
- **Skill Info**: See SKILL.md
- **python-docx**: https://python-docx.readthedocs.io/
- **PyScript**: https://pyscript.readthedocs.io/

## 🆘 Getting Help

1. Check this quick reference first
2. Review EXAMPLES.md for code samples
3. Read README.md for detailed documentation
4. Run tests to verify installation
5. Check browser console for errors

## 🎯 Best Practices

1. **Start Simple**: Test with basic content first
2. **Incremental**: Add features step by step
3. **Test Often**: Verify each change works
4. **Backup**: Save working versions
5. **Monitor**: Watch browser console for errors

---

**Need More Help?** Check the full README.md documentation!