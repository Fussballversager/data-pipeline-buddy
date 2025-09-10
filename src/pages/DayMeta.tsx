import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export function DayMeta() {
  const { dayId } = useParams();
  const [day, setDay] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!dayId) return;

      const { data, error } = await supabase
        .from("view_day_plans")
        .select("*")
        .eq("id", dayId)
        .single();

      if (error) {
        console.error("❌ Fehler beim Laden des Trainingstags:", error);
      } else {
        setDay(data);
      }
    };
    load();
  }, [dayId]);

  if (!day) return <div className="p-6 text-gray-200">⏳ Lade Trainingstag...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      <CardHeader className="border-b border-gray-700 pb-4">
        <CardTitle className="text-xl font-bold text-gray-100">
          Trainingstag – {day.training_date}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Breadcrumb */}
        <BreadcrumbNav
          items={[
            { label: "Tage", to: `/days/${day.week_plan_id}` },
            { label: day.training_date },
          ]}
        />

        {/* Ziele & Inhalte */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Ziele & Inhalte</h3>
          <p><b>Ziel:</b> {day.trainingsziel || "–"}</p>
          <p><b>Schwerpunkt 1:</b> {day.schwerpunkt1 || "–"}</p>
          <p><b>Schwerpunkt 2:</b> {day.schwerpunkt2 || "–"}</p>
          <p><b>Schwerpunkt 3:</b> {day.schwerpunkt3 || "–"}</p>
        </section>

        {/* Rahmenbedingungen */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Rahmenbedingungen</h3>
          <p><b>Kadergröße:</b> {day.spielerkader ?? "–"}</p>
          <p><b>Torhüter:</b> {day.torhueter ?? "–"}</p>
          <p><b>Dauer pro Einheit:</b> {day.einheit_dauer ?? "–"} Min</p>
        </section>

        {/* Stammdaten */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Stammdaten</h3>
          <p><b>Saisonphase:</b> {day.saisonphase || "–"}</p>
          <p><b>Altersstufe:</b> {day.altersstufe || "–"}</p>
          <p><b>Spielidee:</b> {day.spielidee || "–"}</p>
          <p><b>Formation:</b> {day.match_formation || "–"}</p>
          <p><b>Philosophie:</b> {day.trainingsphilosophie || "–"}</p>
        </section>

        {/* Meta */}
        <section>
          <h3 className="text-lg font-semibold mb-2">Meta</h3>
          <p className="text-sm text-gray-400">
            Erstellt am:{" "}
            {day.created_at
              ? new Date(day.created_at).toLocaleDateString()
              : "–"}
          </p>
        </section>

        <div className="mt-6">
          <Link
            to={`/days/${day.week_plan_id}`}
            className="text-blue-400 hover:text-blue-200 underline"
          >
            ← Zurück zu Tagen
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
