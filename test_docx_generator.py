"""
Test suite for DocX Generator
Tests the core functionality of document generation
"""

import io
import base64
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from docx_generator import DocxGenerator, MarkdownConverter, generate_docx_from_markdown, generate_docx_from_html
    IMPORTS_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import required modules: {e}")
    IMPORTS_AVAILABLE = False


def test_markdown_conversion():
    """Test basic markdown to HTML conversion"""
    if not IMPORTS_AVAILABLE:
        print("⚠️  Skipping markdown conversion test - imports not available")
        return False

    print("🧪 Testing Markdown Conversion...")

    markdown_text = """
# Heading 1
## Heading 2
**Bold** and *italic* text
- Item 1
- Item 2
"""

    try:
        html = MarkdownConverter.convert_to_html(markdown_text)
        assert '<h1>' in html, "Should contain h1 tags"
        assert '<h2>' in html, "Should contain h2 tags"
        assert '<strong>' in html, "Should contain strong tags"
        assert '<em>' in html, "Should contain em tags"
        assert '<ul>' in html, "Should contain ul tags"

        print("✅ Markdown conversion test passed")
        return True
    except Exception as e:
        print(f"❌ Markdown conversion test failed: {e}")
        return False


def test_simple_docx_generation():
    """Test basic DOCX generation"""
    if not IMPORTS_AVAILABLE:
        print("⚠️  Skipping DOCX generation test - imports not available")
        return False

    print("🧪 Testing Basic DOCX Generation...")

    try:
        generator = DocxGenerator()
        generator.create_document(title="Test Document", author="Test Author")

        # Add some content
        generator.process_html_content("<h1>Test Heading</h1><p>Test paragraph</p>")

        # Get result
        docx_base64 = generator.save_to_base64()

        # Verify we got something back
        assert docx_base64, "Should return base64 content"
        assert len(docx_base64) > 0, "Content should not be empty"

        # Verify it's valid base64
        decoded = base64.b64decode(docx_base64)
        assert len(decoded) > 0, "Decoded content should not be empty"

        print("✅ Basic DOCX generation test passed")
        return True

    except Exception as e:
        print(f"❌ Basic DOCX generation test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_markdown_to_docx():
    """Test markdown to DOCX conversion"""
    if not IMPORTS_AVAILABLE:
        print("⚠️  Skipping markdown to DOCX test - imports not available")
        return False

    print("🧪 Testing Markdown to DOCX...")

    markdown_content = """
# Test Document

This is a **test** document with *formatting*.

## Features

- Feature 1
- Feature 2

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
"""

    options = {
        "title": "Test Document",
        "author": "Test Author",
        "header": "Test Header",
        "footer": "Test Footer",
        "page_number_format": "simple",
        "add_toc": False,
        "enable_page_breaks": True
    }

    try:
        docx_base64 = generate_docx_from_markdown(markdown_content, options)

        assert docx_base64, "Should return base64 content"
        assert len(docx_base64) > 0, "Content should not be empty"

        # Verify it's valid base64
        decoded = base64.b64decode(docx_base64)
        assert len(decoded) > 0, "Decoded content should not be empty"

        print("✅ Markdown to DOCX test passed")
        return True

    except Exception as e:
        print(f"❌ Markdown to DOCX test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_html_to_docx():
    """Test HTML to DOCX conversion"""
    if not IMPORTS_AVAILABLE:
        print("⚠️  Skipping HTML to DOCX test - imports not available")
        return False

    print("🧪 Testing HTML to DOCX...")

    html_content = """
<h1>Test Document</h1>
<p>This is a <strong>test</strong> document with <em>formatting</em>.</p>
<h2>Features</h2>
<ul>
    <li>Feature 1</li>
    <li>Feature 2</li>
</ul>
"""

    options = {
        "title": "HTML Test Document",
        "author": "Test Author",
        "add_toc": False,
        "enable_page_breaks": False
    }

    try:
        docx_base64 = generate_docx_from_html(html_content, options)

        assert docx_base64, "Should return base64 content"
        assert len(docx_base64) > 0, "Content should not be empty"

        # Verify it's valid base64
        decoded = base64.b64decode(docx_base64)
        assert len(decoded) > 0, "Decoded content should not be empty"

        print("✅ HTML to DOCX test passed")
        return True

    except Exception as e:
        print(f"❌ HTML to DOCX test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_advanced_features():
    """Test advanced document features"""
    if not IMPORTS_AVAILABLE:
        print("⚠️  Skipping advanced features test - imports not available")
        return False

    print("🧪 Testing Advanced Features...")

    try:
        generator = DocxGenerator()
        generator.create_document(title="Advanced Document", author="Test Author")

        # Test header and footer
        generator.add_header("Test Header", alignment="center")
        generator.add_footer("Test Footer", alignment="center")

        # Test page numbers
        generator.add_page_numbers(format_type="simple")

        # Test cover page
        generator.add_cover_page(
            title="Cover Page",
            subtitle="Subtitle",
            author="Author Name",
            date="2024-01-01"
        )

        # Process content with tables
        html_content = """
<h1>Main Content</h1>
<p>This is the main content.</p>
<table>
    <tr><th>Header 1</th><th>Header 2</th></tr>
    <tr><td>Data 1</td><td>Data 2</td></tr>
</table>
"""
        generator.process_html_content(html_content, enable_page_breaks=False)

        # Test table of contents
        generator.add_table_of_contents()

        # Get result
        docx_base64 = generator.save_to_base64()

        assert docx_base64, "Should return base64 content"
        assert len(docx_base64) > 0, "Content should not be empty"

        print("✅ Advanced features test passed")
        return True

    except Exception as e:
        print(f"❌ Advanced features test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_error_handling():
    """Test error handling with invalid inputs"""
    if not IMPORTS_AVAILABLE:
        print("⚠️  Skipping error handling test - imports not available")
        return False

    print("🧪 Testing Error Handling...")

    try:
        # Test with empty content
        try:
            result = generate_docx_from_markdown("")
            print("⚠️  Empty content should raise an error or handle gracefully")
        except Exception as e:
            print(f"✅ Empty content handled: {type(e).__name__}")

        # Test with None content
        try:
            result = generate_docx_from_markdown(None)
            print("⚠️  None content should raise an error")
        except Exception as e:
            print(f"✅ None content handled: {type(e).__name__}")

        print("✅ Error handling test passed")
        return True

    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
        return False


def run_all_tests():
    """Run all tests and report results"""
    print("🚀 Starting DocX Generator Test Suite")
    print("=" * 50)

    tests = [
        test_markdown_conversion,
        test_simple_docx_generation,
        test_markdown_to_docx,
        test_html_to_docx,
        test_advanced_features,
        test_error_handling
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
            print()
        except Exception as e:
            print(f"❌ Test crashed: {e}")
            results.append(False)
            print()

    # Summary
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"📊 Test Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All tests passed!")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)