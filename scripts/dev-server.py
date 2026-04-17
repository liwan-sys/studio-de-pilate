#!/usr/bin/env python3
"""
Studio SVB — Serveur de dev local qui envoie le bon Content-Type (utf-8).

Usage :
    python3 scripts/dev-server.py [port]

Par défaut, port 8080. Sert les fichiers avec le même charset qu'en prod Netlify,
ce qui évite les problèmes d'emoji/accents décodés en Latin-1.
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

CHARSET_MAP = {
    '.html': 'text/html; charset=utf-8',
    '.htm':  'text/html; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.xml':  'application/xml; charset=utf-8',
    '.svg':  'image/svg+xml; charset=utf-8',
    '.txt':  'text/plain; charset=utf-8',
    '.md':   'text/plain; charset=utf-8',
}


class SVBHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def guess_type(self, path):
        # Honor our charset map first
        p = str(path).lower()
        for ext, mime in CHARSET_MAP.items():
            if p.endswith(ext):
                return mime
        return super().guess_type(path)

    def end_headers(self):
        # Soft mimic of Netlify _redirects for clean URLs in local dev
        self.send_header('X-SVB-Dev', '1')
        super().end_headers()

    def do_GET(self):
        # Simple clean-URL fallback (like Netlify _redirects 200 rewrites)
        raw_path = self.path.split('?', 1)[0].split('#', 1)[0]
        fs_path = (ROOT / raw_path.lstrip('/')).resolve()
        if not fs_path.exists() and not raw_path.endswith('.html') and '.' not in fs_path.name:
            html_candidate = fs_path.with_suffix('.html')
            if html_candidate.exists():
                self.path = html_candidate.relative_to(ROOT).as_posix()
                self.path = '/' + self.path
        return super().do_GET()


if __name__ == '__main__':
    print(f"→ Studio SVB dev server on http://localhost:{PORT}")
    print(f"  serving: {ROOT}")
    print(f"  Ctrl+C to stop.\n")
    try:
        HTTPServer(('0.0.0.0', PORT), SVBHandler).serve_forever()
    except KeyboardInterrupt:
        print("\n✓ bye")
