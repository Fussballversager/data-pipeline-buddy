// 🧩 Deprecated – PlanViewer wird aktuell nicht mehr verwendet (Stand: Okt 2025)

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SendToMakeButton from "@/components/SendToMakeButton";

type PlanType = "month" | "week" | "day";
const VALID_TYPES: PlanType[] = ["month", "week", "day"] as const;

export function PlanViewer() {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type?: string; id?: string }>();

  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Technischer Typ verifiziert
  const planType = useMemo<PlanType | null>(() => {
    if (!type || !VALID_TYPES.includes(type as PlanType)) return null;
    return type as PlanType;
  }, [type]);

  // Deutsches Label nur für UI
  const planLabel = useMemo(() => {
    switch (planType) {
      case "month": return "Monat";
      case "week":  return "Woche";
      case "day":   return "Tag";
      default:      return "Unbekannt";
    }
  }, [planType]);

  useEffect(() => {
    const loadPlan = async () => {
      setLoading(true);
      setErrorMsg(null);

      if (!planType || !id) {
        setErrorMsg("Ungültige URL: type oder id fehlt/inkorrekt.");
        setLoading(false);
        return;
      }

      const table =
        planType === "month" ? "month_plans" :
        planType === "week"  ? "week_plans"  :
                               "day_plans";

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Fehler beim Laden des Plans:", error);
        setErrorMsg("Plan konnte nicht geladen werden.");
        setLoading(false);
        return;
      }

      setPlan(data);
      setLoading(false);
    };

    loadPlan();
  }, [planType, id]);

  // Optional: bei ungültigem Typ zurückleiten
  useEffect(() => {
    if (type && !planType) {
      console.warn("Ungültiger Typ in URL:", type);
      // navigate("/plans/week"); // falls gewünscht
    }
  }, [type, planType, navigate]);

  if (loading) return <div className="p-6">⏳ Lade Plan…</div>;
  if (errorMsg) return <div className="p-6 text-red-600">⚠️ {errorMsg}</div>;
  if (!plan) return <div className="p-6">Kein Plan gefunden.</div>;

  return (
    <Card className="max-w-3xl mx-auto p-6 space-y-6">
      <CardHeader>
        <CardTitle>Plan Details ({planLabel})</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <pre className="bg-gray-100 p-4 text-sm rounded overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(plan, null, 2)}
        </pre>

        {/* Wichtig: Button bekommt den technischen Typ */}
        <SendToMakeButton plan={plan} type={planType} />
      </CardContent>
    </Card>
  );
}