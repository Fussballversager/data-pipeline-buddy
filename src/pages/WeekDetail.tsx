import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export function WeekDetail() {
  const { weekId } = useParams();
  const [week, setWeek] = useState<any | null>(null);
  const [month, setMonth] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!weekId) return;

      const { data, error } = await supabase
        .from("view_week_plans")
        .select("*")
        .eq("id", weekId)
        .single();

      if (error) {
        console.error("❌ Fehler beim Laden der Woche:", error);
      } else {
        setWeek(data);

        if (data?.month_plan_id) {
          const { data: monthData, error: monthError } = await supabase
            .from("view_month_plans")
            .select("id, month_year")
            .eq("id", data.month_plan_id)
            .single();

          if (!monthError) setMonth(monthData);
        }
      }
    };
    load();
  }, [weekId]);

  if (!week) return <div className="p-6 text-gray-200">⏳ Lade Woche...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100">
          Woche – KW {week.calendar_week ?? "?"}{" "}
          {week.week_start_date
            ? `(ab ${new Date(week.week_start_date).toLocaleDateString()})`
            : ""}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <BreadcrumbNav
          items={[
            { label: "Monate", to: "/months" },
            { label: `Monat ${month?.month_year ?? "?"}`, to: `/weeks/${week.month_plan_id}` },
            { label: `KW ${week.calendar_week ?? "?"}` },
          ]}
        />

        {/* Ziele & Inhalte */}
        <section>
          <h3 className="font-semibold text-gray-100 mb-2">Ziele & Inhalte</h3>
          <p><b>Ziel:</b> {week.trainingsziel || "–"}</p>
          <p><b>Schwerpunkt 1:</b> {week.schwerpunkt1 || "–"}</p>
          <p><b>Schwerpunkt 2:</b> {week.schwerpunkt2 || "–"}</p>
          <p><b>Schwerpunkt 3:</b> {week.schwerpunkt3 || "–"}</p>
        </section>

        {/* Rahmenbedingungen */}
        <section>
          <h3 className="font-semibold text-gray-100 mb-2">Rahmenbedingungen</h3>
          <p><b>Kadergröße:</b> {week.spielerkader ?? "–"}</p>
          <p><b>Torhüter:</b> {week.torhueter ?? "–"}</p>
          <p><b>Tage pro Woche:</b> {week.tage_pro_woche ?? "–"}</p>
          <p><b>Dauer pro Einheit:</b> {week.einheit_dauer ?? "–"} Min</p>
        </section>

        {/* Stammdaten */}
        <section>
          <h3 className="font-semibold text-gray-100 mb-2">Stammdaten</h3>
          <p><b>Saisonphase:</b> {week.saisonphase || "–"}</p>
          <p><b>Altersstufe:</b> {week.altersstufe || "–"}</p>
          <p><b>Spielidee:</b> {week.spielidee || "–"}</p>
          <p><b>Formation:</b> {week.match_formation || "–"}</p>
          <p><b>Philosophie:</b> {week.trainingsphilosophie || "–"}</p>
        </section>

        {/* Meta */}
        <section>
          <h3 className="font-semibold text-gray-100 mb-2">Meta</h3>
          <p>
            <b>Erstellt am:</b>{" "}
            {week.created_at
              ? new Date(week.created_at).toLocaleDateString()
              : "–"}
          </p>
        </section>

        {/* Zurück */}
        <div className="mt-6">
          <Link
            to={`/weeks/${week.month_plan_id}`}
            className="text-blue-400 hover:text-blue-200 underline"
          >
            ← Zurück zu Wochen
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
