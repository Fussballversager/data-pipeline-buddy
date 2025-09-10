import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/DeleteButton";

export function WeekOverview() {
  const { monthId } = useParams();
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<any[]>([]);
  const [month, setMonth] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!monthId) {
        console.error("⚠️ Kein monthId in den Params!");
        return;
      }

      // Monat laden
      const { data: monthData, error: monthError } = await supabase
        .from("view_month_plans")
        .select("*")
        .eq("id", monthId)
        .single();

      if (monthError) {
        console.error("❌ Fehler beim Laden des Monats:", monthError);
      } else {
        setMonth(monthData);
      }

      // Wochen laden
      const { data: weekData, error: weekError } = await supabase
        .from("view_week_plans")
        .select("*")
        .eq("month_plan_id", monthId)
        .order("calendar_week", { ascending: true });

      if (weekError) {
        console.error("❌ Fehler beim Laden der Wochen:", weekError);
      } else {
        setWeeks(weekData ?? []);
      }

      setLoading(false);
    };
    load();
  }, [monthId]);

  if (loading) return <div className="p-6 text-gray-200">⏳ Lade Wochenpläne...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100">
          Wochenübersicht – Monat {month?.month_year ?? "?"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {weeks.length === 0 && (
          <p className="text-gray-400">Keine Wochenpläne vorhanden</p>
        )}

        <div className="space-y-3">
          {weeks.map((w) => (
            <div
              key={w.id}
              className="border rounded p-4 bg-gray-700 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  KW {w.calendar_week ?? "–"}{" "}
                  {w.week_start_date
                    ? `(ab ${new Date(w.week_start_date).toLocaleDateString()})`
                    : ""}
                </h3>
                <p className="text-base text-gray-200">
                  <b>Ziel:</b> {w.trainingsziel || "–"}
                </p>
<div className="text-base text-gray-200">
  <b>Schwerpunkte:</b>
  {([w.schwerpunkt1, w.schwerpunkt2, w.schwerpunkt3].filter(Boolean).length > 0) ? (
    <ul className="list-disc pl-6 space-y-1">
      {w.schwerpunkt1 && <li className="pl-1">{w.schwerpunkt1}</li>}
      {w.schwerpunkt2 && <li className="pl-1">{w.schwerpunkt2}</li>}
      {w.schwerpunkt3 && <li className="pl-1">{w.schwerpunkt3}</li>}
    </ul>
  ) : (
    " –"
  )}
</div>
                <p className="text-sm text-gray-400">
                  <b>Kader:</b> {w.spielerkader ?? "–"} Spieler,{" "}
                  {w.torhueter ?? "–"} TW | {w.einheit_dauer ?? "–"} Min
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
<Button
  className={`text-white ${
    w.day_count > 0
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-500 cursor-not-allowed"
  }`}
  disabled={w.day_count === 0}
  onClick={() => w.day_count > 0 && navigate(`/days/${w.id}`)}
>
  Tage öffnen
</Button>

                <Button
                  className="bg-gray-600 text-white"
                  onClick={() => navigate(`/week/${w.id}`)}
                >
                  Ansehen
                </Button>

                <DeleteButton
                  label="Löschen"
                  onConfirm={async () => {
                    const { error } = await supabase
                      .from("view_week_plans")
                      .delete()
                      .eq("id", w.id);
                    if (error) {
                      console.error("❌ Fehler beim Löschen:", error);
                    } else {
                      setWeeks(weeks.filter((x) => x.id !== w.id));
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

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
