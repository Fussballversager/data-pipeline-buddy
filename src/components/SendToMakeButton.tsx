import React, { useState } from "react";
import { mapPlanToPayload } from "@/utils/mapPlanToPayload";

interface Props {
  plan: any;                       // kompletter Plan (Monat, Woche, Tag)
  typ: "Monat" | "Woche" | "Tag";  // explizit Typ mitgeben
  submission?: any;                // Stammdaten optional
}

export default function SendToMakeButton({ plan, typ, submission }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Plan + Stammdaten mergen (Plan überschreibt Stammdaten)
      const mergedPlan = {
        ...submission,
        ...plan,
      };

      const payload = mapPlanToPayload(mergedPlan, typ);

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
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Sende..." : "An Taggy-KI senden"}
      </button>
      {message && <p className="text-xs mt-1">{message}</p>}
    </div>
  );
}
