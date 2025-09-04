import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";

export function DayDetail() {
  const { dayId } = useParams();
  const [day, setDay] = useState<any | null>(null);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!dayId) return;

      // Tagesdaten laden
      const { data: dayData, error: dayError } = await supabase
        .from("day_plans")
        .select("*")
        .eq("id", dayId)
        .single();

      if (dayError) {
        console.error("❌ Fehler beim Laden des Tages:", dayError);
        return;
      }
      setDay(dayData);

      // Abschnitte laden
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select("*")
        .eq("day_id", dayId)
        .order("abschnitt_nr", { ascending: true });

      if (sectionError) {
        console.error("❌ Fehler beim Laden der Abschnitte:", sectionError);
      } else {
        setSections(sectionData || []);
      }
    };
    load();
  }, [dayId]);

  if (!day) return <div className="p-6 text-gray-200">⏳ Lade Trainingstag...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200">
      {/* Header */}
<CardHeader className="border-b border-gray-700 pb-4">
  <CardTitle className="text-xl font-bold text-gray-100">
    Trainingstag {day.training_date}
  </CardTitle>
  <p className="text-gray-300 mt-1">
    Ziel: {day.trainingsziel || "–"}
  </p>
</CardHeader>

      <CardContent className="space-y-6">
        {/* Breadcrumb */}
        <BreadcrumbNav
          items={[
            { label: "Tage", to: `/days/${day.week_plan_id}` },
            { label: day.training_date },
          ]}
        />

        {/* Abschnitte */}
        {sections.map((s, idx) => {
          let title = "";

          if (s.phase?.toLowerCase() === "warmup") {
            // Warmup ohne Spielform
            title = `${s.phase} (${s.dauer ?? "–"} Min)`;
          } else if (s.phase?.toLowerCase() === "spielform") {
            // Spielformen durchnummerieren
            const spielformCount = sections
              .slice(0, idx + 1)
              .filter(x => x.phase?.toLowerCase() === "spielform").length;

            title = `${s.phase} ${spielformCount} – ${s.spielform || "–"} (${s.dauer ?? "–"} Min)`;
          } else {
            // Alle anderen Phasen normal
            title = `${s.phase} – ${s.spielform || "–"} (${s.dauer ?? "–"} Min)`;
          }

          return (
            <div key={s.id} className="border rounded p-4 bg-gray-700 text-gray-100">
              <h3 className="font-semibold mb-2">{title}</h3>
              <p><b>Organisation:</b> {s.organisation || "–"}</p>
              <p><b>Ablauf:</b> {s.ablauf || "–"}</p>
              <p><b>Coachingpunkte:</b> {s.coachingpunkte || "–"}</p>
              <p><b>Varianten:</b> {s.varianten || "–"}</p>
            </div>
          );
        })}

        {/* Zurück */}
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
