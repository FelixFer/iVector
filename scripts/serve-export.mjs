import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";

const root = resolve("out");
const origin = "http://127.0.0.1:4173";
const notFound = await readFile(resolve(root, "404.html"));
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(request.url, origin).pathname);
    const destination = resolve(root, `.${pathname}`, extname(pathname) ? "" : "index.html");
    const localPath = relative(root, destination);
    if (isAbsolute(localPath) || localPath === ".." || localPath.startsWith(`..${sep}`)) {
      response.writeHead(404, { "Content-Type": contentTypes[".html"] }).end(request.method === "HEAD" ? undefined : notFound);
      return;
    }

    const contents = await readFile(destination);
    response.writeHead(200, { "Content-Type": contentTypes[extname(destination)] ?? "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    if (error instanceof URIError || ["ENOENT", "EISDIR", "ENOTDIR"].includes(error.code)) {
      response.writeHead(404, { "Content-Type": contentTypes[".html"] });
      response.end(request.method === "HEAD" ? undefined : notFound);
    } else {
      response.writeHead(500).end();
      console.error(error);
    }
  }
}).listen(4173, "127.0.0.1", () => console.log(`Static export available at ${origin}`));
