import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function MonthDetail() {
  const { monthId } = useParams();
  const [month, setMonth] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!monthId) return;

      const { data, error } = await supabase
        .from("view_month_plans")
        .select("*")
        .eq("id", monthId)
        .single();

      if (error) {
        console.error("❌ Fehler beim Laden des Monats:", error);
      } else {
        setMonth(data);
      }
    };
    load();
  }, [monthId]);

  if (!month) return <div className="p-6 text-gray-200">⏳ Lade Monat...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100">
          Monat {month.month_year}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Ziele & Inhalte */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Ziele & Inhalte</h3>
          <p className="text-base text-gray-200"><b>Fokus:</b> {month.fokus || "–"}</p>
          <p className="text-base text-gray-200"><b>Schwachstellen:</b> {month.schwachstellen || "–"}</p>
          <p className="text-base text-gray-200"><b>Notizen:</b> {month.notizen || "–"}</p>
        </section>

        {/* Rahmenbedingungen */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Rahmenbedingungen</h3>
          <p className="text-base text-gray-200"><b>Kadergröße:</b> {month.spielerkader ?? "–"}</p>
          <p className="text-base text-gray-200"><b>Torhüter:</b> {month.torhueter ?? "–"}</p>
          <p className="text-base text-gray-200"><b>Tage pro Woche:</b> {month.tage_pro_woche ?? "–"}</p>
          <p className="text-base text-gray-200"><b>Dauer pro Einheit:</b> {month.einheit_dauer ?? "–"} Min</p>
        </section>

        {/* Stammdaten */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Stammdaten</h3>
          <p className="text-base text-gray-200"><b>Saisonphase:</b> {month.saisonphase || "–"}</p>
          <p className="text-base text-gray-200"><b>Altersstufe:</b> {month.altersstufe || "–"}</p>
          <p className="text-base text-gray-200"><b>Spielidee:</b> {month.spielidee || "–"}</p>
          <p className="text-base text-gray-200"><b>Formation:</b> {month.match_formation || "–"}</p>
          <p className="text-base text-gray-200"><b>Philosophie:</b> {month.trainingsphilosophie || "–"}</p>
          <p className="text-base text-gray-200"><b>Platz:</b> {month.platz || "–"}</p>
        </section>

        {/* Meta */}
        <section>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Meta</h3>
          <p className="text-sm text-gray-400">
            <b>Erstellt am:</b>{" "}
            {month.created_at
              ? new Date(month.created_at).toLocaleDateString()
              : "–"}
          </p>
        </section>

        {/* Zurück */}
        <div className="mt-6">
          <Link
            to="/months"
            className="text-blue-400 hover:text-blue-200 underline"
          >
            ← Zurück zu Monaten
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
