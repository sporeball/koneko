import fs from 'fs';
import http from 'http';
import path from 'path';

/**
 * take an HTML file created by koneko, and serve it on localhost:8080
 * @param {string} htmlFile
 */
export default function serve (htmlFile) {
  let html;
  try {
    html = fs.readFileSync(path.resolve(process.cwd(), htmlFile), { encoding: 'utf-8' });
  } catch (e) {
    throw new Error(`server: could not read HTML file ${htmlFile}`);
  }
  const server = http.createServer(function (req, res) {
    res.setHeader("Content-Type", "text/html");
    res.writeHead(200);
    res.end(html);
  });
  server.listen(8080, 'localhost', () => {
    console.log(`serving ${htmlFile} on http://localhost:8080`);
  })
}
