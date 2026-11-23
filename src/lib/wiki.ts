import raw from "@/data/wiki.json";

export type WikiChild = string | WikiNode;
export type WikiNode = { tag: string; attrs: Record<string, string>; children: WikiChild[] };
export type Heading = { eyebrow: WikiNode; title: WikiNode; intro: WikiNode };
export type WikiSection = { id: string; heading: Heading; body: WikiNode[] };
export type Topic = WikiSection & { slug: string };
type WikiData = {
  hero: Record<string, WikiNode>;
  sections: Record<string, WikiSection>;
  topics: Topic[];
  references: WikiNode[];
};
export const wiki = raw as unknown as WikiData;
export { navigation } from "./navigation";
export const topicLabels: Record<string, string> = {
  promotores: "Promotores", coronta: "Coronta de maíz", proteina: "Proteína y actividad",
  estabilidad: "Actividad y estabilidad", productos: "Productos de hidrólisis", metodo: "Método analítico",
};
export const topicSummaries: Record<string, string> = {
  promotores: "La evidencia reportera que sustenta la comparación de J23106 y J23100.",
  coronta: "El antecedente que apoya el uso de una fracción hemicelulósica de coronta.",
  proteina: "Qué muestran el SDS-PAGE, la zimografía y los datos de purificación.",
  estabilidad: "La diferencia entre favorecer una reacción y conservar la actividad.",
  productos: "Qué puede identificarse con cromatografía y qué permite medir DNS.",
  metodo: "Cómo el patrón y el método modifican la actividad calculada.",
};

export { withBase, resolveHref } from "./links";
export function textOf(node: WikiChild): string {
  if (typeof node === "string") return node;
  if (node.tag === "br") return " ";
  return node.children.map(textOf).join("");
}
export function plain(node: WikiChild) { return textOf(node).replace(/\s+/g, " ").trim(); }
export function headingText(heading: Heading) { return plain(heading.title); }

