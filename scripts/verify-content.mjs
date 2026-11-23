import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "src/data/wiki.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/data/content-manifest.json"), "utf8"));
const tags = new Set(["p", "h1", "h2", "h3", "h4", "figcaption", "li", "td", "th", "caption", "summary"]);
const text = node => typeof node === "string" ? node : node.tag === "br" ? " " : node.children.map(text).join("");
const normalize = value => value.replace(/\s+/g, " ").trim();
function units(nodes) {
  const result = [];
  function walk(node) {
    if (!node || typeof node === "string" || node.tag === "nav") return;
    if (tags.has(node.tag)) result.push(normalize(text(node)));
    node.children.forEach(walk);
  }
  nodes.forEach(walk);
  return result;
}
const forest = [];
Object.values(data.sections).forEach(section => forest.push(...Object.values(section.heading), ...section.body));
data.topics.forEach(topic => forest.push(...Object.values(topic.heading), ...topic.body));
forest.push(...data.references);
assert.deepEqual(units(forest).sort(), [...manifest.units].sort(), "Cambió o falta contenido científico respecto a la wiki original.");
assert.deepEqual(units(Object.values(data.hero)).sort(), [...manifest.heroUnits].sort(), "Cambió contenido de la portada.");
for (const [filename, expected] of Object.entries(manifest.images)) {
  const contents = fs.readFileSync(path.join(root, "public/figures", filename));
  assert.equal(crypto.createHash("sha256").update(contents).digest("hex"), expected, `La figura ${filename} cambió.`);
}
assert(!JSON.stringify(data).includes("Contribuciones individuales:"), "Reapareció la nota retirada por el usuario.");
const offline = fs.readFileSync(path.join(root, "public/downloads/wiki-xyna-completa.html"));
assert.equal(crypto.createHash("sha256").update(offline).digest("hex"), manifest.sourceSha256, "El archivo completo original cambió.");

const routes = ["", "proyecto", "diseno", "experimento", "equipo", "referencias", "evidencia", ...data.topics.map(topic => `evidencia/${topic.slug}`)];
const dist = path.join(root, "dist");
if (fs.existsSync(dist)) {
  const base = (process.env.BASE_PATH || "").replace(/\/$/, "");
  for (const route of routes) {
    const html = fs.readFileSync(path.join(dist, route, "index.html"), "utf8");
    assert(html.includes('<html lang="es"'), `Falta idioma en ${route}`);
    assert(!html.includes("file:///Users/"), `Una ruta local se filtró en ${route}`);
    assert(!html.includes('id="motion-toggle"'), `Reapareció el botón de pausa en ${route}`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, `IDs duplicados en ${route}`);
    for (const match of html.matchAll(/(?:href|src|component-url|renderer-url)="(\/[^"]*)"/g)) {
      const url = match[1].split(/[?#]/)[0];
      assert(!base || url.startsWith(`${base}/`), `Ruta sin BASE_PATH en ${route}: ${url}`);
      const local = path.join(dist, decodeURIComponent(base ? url.slice(base.length) : url));
      assert(fs.existsSync(local), `Recurso ausente en ${route}: ${url}`);
    }
  }
}
console.log(`Contenido verificado: ${manifest.units.length} bloques científicos, ${Object.keys(manifest.images).length} figuras del informe y ${routes.length} páginas. Texto y datos preservados.`);
