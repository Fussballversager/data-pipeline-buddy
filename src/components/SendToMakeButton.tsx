import React, { useState } from "react";
import { mapPlanToPayload } from "@/utils/mapPlanToPayload";
import { supabase } from "@/integrations/supabase/client";

type TechType = "month" | "week" | "day";
type LabelTyp = "Monat" | "Woche" | "Tag";

interface Props {
  plan: any;
  /** Technischer Typ für Logik / Tabellenwahl */
  type: TechType;
  /** Optional: Deutsches Label nur für Payload/UI; wenn nicht gesetzt, wird aus `type` gemappt */
  typ?: LabelTyp;
  submission?: any;
  overrides?: {
    overridePhilosophie?: string | null;
    overrideAltersstufe?: string | null;
    overrideSpielerkader?: number | null;
  };
}

const TYPE_TO_LABEL: Record<TechType, LabelTyp> = {
  month: "Monat",
  week: "Woche",
  day: "Tag",
};

export default function SendToMakeButton({
  plan,
  type,
  typ,
  submission,
  overrides,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const mergedPlan = { ...submission, ...plan };

      // mapPlanToPayload erwartet weiterhin das deutsche Label (abwärtskompatibel)
      const labelForPayload: LabelTyp = typ ?? TYPE_TO_LABEL[type];

      const payload = mapPlanToPayload(mergedPlan, labelForPayload, overrides);

      const response = await fetch(
        "https://hook.eu2.make.com/x0ec5ntg8y8sqcl94nqeh6u57tqmnwg1",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Fehler beim Senden");

      setMessage("✅ Erfolgreich an Make gesendet");

      // OPTIONAL: last_run_at aktualisieren – jetzt konsistent per technischem Typ
      /*
      const table =
        type === "month" ? "month_plans" :
        type === "week"  ? "week_plans"  :
                           "day_plans";

      const { error } = await supabase
        .from(table)
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
            : plan?.last_run_at
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