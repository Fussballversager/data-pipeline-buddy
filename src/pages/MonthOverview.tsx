import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/DeleteButton";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export function MonthOverview() {
  const navigate = useNavigate();
  const [months, setMonths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMonthYear, setNewMonthYear] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("month_plans")
        .select("*")
        .order("month_year", { ascending: true });

      if (error) {
        console.error("❌ Fehler beim Laden der Monate:", error);
      } else {
        setMonths(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!newMonthYear) return;

    const { error } = await supabase
      .from("month_plans")
      .insert([{ month_year: newMonthYear }]);

    if (error) {
      console.error("❌ Fehler beim Anlegen des Monats:", error);
    } else {
      setNewMonthYear("");
      const { data } = await supabase
        .from("month_plans")
        .select("*")
        .order("month_year", { ascending: true });
      setMonths(data || []);
    }
  };

  if (loading) return <div className="p-6 text-gray-200">⏳ Lade Monate...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-100">
          Monatsübersicht
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <BreadcrumbNav items={[{ label: "Saison" }, { label: "Monate" }]} />

        {months.length === 0 && (
          <p className="text-gray-400">Keine Monatspläne vorhanden</p>
        )}

        <div className="space-y-3">
          {months.map((m) => (
            <div
              key={m.id}
              className="border rounded p-4 bg-gray-700 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-100">
                  Monat {m.month_year}
                </h3>
                <p className="text-base text-gray-200">
                  <b>Fokus:</b> {m.fokus || "–"} |{" "}
                  <b>Schwerpunkte:</b> {m.schwachstellen || "–"}
                </p>
                <p className="text-sm text-gray-400">
                  Kader: {m.spielerkader ?? "–"} | TW: {m.torhueter ?? "–"} |{" "}
                  {m.tage_pro_woche ?? "–"}x/Woche | {m.einheit_dauer ?? "–"} Min
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => navigate(`/weeks/${m.id}`)}
                  className="bg-blue-600 text-white hover:bg-green-700"
                >
                  Wochen öffnen
                </Button>
                <Button
                  onClick={() => navigate(`/month/${m.id}`)}
                  className="bg-gray-600 text-white hover:bg-green-700"
                >
                  Ansehen
                </Button>
                <DeleteButton
                  label="Löschen"
                  onConfirm={async () => {
                    const { error } = await supabase
                      .from("month_plans")
                      .delete()
                      .eq("id", m.id);
                    if (error) {
                      console.error("❌ Fehler beim Löschen:", error);
                    } else {
                      setMonths(months.filter((x) => x.id !== m.id));
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}
