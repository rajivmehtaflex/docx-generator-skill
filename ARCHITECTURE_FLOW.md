╔═══════════════════════════════════════════════════════════════════════════════════════════════════╗
║                      DOCX GENERATOR — COMPLETE ARCHITECTURE, DATA FLOW & FILE MAP                ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════╝


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                        MODE 1: BROWSER-WASM (PyScript via index.html)                          ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                              │
 │  [index.html] lines 1-8                                                                      │
 │  ╔══════════════════════════════════════════╗                                                 │
 │  ║  <html> → <head> → <link> + <script>    ║  ◄── Loads PyScript from CDN                    │
 │  ║  Loads PyScript 2024.1.1 core.css/core.js║                                                 │
 │  ╚══════════════════════════════════════════╝                                                 │
 │          │                                                                                    │
 │          ▼                                                                                    │
 │  [index.html] lines 9-12                                                                      │
 │  ╔══════════════════════════════════════════╗                                                 │
 │  ║  <py-config>                             ║  ◄── Tells Pyodide to pre-load these packages   │
 │  ║    packages = [                          ║                                                 │
 │  ║      "python-docx",                      ║  ◄── /app/lib/python-docx (install from PyPI)  │
 │  ║      "markdown2",                        ║  ◄── /app/lib/markdown2                        │
 │  ║      "beautifulsoup4"                    ║  ◄── /app/lib/bs4                              │
 │  ║    ]                                      ║                                                 │
 │  ║  </py-config>                            ║                                                 │
 │  ╚══════════════════════════════════════════╝                                                 │
 │          │                                                                                    │
 │          ▼                                                                                    │
 │  [index.html] lines 14-44 (JS failsafe)                                                       │
 │  ╔══════════════════════════════════════════╗                                                 │
 │  ║  <script> (JavaScript)                   ║                                                 │
 │  ║    setTimeout() at 15s → show "still     ║  ◄── Error recovery if PyScript fails to load  │
 │  ║    loading..." message                   ║                                                 │
 │  ║    setTimeout() at 60s → show error      ║                                                 │
 │  ║    panel + "Refresh Page" button         ║                                                 │
 │  ╚══════════════════════════════════════════╝                                                 │
 │                                                                                              │
 │  ═══════════════════════════════════════════════════════════════════════════════════════════  │
 │                                                                                              │
 │  ① User types Markdown or HTML                                                              │
 │     ┌───────────────────────────────────────────────┐                                        │
 │     │  [index.html]                                 │                                        │
 │     │  <textarea id="editor">                       │                                        │
 │     │    "# Welcome to DocX Generator..."            │                                        │
 │     │  </textarea>                                  │                                        │
 │     └──────────────────────┬────────────────────────┘                                        │
 │                            │                                                                 │
 │                            ▼                                                                 │
 │  ② JS event listener fires on input                                                         │
 │     [index.html] lines 673-680                                                                │
 │     ┌───────────────────────────────────────────────────────┐                                │
 │     │  document.getElementById('editor')                    │                                │
 │     │    .addEventListener('input', function(e) {           │                                │
 │     │      if (window.js_update_preview) {                  │                                │
 │     │        window.js_update_preview();                    │   ◄── JS calls Python via       │
 │     │      }                                                 │        window bridge           │
 │     │    })                                                  │                                │
 │     └──────────────────────────┬────────────────────────────┘                                │
 │                                │                                                              │
 │                                ▼                                                              │
 │  ③ Python function executes in Pyodide WASM sandbox                                         │
 │     [index.html] <script type="py"> lines 760-790                                            │
 │     ┌────────────────────────────────────────────────────────────────────────────────────┐   │
 │     │  Pyodide (Python 3.12 compiled to WebAssembly via Emscripten)                     │   │
 │     │  ┌────────────────────────────────────────────────────────────────────────────┐   │   │
 │     │  │  def update_preview():                                                     │   │   │
 │     │  │    content = editor.value                   ← reads textarea               │   │   │
 │     │  │    format = format_select.value             ← "markdown" or "html"         │   │   │
 │     │  │                                                                             │   │   │
 │     │  │    if format == "markdown":                                                │   │   │
 │     │  │      import markdown2                    [FILE: markdown2 lib]             │   │   │
 │     │  │      html = markdown2.markdown(content)   ◄── MD → HTML                    │   │   │
 │     │  │    else:                                                                   │   │   │
 │     │  │      html = content                       ◄── raw HTML passthrough         │   │   │
 │     │  │                                                                             │   │   │
 │     │  │    preview.innerHTML = html               ◄── updates DOM live             │   │   │
 │     │  └────────────────────────────────────────────────────────────────────────────┘   │   │
 │     └────────────────────────────────────────────────────────────────────────────────────┘   │
 │                                                                                              │
 │  ═══════════════════════════════════════════════════════════════════════════════════════════  │
 │                                                                                              │
 │  ④ User clicks "⚡ Generate DocX"                                                          │
 │     [index.html] lines 637-650 (JS event)                                                    │
 │     ┌───────────────────────────────────────────────────────────────────────┐               │
 │     │  btn.disabled = true;                                                │               │
 │     │  btn.innerHTML = '<span>⏳ Generating...</span>';                    │               │
 │     │  status.textContent = 'Generating DOCX...';                          │               │
 │     │  window.js_generate_docx();    ◄── calls Python async function       │               │
 │     │  setTimeout(function() {   ...   }, 30000);  ◄── safety timeout     │               │
 │     └──────────────────────────────────┬────────────────────────────────────┘               │
 │                                        │                                                     │
 │                                        ▼                                                     │
 │  ⑤ python-docx generates .docx in memory (async def generate_docx)                          │
 │     [index.html] <script type="py"> lines ~793-900                                           │
 │     ┌────────────────────────────────────────────────────────────────────────────────────┐   │
 │     │  async def generate_docx():                                                        │   │
 │     │    # Layer 3: lazy package install fallback                                        │   │
 │     │    try: from docx import Document                                                  │   │
 │     │    except ImportError:                                                             │   │
 │     │      import micropip                                                               │   │
 │     │      await micropip.install(["python-docx",...])  ◄── downloads .whl from PyPI     │   │
 │     │                                                                                     │   │
 │     │    # Read current editor content                                                   │   │
 │     │    content = editor.value                                                           │   │
 │     │    options = {                                                                      │   │
 │     │      "title": doc-title.value,        [FILE: <input id="doc-title">]               │   │
 │     │      "author": doc-author.value,      [FILE: <input id="doc-author">]               │   │
 │     │      "header": header-text.value,     [FILE: <input id="header-text">]               │   │
 │     │      "footer": footer-text.value,     [FILE: <input id="footer-text">]               │   │
 │     │      "page_number_format": ...,                                                     │   │
 │     │      "add_toc": ...,                                                                │   │
 │     │      "enable_page_breaks": ...                                                      │   │
 │     │    }                                                                                │   │
 │     │                                                                                     │   │
 │     │    # Convert input to HTML if needed                                               │   │
 │     │    if input_format == "markdown":                                                   │   │
 │     │      html_content = convert_markdown_to_html(content)                               │   │
 │     │    else:                                                                            │   │
 │     │      html_content = content                                                         │   │
 │     │    ──────────────────────────────────────────────────────────────                   │   │
 │     │    # Build DOCX via python-docx                                                    │   │
 │     │    doc = Document()                     [FILE: python-docx library]                  │   │
 │     │    doc.core_properties.title = ...                                                  │   │
 │     │    doc.core_properties.author = ...                                                 │   │
 │     │                                                                                     │   │
 │     │    # HEADER                                                                         │   │
 │     │    if options["header"]:                                                            │   │
 │     │      section = doc.sections[0]                                                      │   │
 │     │      header = section.header                                                        │   │
 │     │      header.paragraphs[0].text = options["header"]                                  │   │
 │     │                                                                                     │   │
 │     │    # FOOTER                                                                         │   │
 │     │    if options["footer"]:                                                            │   │
 │     │      footer = section.footer                                                        │   │
 │     │      footer.paragraphs[0].text = options["footer"]                                  │   │
 │     │                                                                                     │   │
 │     │    # PAGE NUMBERS                                                                   │   │
 │     │    if options["page_number_format"] != "none":                                      │   │
 │     │      # Inserts PAGE/NUMPAGES XML fields via OxmlElement                            │   │
 │     │                                                                                     │   │
 │     │    # CONTENT (via BeautifulSoup parser)                                            │   │
 │     │    soup = BeautifulSoup(html_content, 'html.parser')   [FILE: bs4 lib]              │   │
 │     │    for element in soup.find_all():                                                   │   │
 │     │      element_handlers[element.name](element)                                        │   │
 │     │                                                                                     │   │
 │     │  ┌─── ELEMENT HANDLER MAP ───────────────────────────────────────────────┐         │   │
 │     │  │  h1-h6 → doc.add_paragraph(text, style='Heading N')                   │         │   │
 │     │  │  p     → doc.add_paragraph(text)                                      │         │   │
 │     │  │  ul    → doc.add_paragraph(li.text, style='List Bullet') for each li  │         │   │
 │     │  │  ol    → doc.add_paragraph(li.text, style='List Number') for each li  │         │   │
 │     │  │  table → doc.add_table(rows, cols) + table.cell(i,j).text = ...      │         │   │
 │     │  │  hr    → doc.add_page_break() (if enabled)                            │         │   │
 │     │  └────────────────────────────────────────────────────────────────────────┘         │   │
 │     │                                                                                     │   │
 │     │    # TABLE OF CONTENTS                                                             │   │
 │     │    if options["add_toc"]:                                                          │   │
 │     │      doc.add_paragraph("Table of Contents", style='Heading 1')                     │   │
 │     │                                                                                     │   │
 │     │    # SAVE TO MEMORY                                                                │   │
 │     │    doc_bytes = io.BytesIO()                                                        │   │
 │     │    doc.save(doc_bytes)          ◄── python-docx serializes ZIP/XML                 │   │
 │     │    doc_bytes.seek(0)                                                                │   │
 │     │    docx_content = base64.b64encode(doc_bytes.read()).decode('utf-8')               │   │
 │     │    #        ▲                                                                      │   │
 │     │    #        └── Base64 string stored as global variable in Pyodide memory          │   │
 │     │                                                                                     │   │
 │     │    # RE-ENABLE UI                                                                  │   │
 │     │    gen_btn.disabled = False                                                        │   │
 │     │    gen_btn.innerHTML = "<span>⚡ Generate DocX</span>"                             │   │
 │     └────────────────────────────────────────────────────────────────────────────────────┘   │
 │                                                                                              │
 │  ═══════════════════════════════════════════════════════════════════════════════════════════  │
 │                                                                                              │
 │  ⑥ User clicks "⬇️ Download DocX"                                                          │
 │     [index.html] lines 652-661 (JS event)                                                    │
 │     ┌───────────────────────────────────────────────────────────────────────┐               │
 │     │  window.js_download_docx();   ◄── calls Python function              │               │
 │     │                                                                       │               │
 │     │  [Python: download_docx()]                                           │               │
 │     │   download_link = document.createElement("a")                        │               │
 │     │   href = "data:application/vnd.openxmlformats-officedocument.        │               │
 │     │           wordprocessingml.document;base64,{docx_content}"           │               │
 │     │   download_link.download = "My_Document.docx"                       │               │
 │     │   download_link.click()                                              │               │
 │     └───────────────────────────────────────────────────────────────────────┘               │
 │                    │                                                                         │
 │                    ▼                                                                         │
 │     ╔═══════════════════════════════════════════════════════════════════════╗               │
 │     ║    Browser Downloads Dialog → User saves My_Document.docx            ║               │
 │     ╚═══════════════════════════════════════════════════════════════════════╝               │
 │                                                                                              │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      MODE 2: NATIVE PYTHON (Standalone / Codex / Server)                       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                              │
 │  [docx_generator.py] — Full Python library, can be used standalone or imported               │
 │  [requirements.txt] — Lists: python-docx, markdown2, beautifulsoup4                          │
 │  [test_docx_generator.py] — Test suite for all generation functions                          │
 │  [EXAMPLES.md] — Usage examples for Codex, batch, template modes                             │
 │                                                                                              │
 │  Your Code / Codex Agent                                                                      │
 │  [EXAMPLES.md]                                                                                │
 │  ┌─────────────────────────────────────────────────────────┐                                 │
 │  │  from docx_generator import generate_docx_from_markdown │                                 │
 │  │                                                          │                                 │
 │  │  markdown = "# Hello\\nThis is **bold**"               │                                 │
 │  │  options = {"title": "Doc", "header": "Confidential"}   │                                 │
 │  │                                                          │                                 │
 │  │  docx_base64 = generate_docx_from_markdown(             │                                 │
 │  │    markdown, options                                    │                                 │
 │  │  )                                                       │                                 │
 │  └──────────────────────────┬──────────────────────────────┘                                 │
 │                             │                                                                │
 │                             ▼                                                                │
 │  [docx_generator.py]  ─── ENTRY POINT ───                                                    │
 │  ┌───────────────────────────────────────────────────────────────────────────────────────┐   │
 │  │                                                                                       │   │
 │  │  generate_docx_from_markdown(markdown_content, options)                               │   │
 │  │  generate_docx_from_html(html_content, options)                                       │   │
 │  │  ─────────────────────────────────────────────────────────────────────                │   │
 │  │  Step 1: MarkdownConverter.convert_to_html(markdown_text)                             │   │
 │  │          └── import markdown2                                    [FILE: markdown2]   │   │
 │  │          └── markdown2.markdown(text, extras=["tables",...])    ◄── MD → HTML        │   │
 │  │          └── returns: "<h1>Hello</h1><p>This is <strong>bold</strong></p>"           │   │
 │  │                                                                                       │   │
 │  │  Step 2: DocxGenerator()                                                              │   │
 │  │          ├── create_document(title, author)                                           │   │
 │  │          │     └── from docx import Document                  [FILE: python-docx]    │   │
 │  │          │     └── Document() → core_properties                                     │   │
 │  │          │                                                                           │   │
 │  │          ├── add_header(text, alignment, font_size)                                   │   │
 │  │          │     └── section.header.paragraphs[0].text = text                          │   │
 │  │          │                                                                           │   │
 │  │          ├── add_footer(text, alignment, font_size)                                   │   │
 │  │          │     └── section.footer.add_paragraph() + run.font.size = Pt(10)           │   │
 │  │          │                                                                           │   │
 │  │          ├── add_page_numbers(format_type)                                            │   │
 │  │          │     └── OxmlElement('w:fldChar') with PAGE or NUMPAGES instrText          │   │
 │  │          │         ◄── Low-level OOXML field insertion                               │   │
 │  │          │                                                                           │   │
 │  │          ├── process_html_content(html_content, enable_page_breaks)                   │   │
 │  │          │     └── from bs4 import BeautifulSoup         [FILE: beautifulsoup4]      │   │
 │  │          │     └── soup = BeautifulSoup(html, 'html.parser')                         │   │
 │  │          │     └── for element in soup.find_all():                                   │   │
 │  │          │           dispatches to element-specific handler                          │   │
 │  │          │                                                                           │   │
 │  │          ├── add_table_of_contents()                                                  │   │
 │  │          │     └── Adds "Table of Contents" heading + page break                     │   │
 │  │          │                                                                           │   │
 │  │          ├── add_cover_page(title, subtitle, author, date)                            │   │
 │  │          │     └── Creates new section with centered title block                     │   │
 │  │          │                                                                           │   │
 │  │          └── save_to_base64() → str                                                  │   │
 │  │                └── io.BytesIO() + doc.save(bytes_io) + base64.b64encode()            │   │
 │  │                                                                                       │   │
 │  └───────────────────────────────────────────────────────────────────────────────────────┘   │
 │                              │                                                               │
 │                              ▼                                                               │
 │                    ╔══════════════════════════════╗                                           │
 │                    ║  "output.docx" or base64 str  ║                                           │
 │                    ╚══════════════════════════════╝                                           │
 │                                                                                              │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      MODE 3: INTERNET ACCESS (Cloudflare Tunnel)                                ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                              │
 │                  ┌─────────────────────────────────────────────────────────┐                 │
 │                  │  User Browser (Anywhere in the world)                    │                 │
 │                  │  URL: https://xxxxx.trycloudflare.com                    │                 │
 │                  │  Opens index.html in browser                             │                 │
 │                  └──────────────────────┬──────────────────────────────────┘                 │
 │                                         │  HTTPS/2                                          │
 │                                         ▼                                                    │
 │                  ┌─────────────────────────────────────────────────────────┐                 │
 │  [FILE: none]    │  Cloudflare Edge Network (CDN)                          │                 │
 │  (Cloudflare     │  • SSL termination                                      │                 │
 │   service)       │  • DDoS protection                                      │                 │
 │                  │  • Global caching                                        │                 │
 │                  │  • Routes to cloudflared tunnel                          │                 │
 │                  └──────────────────────┬──────────────────────────────────┘                 │
 │                                         │  QUIC/HTTP2                                       │
 │                                         ▼                                                    │
 │                  ┌─────────────────────────────────────────────────────────┐                 │
 │  [FILE: none]    │  cloudflared tunnel (local process)                     │                 │
 │  (cloudflared    │  PID: 147853                                            │                 │
 │   binary)        │  Command: cloudflared tunnel --url http://localhost:3000│                 │
 │                  │  Forwards traffic to localhost:3000                      │                 │
 │                  └──────────────────────┬──────────────────────────────────┘                 │
 │                                         │  HTTP                                            │
 │                                         ▼                                                    │
 │                  ┌─────────────────────────────────────────────────────────┐                 │
 │  [FILE: none]    │  Python HTTP Server (local process)                     │                 │
 │  (python3 -m     │  PID: 147683                                            │                 │
 │   http.server)   │  Port: 3000                                             │                 │
 │                  │  Serves files from /content/docx-generator-skill/        │                 │
 │                  └──────────────────────┬──────────────────────────────────┘                 │
 │                                         │                                                    │
 │                                         ▼                                                    │
 │                  ┌─────────────────────────────────────────────────────────┐                 │
 │                  │  Served Files:                                        │                 │
 │                  │                                                         │                 │
 │  [index.html]    │  http://localhost:3000/index.html                       │                 │
 │  [docx_generator │  http://localhost:3000/docx_generator.py               │                 │
 │      .py]        │  http://localhost:3000/README.md                       │                 │
 │  [SKILL.md]      │  http://localhost:3000/SKILL.md                        │                 │
 │  [QUICKSTART.md] │  http://localhost:3000/QUICKSTART.md                   │                 │
 │  [EXAMPLES.md]   │  http://localhost:3000/EXAMPLES.md                     │                 │
 │  [SETUP_GUIDE.md]│  http://localhost:3000/SETUP_GUIDE.md                   │                 │
 │  [test_*.py]     │  http://localhost:3000/test_docx_generator.py           │                 │
 │                  └─────────────────────────────────────────────────────────┘                 │
 │                                                                                              │
 │  NOTE: Python execution is CLIENT-SIDE — the server only serves static files.               │
 │  The actual DocX generation runs inside the user's browser via Pyodide WASM.                │
 │                                                                                              │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      3-LAYER PACKAGE LOADING STRATEGY                                           ┃
┃                      (Ensures "No module named 'docx'" never happens)                           ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                              │
 │  LAYER 1 — PyConfig (PyScript native, loaded at startup)                                     │
 │  [index.html] lines 9-12                                                                      │
 │  ┌────────────────────────────────────────────────────────────────────┐                      │
 │  │  <py-config>                                                      │                      │
 │  │    packages = ["python-docx", "markdown2", "beautifulsoup4"]     │                      │
 │  │  </py-config>                                                     │                      │
 │  └────────────────────────────────────────────────────────────────────┘                      │
 │  PyScript tells Pyodide to pre-load these from PyPI before running any Python code.          │
 │  Fastest path — packages load during WASM initialization.                                    │
 │                                                                                              │
 │  LAYER 2 — micropip in async init() (redundant install at startup)                           │
 │  [index.html] lines 1072-1080                                                                 │
 │  ┌────────────────────────────────────────────────────────────────────┐                      │
 │  │  async def init():                                                │                      │
 │  │    import micropip                                                │                      │
 │  │    await micropip.install(["python-docx", "markdown2",            │                      │
 │  │                            "beautifulsoup4"])                     │                      │
 │  └────────────────────────────────────────────────────────────────────┘                      │
 │  Catches any packages Layer 1 missed. Runs during loading overlay.                           │
 │                                                                                              │
 │  LAYER 3 — Lazy install inside generate_docx() (on-demand fallback)                         │
 │  [index.html] lines ~800-815                                                                 │
 │  ┌────────────────────────────────────────────────────────────────────┐                      │
 │  │  async def generate_docx():                                        │                      │
 │  │    try:                                                            │                      │
 │  │      from docx import Document                                    │                      │
 │  │    except ImportError:                                             │                      │
 │  │      import micropip                                               │                      │
 │  │      await micropip.install(["python-docx", ...])                 │                      │
 │  │      from docx import Document  # retry                           │                      │
 │  └────────────────────────────────────────────────────────────────────┘                      │
 │  Emergency fallback if user clicks Generate before layers 1 & 2 finish.                      │
 │                                                                                              │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      DOCX FILE INTERNAL STRUCTURE (OOXML Format)                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                              │
 │  .docx is a ZIP archive containing XML files:                                                 │
 │                                                                                              │
 │  my_document.docx                                                                             │
 │  ├── [Content_Types].xml         ◄── MIME types for all parts in the archive                │
 │  │                                                                                           │
 │  ├── word/                                                                                    │
 │  │   ├── document.xml           ◄── MAIN: paragraphs, runs, tables, sections                 │
 │  │   │     <w:body>                                                                          │
 │  │   │       <w:p>  ← paragraph                                                              │
 │  │   │         <w:r>  ← run (formatted text span)                                            │
 │  │   │           <w:rPr><w:b/><w:i/></w:rPr>  ← bold + italic                               │
 │  │   │           <w:t>Hello World</w:t>                                                      │
 │  │   │         </w:r>                                                                        │
 │  │   │       </w:p>                                                                          │
 │  │   │     </w:body>                                                                         │
 │  │   │                                                                                       │
 │  │   ├── header1.xml            ◄── Header content                                           │
 │  │   │     <w:hdr>                                                                            │
 │  │   │       <w:p><w:r><w:t>Confidential</w:t></w:r></w:p>                                   │
 │  │   │     </w:hdr>                                                                           │
 │  │   │                                                                                       │
 │  │   ├── footer1.xml            ◄── Footer content + PAGE field                              │
 │  │   │     <w:ftr>                                                                            │
 │  │   │       <w:p><w:r>                                                                      │
 │  │   │         <w:fldChar w:fldCharType="begin"/>                                            │
 │  │   │         <w:instrText> PAGE </w:instrText>                                             │
 │  │   │         <w:fldChar w:fldCharType="end"/>                                              │
 │  │   │       </w:r></w:p></w:ftr>                                                             │
 │  │   │                                                                                       │
 │  │   ├── styles.xml              ◄── Style definitions (Heading 1, Normal, ListBullet...)    │
 │  │   ├── numbering.xml           ◄── List numbering configuration                            │
 │  │   ├── settings.xml            ◄── Document settings (zoom, defaults...)                   │
 │  │   └── theme/theme1.xml        ◄── Font theme (Calibri, etc.)                              │
 │  │   │                                                                                       │
 │  ├── docProps/                                                                                │
 │  │   ├── core.xml                ◄── Title, author, created date, modified date              │
 │  │   └── app.xml                 ◄── Application metadata (pages, words...)                  │
 │  │                                                                                           │
 │  ├── _rels/.rels                 ◄── Relationships between parts                              │
 │  └── word/_rels/document.xml.rels ◄── Relationships for document.xml                          │
 │                                                                                              │
 │  python-docx abstracts all this into clean Python objects:                                   │
 │    Document → Sections → Paragraphs → Runs                                                  │
 │                               → Tables → Rows → Cells                                       │
 │                               → InlineShapes (images)                                        │
 │                                                                                              │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      PROJECT FILE MAP (FULL INVENTORY)                                          ┃
┃                      /content/docx-generator-skill/                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                              │
 │  CORE APPLICATION FILES:                                                                     │
 │                                                                                              │
 │  [index.html]          (34,628 bytes)    ◄── MAIN ENTRY POINT for browser mode               │
 │                                          Contains: HTML UI + JS events + PyScript block      │
 │                                          with all Python logic (preview, generate, download)  │
 │                                                                                              │
 │  [docx_generator.py]   (20,363 bytes)    ◄── STANDALONE PYTHON LIBRARY                        │
 │                                          Classes: DocxGenerator, MarkdownConverter            │
 │                                          Functions: generate_docx_from_markdown(),            │
 │                                          generate_docx_from_html()                            │
 │                                                                                              │
 │  SUPPORTING FILES:                                                                           │
 │                                                                                              │
 │  [requirements.txt]        (78 bytes)    ◄── Pip dependencies (python-docx, markdown2, bs4)  │
 │  [package.json]          (907 bytes)      ◄── Project metadata / npm scripts                 │
 │  [start.sh]            (1,548 bytes)      ◄── One-command launcher                          │
 │                                                                                              │
 │  TEST SUITE:                                                                                 │
 │                                                                                              │
 │  [test_docx_generator.py] (8,724 bytes)  ◄── Test suite: 6 test functions covering          │
 │                                          markdown conversion, basic generation,              │
 │                                          HTML-to-DOCX, advanced features, error handling     │
 │                                                                                              │
 │  DOCUMENTATION:                                                                              │
 │                                                                                              │
 │  [README.md]            (6,308 bytes)     ◄── Full project documentation                     │
 │  [SKILL.md]             (2,275 bytes)     ◄── Hermes skill integration guide                 │
 │  [QUICKSTART.md]        (6,625 bytes)     ◄── Quick reference guide                          │
 │  [EXAMPLES.md]          (3,992 bytes)     ◄── Code examples (Codex, batch, templates)        │
 │  [SETUP_GUIDE.md]       (8,496 bytes)     ◄── Setup and deployment instructions              │
 │  [IMPLEMENTATION_REPORT.md] (12,343 bytes)◄── Technical implementation details                │
 │                                                                                              │
 │  EXAMPLE FILES:                                                                              │
 │                                                                                              │
 │  [examples.py]          (4,012 bytes)     ◄── Standalone Python usage examples               │
 │                                                                                              │
 └──────────────────────────────────────────────────────────────────────────────────────────────┘


┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                            SUMMARY                                             ┃
┃                      INPUT → PROCESSING → OUTPUT                                               ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

 ┌──────────┐     ┌──────────────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
 │          │     │                      │     │               │     │              │     │              │
 │  USER    │     │  MARKDOWN2 / BS4     │     │  PYTHON-DOCX  │     │   BASE64     │     │  .DOCX FILE  │
 │  INPUT   │────►│                      │────►│               │────►│              │────►│              │
 │          │     │  Convert to HTML      │     │  Build OOXML  │     │  Encode to   │     │  Download    │
 │ HTML or  │     │  Parse structure      │     │  Add styles   │     │  data: URI   │     │  or Save     │
 │ Markdown │     │                      │     │  Add headers   │     │              │     │              │
 │          │     │                      │     │  Add footers   │     │              │     │              │
 └──────────┘     └──────────────────────┘     └───────────────┘     └──────────────┘     └──────────────┘
                                                                                                        
  DEPLOYMENT MODES (all share the same core pipeline above):
  ┌──────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  ❶ Browser WASM (PyScript)  — index.html → Pyodide → python-docx → download             │
  │     Files: [index.html, docx_generator.py, requirements.txt]                             │
  │                                                                                          │
  │  ❷ Native Python / Codex   — docx_generator.py → python-docx → save .docx               │
  │     Files: [docx_generator.py, EXAMPLES.md, test_docx_generator.py]                      │
  │                                                                                          │
  │  ❸ Internet (Cloudflare)   — Browser → Cloudflare → cloudflared → localhost:3000        │
  │     Files: [index.html + all project files served statically]                           │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘