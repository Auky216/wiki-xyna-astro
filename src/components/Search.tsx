import { useEffect, useState, useMemo } from "react";
import { Search as SearchIcon, FileText, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import entries from "@/data/search.json";
import { withBase } from "@/lib/links";
const searchEntries = entries.map(entry => ({ ...entry, href: withBase(entry.href) }));

export default function Search() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalize = (value: string) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
    if (!terms.length) return searchEntries.filter(entry => ["Wiki XynA", "Evidencia publicada"].includes(entry.category));
    return searchEntries.map(entry => {
      const title = normalize(entry.title);
      const haystack = normalize(`${entry.title} ${entry.text} ${entry.category}`);
      return { entry, score: terms.every(term => haystack.includes(term)) ? terms.reduce((score, term) => score + (title.startsWith(term) ? 100 : title.includes(term) ? 80 : 10), 0) : 0 };
    }).filter(result => result.score > 0).sort((a,b) => b.score-a.score).map(result => result.entry);
  }, [query]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setOpen(value => !value);
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  return <>
    <Button variant="outline" className="search-button" onClick={() => setOpen(true)} aria-label="Buscar en la wiki">
      <SearchIcon size={15} /><span>Buscar en la wiki</span><kbd>⌘ K</kbd>
    </Button>
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false} title="Buscar en la wiki XynA" description="Busca secciones, ensayos, componentes y evidencia del proyecto.">
      <CommandInput value={query} onValueChange={setQuery} placeholder="Buscar promotores, Bradford, controles…" />
      <CommandList className="search-results">
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Contenido de la wiki">
          {results.map((entry, index) => <CommandItem key={`${entry.href}-${index}`} value={`${entry.href}-${index}`} onSelect={() => {
            setOpen(false);
            if (new URL(entry.href, window.location.href).href === window.location.href) {
              window.dispatchEvent(new Event("hashchange"));
            } else window.location.assign(entry.href);
          }}>
            {entry.category === "Evidencia publicada" ? <FlaskConical /> : <FileText />}
            <span><strong>{entry.title}</strong><small>{entry.category}</small></span>
          </CommandItem>)}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  </>;
}
