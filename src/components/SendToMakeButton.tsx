import React, { useState } from "react";
import { mapPlanToPayload } from "@/utils/mapPlanToPayload";
import { supabase } from "@/integrations/supabase/client";

async function checkPlanReady(plan: any, type: "month" | "week" | "day") {
  if (type === "month") {
    const { data } = await supabase.from("view_week_plans").select("id").eq("month_plan_id", plan.id);
    return data && data.length > 0;
  }
  if (type === "week") {
    const { data } = await supabase.from("day_plans").select("id").eq("week_plan_id", plan.id);
    return data && data.length > 0;
  }
if (type === "day") {
  const { data, error } = await supabase
    .from("sections")
    .select("id, abschnitt_nr")
    .eq("day_id", plan.id)
    .eq("abschnitt_nr", 8);
    return data && data.length > 0;
  }
  return false;
}

async function waitForPlanData(
  plan: any,
  type: "month" | "week" | "day",
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "processing" | "done" | "error">>
)

{
  setStatus("processing");
  const maxAttempts = 20;
  const delay = 6000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ready = await checkPlanReady(plan, type);
    if (ready) {
      setStatus("done");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  setStatus("error");
}

const TYPE_TO_LABEL = {
  month: "Monat",
  week: "Woche",
  day: "Tag",
};

interface SendToMakeButtonProps {
  plan: any;
  type: "month" | "week" | "day";
  typ: "Monat" | "Woche" | "Tag";
  submission: any;
  overrides: any;
  buttonLabel?: string;
  className?: string;
}

export default function SendToMakeButton({
  plan,
  type,
  typ,
  submission,
  overrides,
  buttonLabel = "An Taggy-KI senden",
  className = "bg-green-600 hover:bg-green-700 text-white",
}: SendToMakeButtonProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleSend = async () => {
    setStatus("processing");

    try {
      const mergedPlan = { ...submission, ...plan };
      const labelForPayload = (typ ?? TYPE_TO_LABEL[type]) as "Monat" | "Woche" | "Tag";
      const payload = mapPlanToPayload(mergedPlan, labelForPayload, overrides);

      const response = await fetch("https://hook.eu2.make.com/x0ec5ntg8y8sqcl94nqeh6u57tqmnwg1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Fehler beim Senden");

      await waitForPlanData(plan, type, setStatus);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  // Buttonstatus → Text + Farbe
  const getButtonContent = () => {
    switch (status) {
      case "processing":
        return (
          <span className="flex items-center gap-2">
      <span className="animate-bounce text-lg">⚽️</span>
            Verarbeitung läuft …
          </span>
        );
      case "done":
        return "✅ Fertig verarbeitet";
      case "error":
        return "⚠️ Keine Antwort – später prüfen";
      default:
        return buttonLabel;
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case "processing":
        return "bg-yellow-600 cursor-wait text-white";
      case "done":
        return "bg-blue-700 text-white";
      case "error":
        return "bg-red-600 text-white";
      default:
        return className;
    }
  };

  return (
    <button
      onClick={handleSend}
      disabled={status === "processing"}
      className={`min-w-[210px] text-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex justify-center items-center ${getButtonStyle()}`}
    >
      {getButtonContent()}
    </button>
  );
}
