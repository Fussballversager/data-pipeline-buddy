// src/hooks/usePlanPolling.tsx
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePlanPolling() {
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);

  const startPolling = async ({
    table,
    column,
    id,
    label,
    onSuccess,
    timeout = 180000, // 3 Minuten
    interval = 10000, // 10 Sekunden
  }: {
    table: string;
    column: string;
    id: string;
    label: string;
    onSuccess?: () => void;
    timeout?: number;
    interval?: number;
  }) => {
    setPollingStatus(`⏳ ${label} wird verarbeitet …`);

    const maxAttempts = Math.floor(timeout / interval);
    let attempts = 0;

    while (attempts < maxAttempts) {
      const { data } = await supabase
        .from(table)
        .select("*")
        .eq(column, id)
        .limit(1)
        .maybeSingle();

      if (data) {
        setPollingStatus(`✅ ${label} abgeschlossen.`);
        onSuccess?.();
        return;
      }

      await new Promise((r) => setTimeout(r, interval));
      attempts++;
    }

    setPollingStatus(`⚠️ ${label} hat keine Rückmeldung gegeben.`);
  };

  return { pollingStatus, startPolling };
}