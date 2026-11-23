import { useState } from "react";
import { Menu, BookOpen, Dna, FlaskConical, ChartNoAxesCombined, Users, LibraryBig } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navigation } from "@/lib/navigation";
import { withBase } from "@/lib/links";

const icons = [BookOpen, Dna, FlaskConical, ChartNoAxesCombined, Users, LibraryBig];
export default function MobileNav({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  return <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild><Button variant="ghost" size="icon" className="mobile-nav-button" aria-label="Abrir menú"><Menu size={20} /></Button></SheetTrigger>
    <SheetContent side="left" className="mobile-sheet">
      <SheetHeader><SheetTitle>XynA · Wiki</SheetTitle><SheetDescription>Biología Sintética II · UTEC</SheetDescription></SheetHeader>
      <nav aria-label="Navegación móvil" className="mobile-nav-links">
        <a href={withBase("/")} onClick={() => setOpen(false)}>Inicio</a>
        {navigation.map((item, index) => {
          const Icon = icons[index];
          return <a key={item.id} href={withBase(`/${item.id}/`)} aria-current={current === item.id ? "page" : undefined} onClick={() => setOpen(false)}><Icon size={17} /><span>{item.label}</span></a>;
        })}
      </nav>
    </SheetContent>
  </Sheet>;
}
