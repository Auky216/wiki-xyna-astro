import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "src/data/wiki.json");
const wiki = JSON.parse(fs.readFileSync(dataPath, "utf8"));
const text = n => typeof n === "string" ? n : n.tag === "br" ? " " : n.children.map(text).join("");
const plain = n => text(n).replace(/\s+/g, " ").trim();
const slug = value => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 76);
const labels = {proyecto:"El proyecto",diseno:"Diseño genético",experimento:"Experimento",evidencia:"Evidencia",equipo:"Equipo",referencias:"Referencias"};
const topicLabels = {promotores:"Promotores",coronta:"Coronta de maíz",proteina:"Proteína y actividad",estabilidad:"Actividad y estabilidad",productos:"Productos de hidrólisis",metodo:"Método analítico"};
const destinations = {inicio:"/",contenido:"/",referencias:"/referencias/"};
const search = [];
function processNodes(nodes, route, category) {
  const used = new Set();
  function index(n) {
    if (typeof n === "string") return;
    if (["h3","h4","details"].includes(n.tag) && !n.attrs.id) {
      const label = n.tag === "details" ? n.children.find(c => typeof c !== "string" && c.tag === "summary") : n;
      const base = `${n.tag === "details" ? "detalles" : "tema"}-${slug(plain(label))}`;
      let id = base; let i = 2;
      while (used.has(id)) id = `${base}-${i++}`;
      n.attrs.id = id;
    }
    if (n.attrs.id) {
      used.add(n.attrs.id);
      destinations[n.attrs.id] = `${route}#${n.attrs.id}`;
    }
    n.children.forEach(index);
  }
  nodes.forEach(index);
  function searchNodes(n, detailsId = "") {
    if (typeof n === "string" || n.tag === "nav") return;
    if (n.tag === "details") {
      const summary = n.children.find(c => typeof c !== "string" && c.tag === "summary");
      search.push({title:plain(summary),href:`${route}#${n.attrs.id}`,category,text:plain(n)});
      detailsId = n.attrs.id;
    } else if (["h3","h4"].includes(n.tag)) {
      search.push({title:plain(n),href:`${route}#${detailsId || n.attrs.id}`,category,text:plain(n)});
    }
    n.children.forEach(child => searchNodes(child, detailsId));
  }
  nodes.forEach(n => searchNodes(n));
}
for (const section of Object.values(wiki.sections)) {
  const route = `/${section.id}/`;
  search.push({title:labels[section.id],href:route,category:"Wiki XynA",text:plain(section.heading.intro)});
  processNodes([...Object.values(section.heading),...section.body],route,labels[section.id]);
  destinations[section.id] = route;
}
for (const topic of wiki.topics) {
  const route = `/evidencia/${topic.slug}/`;
  search.push({title:plain(topic.heading.title),href:route,category:"Evidencia publicada",text:plain(topic.heading.intro)});
  processNodes([...Object.values(topic.heading),...topic.body],route,topicLabels[topic.id]);
  destinations[topic.id] = route;
}
processNodes(wiki.references,"/referencias/","Referencias");
search.push({title:"Referencias",href:"/referencias/",category:"Wiki XynA",text:"Bibliografía y créditos de las figuras"});
destinations.referencias="/referencias/";
fs.writeFileSync(dataPath,JSON.stringify(wiki,null,2)+"\n");
fs.writeFileSync(path.join(root,"src/data/destinations.json"),JSON.stringify(destinations,null,2)+"\n");
fs.writeFileSync(path.join(root,"src/data/search.json"),JSON.stringify(search,null,2)+"\n");
console.log(`Índice local preparado: ${search.length} entradas, sin cambiar el texto del proyecto.`);
