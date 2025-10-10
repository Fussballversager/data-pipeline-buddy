// src/components/SketchesSection.tsx
import { useMemo, useState, useRef, useEffect } from "react";
import { useSectionSketches } from "@/hooks/useSectionSketches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PhoneFrameChrome } from "@/components/PhoneFrameChrome";

type Section = { id: string; abschnitt_nr: number };

export default function SketchesSection({ sections }: { sections: Section[] }) {
  // Warmup (0) & Cooldown (8) ausblenden
  const eligible = useMemo(
    () => (sections || []).filter((s) => s && s.id && ![0, 8].includes(Number(s.abschnitt_nr))),
    [sections]
  );

  const sectionIds = useMemo(() => eligible.map((s) => s.id), [eligible]);
  const { data, loading, error } = useSectionSketches(sectionIds, { onlyLatestPerSection: true });

  // Mapping Abschnittsnummern
  const nrById = useMemo(
    () => new Map<string, number>(eligible.map((s) => [s.id, Number(s.abschnitt_nr)])),
    [eligible]
  );

  // Nach Abschnittsnummer sortieren (1,2,3,4,5,6,7…), bei Gleichstand nach id
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
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sorted.map((item) => (
            <SketchCard
              key={item.id}
              title={`Abschnitt ${nrById.get(item.section_id) ?? "?"} · ${
                item.template_version ?? "v?"
              }`}
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
  ratio = 1 / 2, // 75mm : 155mm ≈ 1:2
  maxHeightClass = "max-h-[26rem]",
}: {
  title: string;
  imgSrc: string;
  ratio?: number | string;
  maxHeightClass?: string;
}) {
  const [open, setOpen] = useState(false);

  // (Optional) Log der nativen Größe – hilfreich bei späteren Debugs
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const onLoad = () => {
      // console.log("[SketchCard] natural size:", el.naturalWidth, el.naturalHeight);
    };
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [imgSrc]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-zoom-in group">
          {/* Phone-Frame mit Safe-Areas; kein Cropping, object-contain */}
          <PhoneFrameChrome ratio={ratio} className={`w-full ${maxHeightClass}`} safeTop={12} safeBottom={28}>
            <div className="h-full w-full flex items-center justify-center">
              <img
                ref={imgRef}
                src={imgSrc}
                alt={title}
                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
              />
            </div>
          </PhoneFrameChrome>

          <div className="mt-2 text-sm font-medium">{title}</div>
        </div>
      </DialogTrigger>

      {/* Große Ansicht: vollständige Höhe ohne Abschneiden */}
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
