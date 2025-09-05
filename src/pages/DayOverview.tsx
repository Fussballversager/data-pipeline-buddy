import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/DeleteButton";

export function DayOverview() {
  const { weekId } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState<any[]>([]);
  const [week, setWeek] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!weekId) {
        console.error("⚠️ Kein weekId in den Params!");
        return;
      }

      const { data: weekData, error: weekError } = await supabase
        .from("view_week_plans")
        .select("*")
        .eq("id", weekId)
        .single();

      if (!weekError) setWeek(weekData);

      const { data: dayData, error: dayError } = await supabase
        .from("day_plans")
        .select("*")
        .eq("week_plan_id", weekId)
        .order("training_date", { ascending: true });

      if (!dayError) setDays(dayData ?? []);

      setLoading(false);
    };
    load();
  }, [weekId]);

  if (loading) return <div className="p-6 text-gray-200">⏳ Lade Trainingstage...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100">
          Trainingstage – KW {week?.calendar_week ?? "?"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {days.length === 0 && (
          <p className="text-gray-400">Keine Trainingstage vorhanden</p>
        )}

        <div className="space-y-3">
          {days.map((d) => (
            <div
              key={d.id}
              className="border rounded p-4 bg-gray-700 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {d.training_date
                    ? new Date(d.training_date).toLocaleDateString()
                    : "?"}
                </h3>
                <p className="text-base text-gray-200">
                  <b>Ziel:</b> {d.trainingsziel || "–"}
                </p>
                {week && (
                  <>
                    <p className="text-base text-gray-200">
                      <b>Schwerpunkte:</b>{" "}
                      {[week.schwerpunkt1, week.schwerpunkt2, week.schwerpunkt3]
                        .filter(Boolean)
                        .join(", ") || "–"}
                    </p>
                    <p className="text-sm text-gray-400">
                      <b>Kader:</b> {d.spielerkader ?? "–"} Spieler,{" "}
                      {week.torhueter ?? "–"} TW | {week.einheit_dauer ?? "–"} Min
                    </p>
                  </>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="bg-blue-600 text-white"
                  onClick={() => navigate(`/day/${d.id}`)}
                >
                  Ansehen
                </Button>
                <DeleteButton
                  label="Löschen"
                  onConfirm={async () => {
                    const { error } = await supabase
                      .from("day_plans")
                      .delete()
                      .eq("id", d.id);
                    if (!error) setDays(days.filter((x) => x.id !== d.id));
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Link
            to={`/weeks/${week?.month_plan_id}`}
            className="text-blue-400 hover:text-blue-200 underline"
          >
            ← Zurück zu Wochen
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
