import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SendToMakeButton from "@/components/SendToMakeButton";

export function PlanViewer() {
  const { typ, id } = useParams(); // URL: /plans/:typ/:id
  const [plan, setPlan] = useState<any | null>(null);

  useEffect(() => {
    const loadPlan = async () => {
      if (!typ || !id) return;

      let table = "";
      switch (typ) {
        case "month":
          table = "month_plans";
          break;
        case "week":
          table = "week_plans";
          break;
        case "day":
          table = "day_plans";
          break;
        default:
          console.error("❌ Unbekannter Typ:", typ);
          return;
      }

      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("❌ Fehler beim Laden des Plans:", error);
        return;
      }
      setPlan(data);
    };

    loadPlan();
  }, [typ, id]);

  if (!plan) {
    return <div className="p-6">⏳ Lade Plan...</div>;
  }

  // Mapping für UI-Ausgabe (damit SendToMakeButton den richtigen Typ kennt)
  const getTypLabel = () => {
    if (typ === "month") return "Monat";
    if (typ === "week") return "Woche";
    if (typ === "day") return "Tag";
    return "Monat"; // fallback
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 space-y-6">
      <CardHeader>
        <CardTitle>
          Plan Details ({getTypLabel()})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="bg-gray-100 p-4 text-sm rounded overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(plan, null, 2)}
        </pre>

        {/* Button zum Senden an Make */}
        <SendToMakeButton plan={plan} typ={getTypLabel() as "Monat" | "Woche" | "Tag"} />
      </CardContent>
    </Card>
  );
}
