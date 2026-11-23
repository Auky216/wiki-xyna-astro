import destinations from "@/data/destinations.json";
export function withBase(path: string) {
  if (/^(https?:|mailto:|data:)/.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}
export function resolveHref(href: string) {
  if (href.startsWith("#")) {
    const destination = (destinations as Record<string,string>)[href.slice(1)];
    return destination ? withBase(destination) : href;
  }
  return href.startsWith("/") ? withBase(href) : href;
}
