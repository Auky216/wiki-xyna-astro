import React, { useId, useState, useEffect, useMemo } from "react";
import { Expand, Download } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { resolveHref, withBase } from "@/lib/links";
import type { WikiNode, WikiChild } from "@/lib/wiki";

const isNode = (node: WikiChild): node is WikiNode => typeof node !== "string";
function useHashTab(items: WikiNode[]) {
  const [value, setValue] = useState("0");
  useEffect(() => {
    const contains = (node: WikiChild, id: string): boolean => typeof node !== "string" && (node.attrs.id === id || node.children.some(child => contains(child, id)));
    const sync = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const index = items.findIndex(item => contains(item, id));
      if (index >= 0) {
        setValue(String(index));
        requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
      }
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [items]);
  return { value, onValueChange: setValue };
}
function attributes(node: WikiNode): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const rename: Record<string, string> = { class: "className", tabindex: "tabIndex", colspan: "colSpan", rowspan: "rowSpan", for: "htmlFor" };
  for (const [key, value] of Object.entries(node.attrs)) {
    if (key.startsWith("on")) continue;
    if (key === "style") {
      props.style = Object.fromEntries(value.split(";").filter(Boolean).map(item => {
        const colon = item.indexOf(":");
        return [item.slice(0, colon).trim().replace(/-([a-z])/g, (_, char: string) => char.toUpperCase()), item.slice(colon + 1).trim()];
      }));
    } else if (key === "href") props.href = resolveHref(value);
    else if (key === "src") props.src = withBase(value);
    else if (key === "decoding") props.decoding = "async";
    else if (key === "loading") props.loading = "lazy";
    else props[rename[key] || key] = value;
  }
  return props;
}

function Details({ node }: { node: WikiNode }) {
  const id = useId();
  const [open, setOpen] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => {
      if (node.attrs.id && decodeURIComponent(window.location.hash.slice(1)) === node.attrs.id) {
        setOpen([id]);
        requestAnimationFrame(() => document.getElementById(node.attrs.id)?.scrollIntoView({ block: "start" }));
      }
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id, node.attrs.id]);
  const summary = node.children.find(child => isNode(child) && child.tag === "summary") as WikiNode;
  const body = node.children.filter(child => child !== summary);
  return <Accordion type="multiple" id={node.attrs.id} value={open} onValueChange={setOpen} className={`wiki-accordion ${node.attrs.class || ""}`}>
    <AccordionItem value={id}>
      <AccordionTrigger>{summary.children.map((child, i) => <Node key={i} node={child} />)}</AccordionTrigger>
      <AccordionContent>{body.map((child, i) => <Node key={i} node={child} />)}</AccordionContent>
    </AccordionItem>
  </Accordion>;
}

function ImageZoom({ node }: { node: WikiNode }) {
  const image = node.children.find(child => isNode(child) && child.tag === "img") as WikiNode | undefined;
  if (!image) return <>{node.children.map((child, i) => <Node key={i} node={child} />)}</>;
  const src = withBase(image.attrs.src);
  return <Dialog>
    <DialogTrigger asChild>
      <button className="figure-zoom-trigger" aria-label={node.attrs["aria-label"]} type="button">
        <img {...attributes(image)} />
        <span className="figure-expand" aria-hidden="true"><Expand size={16} /></span>
      </button>
    </DialogTrigger>
    <DialogContent className="figure-dialog sm:max-w-[min(1120px,94vw)]">
      <DialogHeader>
        <DialogTitle>{node.attrs["data-title"]}</DialogTitle>
        <DialogDescription>{node.attrs["data-credit"]}</DialogDescription>
      </DialogHeader>
      <div className="figure-dialog-image"><img src={src} alt={image.attrs.alt} /></div>
      <Button asChild variant="outline" className="figure-download">
        <a href={src} download={image.attrs["data-filename"]}><Download size={14} />Descargar imagen</a>
      </Button>
    </DialogContent>
  </Dialog>;
}

function DesignGallery({ node }: { node: WikiNode }) {
  const items = useMemo(() => node.children.filter(isNode), [node]);
  const tabState = useHashTab(items);
  const names = ["Vector parental", "Ensamblaje de T2"];
  return <Tabs {...tabState} className="design-gallery">
    <TabsList variant="line" aria-label="Figuras del diseño genético">
      {items.map((_, i) => <TabsTrigger key={i} value={String(i)}>{names[i]}</TabsTrigger>)}
    </TabsList>
    {items.map((item, i) => <TabsContent key={i} value={String(i)} forceMount className="data-[state=inactive]:hidden">
      <Node node={item} />
    </TabsContent>)}
  </Tabs>;
}

function AssayTabs({ node }: { node: WikiNode }) {
  const items = useMemo(() => node.children.filter(isNode), [node]);
  const tabState = useHashTab(items);
  const title = (item: WikiNode): string => {
    const heading = item.children.find(child => isNode(child) && child.tag === "h4") as WikiNode;
    const text = (child: WikiChild): string => typeof child === "string" ? child : child.children.map(text).join("");
    return text(heading);
  };
  return <Tabs {...tabState} className="design-gallery assay-gallery">
    <TabsList variant="line" aria-label="Ensayos propuestos">
      {items.map((item, index) => <TabsTrigger key={index} value={String(index)}>{title(item)}</TabsTrigger>)}
    </TabsList>
    {items.map((item, index) => <TabsContent key={index} value={String(index)} forceMount className="data-[state=inactive]:hidden"><Node node={item} /></TabsContent>)}
  </Tabs>;
}

export function Node({ node }: { node: WikiChild }): React.ReactNode {
  if (typeof node === "string") return node;
  if (node.tag === "details") return <Details node={node} />;
  if (node.tag === "button" && node.attrs.class?.includes("image-button")) return <ImageZoom node={node} />;
  if (node.attrs.class?.split(" ").includes("assays")) return <AssayTabs node={node} />;
  if (node.attrs.class?.split(" ").includes("split-figures") && node.children.filter(isNode).every(n => n.tag === "article")) return <DesignGallery node={node} />;
  const props = attributes(node);
  if (["img", "br", "hr", "input", "source", "wbr"].includes(node.tag)) return React.createElement(node.tag, props);
  return React.createElement(node.tag, props, node.children.map((child, index) => <Node key={index} node={child} />));
}

export default function ArticleContent({ nodes, className = "" }: { nodes: WikiNode[]; className?: string }) {
  return <div className={`wiki-prose ${className}`}>{nodes.map((node, index) => <Node key={index} node={node} />)}</div>;
}
