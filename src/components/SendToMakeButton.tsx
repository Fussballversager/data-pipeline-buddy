import React, { useState } from "react";
import { mapPlanToPayload } from "@/utils/mapPlanToPayload";
import { supabase } from "@/integrations/supabase/client";

async function checkPlanReady(plan: any, type: "month" | "week" | "day") {
  if (type === "month") {
    // ✅ Für Monat NICHT über temp-id, sondern über (user_id, month_year) prüfen
    const { data } = await supabase
      .from("month_plans")
      .select("id")
      .eq("user_id", plan.user_id)
      .eq("month_year", plan.month_year)
      .limit(1);
    return !!(data && data.length > 0);
  }

  if (type === "week") {
    const { data } = await supabase
      .from("day_plans")
      .select("id")
      .eq("week_plan_id", plan.id);
    return !!(data && data.length > 0);
  }

  if (type === "day") {
    const { data } = await supabase
      .from("sections")
      .select("id")
      .eq("day_id", plan.id)
      .eq("abschnitt_nr", 8);
    return !!(data && data.length > 0);
  }

  return false;
}

async function waitForPlanData(
  plan: any,
  type: "month" | "week" | "day",
  setStatus: React.Dispatch<React.SetStateAction<"idle" | "processing" | "done" | "error">>
): Promise<boolean> {
  setStatus("processing");
  const maxAttempts = 50; // ~2 min
  const delay = 6000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const ready = await checkPlanReady(plan, type);
    if (ready) {
      setStatus("done");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  setStatus("done"); // ✅ Nicht als Fehler markieren
  console.warn("⏳ Plan wurde nach 4 Minuten noch nicht gefunden – Make läuft vermutlich noch weiter.");
  return false;
}

const TYPE_TO_LABEL = {
  month: "Monat",
  week: "Woche",
  day: "Tag",
} as const;

interface SendToMakeButtonProps {
  plan: any;
  type: "month" | "week" | "day";
  typ: "Monat" | "Woche" | "Tag";
  submission: any; // erwartet { submissionData?, profileData? }
  overrides: {
    overridePhilosophie?: string | null;
    overrideAltersstufe?: string | null;
    overrideSpielerkader?: number | null;
  };
  buttonLabel?: string;
  className?: string;
  onComplete?: () => void;
}

export default function SendToMakeButton({
  plan,
  type,
  typ,
  submission,
  overrides,
  buttonLabel = "An Taggy-KI senden",
  className = "bg-green-600 hover:bg-green-700 text-white",
  onComplete,
}: SendToMakeButtonProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");

  const handleSend = async () => {
    setStatus("processing");

    try {
      // 🔎 Stammdaten + Profil flachziehen
      const stammdaten = submission?.submissionData ?? {};
      const profil = submission?.profileData ?? {};

      // 🔁 Base zusammenführen + sinnvolle Fallbacks
      const mergedBase = {
        ...stammdaten,
        ...profil,
        ...plan,
      };

      const mergedWithFallbacks = {
        ...mergedBase,
        altersstufe:
          overrides?.overrideAltersstufe ??
          mergedBase.altersstufe ??
          "–",
        trainingsphilosophie:
          overrides?.overridePhilosophie ??
          mergedBase.trainingsphilosophie ??
          "–",
        spielerkader:
          overrides?.overrideSpielerkader ??
          mergedBase.spielerkader ??
          18,
        torhueter: mergedBase.torhueter ?? 0,
        tage_pro_woche: mergedBase.tage_pro_woche ?? 3,
        einheit_dauer: mergedBase.einheit_dauer ?? 90,
        anzahl_monate: mergedBase.anzahl_monate ?? 1,
        anzahl_abschnitte: mergedBase.anzahl_abschnitte ?? 1,
      };

      const labelForPayload = (typ ?? TYPE_TO_LABEL[type]) as "Monat" | "Woche" | "Tag";
      const payload = mapPlanToPayload(mergedWithFallbacks, labelForPayload, overrides, submission);

      // Debug-Log zur Kontrolle
      console.log("📦 SEND TO MAKE DEBUG (final payload):", {
        typ,
        spielerkader: payload.spielerkader,
        source_submission: submission?.submissionData?.spielerkader,
        source_plan: plan?.spielerkader,
        source_override: overrides?.overrideSpielerkader
      });


      const response = await fetch("https://hook.eu2.make.com/x0ec5ntg8y8sqcl94nqeh6u57tqmnwg1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Fehler beim Senden");

      const ok = await waitForPlanData(mergedWithFallbacks, type, setStatus);
      if (ok && onComplete) onComplete();
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

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
