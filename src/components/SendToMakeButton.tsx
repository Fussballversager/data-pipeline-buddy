import React, { useState } from "react";
import { mapPlanToPayload } from "@/utils/mapPlanToPayload";
import { supabase } from "@/integrations/supabase/client";

// NEU: Polling-Check je nach Typ
async function checkPlanReady(plan: any, type: "month" | "week" | "day") {
  if (type === "month") {
    const { data } = await supabase
      .from("view_week_plans")
      .select("id")
      .eq("month_plan_id", plan.id);
    return data && data.length > 0;
  }

  if (type === "week") {
    const { data } = await supabase
      .from("day_plans")
      .select("id")
      .eq("week_plan_id", plan.id);
    return data && data.length > 0;
  }

  if (type === "day") {
    const { data } = await supabase
      .from("viz_section_package")
      .select("id")
      .eq("day_plan_id", plan.id);
    return data && data.length > 0;
  }

  return false;
}

async function waitForPlanData(plan: any, type: "month" | "week" | "day", setMessage: (msg: string) => void) {
  setMessage("⏳ Warte auf Verarbeitung …");
  const maxAttempts = 20;
  const delay = 6000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ready = await checkPlanReady(plan, type);
    if (ready) {
      setMessage("✅ Fertig verarbeitet!");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  setMessage("⚠️ Keine Antwort – bitte später prüfen.");
}

const TYPE_TO_LABEL = {
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
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSend = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const mergedPlan = { ...submission, ...plan };
      const labelForPayload = typ ?? TYPE_TO_LABEL[type];
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
      waitForPlanData(plan, type, setMessage); // NEU: Starte Polling

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