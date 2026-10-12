from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
import sys

class ThreadingSimpleServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    server = ThreadingSimpleServer(('127.0.0.1', port), SimpleHTTPRequestHandler)
    print(f"Serving on http://127.0.0.1:{port}")
    server.serve_forever()
