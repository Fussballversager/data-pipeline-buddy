import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useLatestSectionSketch(sectionId?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sectionId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("section_media")
        .select("svg_path")
        .eq("section_id", sectionId)
        .order("id", { ascending: false })   // robust
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      if (error || !data) { setUrl(null); setLoading(false); return; }

      const { data: pub } = supabase.storage
        .from("section-sketches")
        .getPublicUrl(data.svg_path);

      setUrl(pub.publicUrl);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sectionId]);

  return { url, loading };
}
