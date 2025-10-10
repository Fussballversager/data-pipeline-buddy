// src/components/SketchesSection.tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { useSectionSketches } from "@/hooks/useSectionSketches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Section = { id: string; abschnitt_nr: number };

export default function SketchesSection({ sections }: { sections: Section[] }) {
  // Warmup (0) & Cooldown (8) ausblenden
  const eligible = useMemo(
    () =>
      (sections || []).filter(
        (s) => s && s.id && ![0, 8].includes(Number(s.abschnitt_nr))
      ),
    [sections]
  );

  const sectionIds = useMemo(() => eligible.map((s) => s.id), [eligible]);
  const { data, loading, error } = useSectionSketches(sectionIds, {
    onlyLatestPerSection: true,
  });

  // Mapping Abschnittsnummern
  const nrById = useMemo(
    () => new Map<string, number>(eligible.map((s) => [s.id, Number(s.abschnitt_nr)])),
    [eligible]
  );

  // Nach Abschnittsnummer sortieren (1..7), bei Gleichstand nach id
  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      const na = nrById.get(a.section_id) ?? 999;
      const nb = nrById.get(b.section_id) ?? 999;
      if (na !== nb) return na - nb;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [data, nrById]);

  if (loading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Skizzen</CardTitle>
        </CardHeader>
        <CardContent>🚧 Lade Skizzen…</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Skizzen</CardTitle>
        </CardHeader>
        <CardContent className="text-red-600">
          Fehler beim Laden der Skizzen:
          <pre className="mt-2 whitespace-pre-wrap text-xs">
            {String((error as any)?.message ?? error)}
          </pre>
        </CardContent>
      </Card>
    );
  }

  if (!sorted || sorted.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Skizzen</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-500">
          Für diese Trainingseinheit liegen noch keine Skizzen vor.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Skizzen</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {sorted.length} sichtbar
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Screen: responsive Grid; Print: 2 Spalten mit größerem Abstand */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 print:grid-cols-2 print:gap-8">
          {sorted.map((item) => (
            <SketchCard
              key={item.id}
              title={`Abschnitt ${nrById.get(item.section_id) ?? "?"} · ${item.template_version ?? "?"}`}
              imgSrc={item.public_url}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SketchCard({
  title,
  imgSrc,
  aspectClass = "aspect-[1/2]", // iPhone-ähnlich: Höhe ≈ 2 × Breite
}: {
  title: string;
  imgSrc: string;
  aspectClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const onLoad = () => { /* optional debug */ };
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [imgSrc]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* SCREEN: mit iPhone-Rahmen */}
        <div className="cursor-zoom-in group avoid-break print:hidden">
          <div
            className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden
                        bg-neutral-900/80 border border-slate-300/40 shadow-md`}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              alt={title}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.01] z-0"
              loading="lazy"
            />
            {/* Deko-Overlay … (Notch, Home-Button, etc.) */}
            <div className="pointer-events-none absolute inset-0 z-10">
              {/* Notch – größer, mit Rahmen + Glanz */}
              <div
                className="
      absolute left-1/2 -translate-x-1/2 top-1
      h-3 w-[72%] rounded-b-2xl
      bg-gradient-to-b from-neutral-900/95 via-neutral-900/90 to-neutral-800/85
      border border-neutral-500/70 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.6)]
      ring-1 ring-black/20
    "
              >
                {/* kleine „Kamera“-Andeutung */}
                <div className="absolute left-1/2 -translate-x-1/2
    top-0.15 h-1.5 w-12 rounded-full
    bg-gradient-to-b from-white/85 to-white/35
    shadow-[0_1px_4px_rgba(255,255,255,0.5)]
    ring-1 ring-white/30
    mix-blend-screen
" />
              </div>

              {/* Home-Button – Doppelring */}
              <div
                className="
      absolute left-1/2 -translate-x-1/2 bottom-2
      h-10 w-10 rounded-full
      border border-white/40 bg-white/20 backdrop-blur-[2px]
      shadow-[0_4px_10px_-3px_rgba(0,0,0,0.7)]"
              >
                {/* innerer Ring */}
                <div
                  className="
        absolute inset-0 m-1.5 rounded-full
        border-2 border-white/50
        bg-gradient-to-b from-white/30 to-white/10
        shadow-[inset_0_2px_6px_rgba(255,255,255,0.25)]
      "
                />
              </div>
            </div>

          </div>
          <div className="mt-2 text-sm font-medium">{title}</div>
        </div>
      </DialogTrigger>

      {/* PRINT: nur die Skizze, ohne Rahmen/Notch/etc. */}
      <div className="hidden print:block avoid-break">
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-auto object-contain"
        />
        <div className="mt-2 text-sm font-medium">{title}</div>
      </div>


      <DialogContent className="max-w-[95vw] sm:max-w-5xl p-4">
        <img
          src={imgSrc}
          alt={title}
          className="max-h-[80vh] w-auto max-w-full object-contain mx-auto"
        />
        <div className="mt-2 text-sm text-center">{title}</div>
      </DialogContent>
    </Dialog>
  );
}
