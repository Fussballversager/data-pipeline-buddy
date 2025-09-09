import React, { useState } from "react";
import { mapPlanToPayload } from "@/utils/mapPlanToPayload";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  plan: any;
  typ: "Monat" | "Woche" | "Tag";
  submission?: any;
  overrides?: {
    overridePhilosophie?: string | null;
    overrideAltersstufe?: string | null;
    overrideSpielerkader?: number | null;
  };
}

export default function SendToMakeButton({ plan, typ, submission, overrides }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const mergedPlan = { ...submission, ...plan };
      const payload = mapPlanToPayload(mergedPlan, typ, overrides);

      const response = await fetch(
        "https://hook.eu2.make.com/jr6wvnrr27mc7wr0r73pkstjb2o75z5p",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Fehler beim Senden");

      setMessage("✅ Erfolgreich an Make gesendet");

      // OPTIONAL: last_run_at aktualisieren
      /*
      const { error } = await supabase
        .from(
          typ === "Monat"
            ? "month_plans"
            : typ === "Woche"
            ? "week_plans"
            : "day_plans"
        )
        .update({ last_run_at: new Date().toISOString() })
        .eq("id", plan.id);

      if (error) console.error("❌ Fehler beim Aktualisieren von last_run_at:", error);
      */
    } catch (err) {
      console.error(err);
      setMessage("❌ Fehler beim Senden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleSend}
        disabled={loading}
        className={`px-4 py-2 rounded text-white ${
          loading
            ? "bg-gray-400 cursor-wait"
            : plan.last_run_at
            ? "bg-gray-500 hover:bg-green-700"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Sende..." : "An Taggy-KI senden"}
      </button>
      {message && <p className="text-xs mt-1">{message}</p>}
    </div>
  );
}
