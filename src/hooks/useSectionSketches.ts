// src/hooks/useSectionSketches.ts
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SectionSketch = {
  id: string;              // row id (section_media)
  section_id: string;
  template_version: string | null;
  svg_path: string;
  status: "ok" | string;
  public_url: string;      // resolved via Storage.getPublicUrl
};

type UseSectionSketchesOpts = {
  onlyLatestPerSection?: boolean; // default true
};

export function useSectionSketches(sectionIds: string[], opts: UseSectionSketchesOpts = {}) {
  const { onlyLatestPerSection = true } = opts;
  const [data, setData] = useState<SectionSketch[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // normalize & dedupe
  const ids = useMemo(
    () => Array.from(new Set((sectionIds || []).filter(Boolean))),
    [sectionIds]
  );

  useEffect(() => {
  if (ids.length === 0) {
    setData([]);
    return;
  }

  let cancelled = false;
  const load = async () => {
    setLoading(true);
    setError(null);

    // 1) Ohne harten Status-Filter (erstmal alles holen)
    // 2) Sortiere sicherheitshalber nach 'id' (existiert in jeder Tabelle)
    const { data: rows, error } = await supabase
  .from("section_media")
  .select("id, section_id, template_version, svg_path, status")
  .in("section_id", ids)
  .order("id", { ascending: false });

    if (cancelled) return;

    if (error) {
      console.error("❌ section_media query failed:", error);
      setError(error);
      setData(null);
    } else {
      // Optional: clientseitig nur 'ok' durchlassen
      const okRows = (rows || []).filter(r => (r.status ?? "ok").toLowerCase() === "ok");

      const withUrls: SectionSketch[] = okRows.map((r) => {
        const { data } = supabase.storage
          .from("section-sketches")
          .getPublicUrl(r.svg_path);
        return { ...r, public_url: data.publicUrl } as SectionSketch;
      });

      if (onlyLatestPerSection) {
        const seen = new Set<string>();
        const latest: SectionSketch[] = [];
        for (const row of withUrls) {
          if (!seen.has(row.section_id)) {
            latest.push(row);
            seen.add(row.section_id);
          }
        }
        setData(latest);
      } else {
        setData(withUrls);
      }
    }

    setLoading(false);
  };

  load();
  return () => { cancelled = true; };
}, [ids.join("|"), onlyLatestPerSection]);


  return { data: data ?? [], loading, error };
}
