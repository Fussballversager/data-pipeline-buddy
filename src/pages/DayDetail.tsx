import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BreadcrumbNav } from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import SketchesSection from "@/components/SketchesSection";
import { SectionSketchInline } from "@/components/SectionSketchInline";

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

  // Prüfen, ob es parallele Abschnitte (2,4,6) gibt
  const hasVariationSections = sections.some((sec) =>
    [2, 4, 6].includes(sec.abschnitt_nr)
  );

  // Hilfsfunktion: trennt Strings in Bulletpoints
  const renderList = (text: string | null, color: string) => (
    <ul className={`list-disc pl-6 space-y-1 text-${color}-300`}>
      {text
        ? text.split(";").map((item, i) =>
            item.trim() ? <li key={i}>{item.trim()}</li> : null
          )
        : <li>–</li>}
    </ul>
  );

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6 bg-gray-800 text-gray-200 print-card">
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

          if (s.abschnitt_nr === 0) {
            title = `Warmup (${s.dauer ?? "–"} Min)`;
          } else if ([1, 2, 3, 4, 5, 6].includes(s.abschnitt_nr)) {
            const spielformCount = sections
              .slice(0, idx + 1)
              .filter((x) => [1, 2, 3, 4, 5, 6].includes(x.abschnitt_nr)).length;
            title = `Spielform ${spielformCount} – ${s.spielform || "–"} (${s.dauer ?? "–"} Min)`;
          } else if (s.abschnitt_nr === 7) {
            title = `Abschlussspiel – ${s.spielform || "–"} (${s.dauer ?? "–"} Min)`;
          } else if (s.abschnitt_nr === 8) {
            title = `Cooldown (${s.dauer ?? "–"} Min)`;
          } else {
            title = `${s.phase || "Abschnitt"} – ${s.spielform || "–"} (${s.dauer ?? "–"} Min)`;
          }

          // 🔹 Parallele Spielformen 2,4,6 (nur bei ungeradem Kader)
          if ([2, 4, 6].includes(s.abschnitt_nr)) {
            return (
              <div key={s.id} className="border rounded p-4 bg-gray-700 text-gray-100">
                <h3 className="text-lg font-bold">{title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">
                    Spieler: {s.hsf_spieler ?? "–"}
                  </p>
                  <p className="parallel-hint text-sm text-orange-400">
                    Parallel zu Spielform {s.abschnitt_nr - 1}
                  </p>
                </div>
<div className="w-full md:w-[22rem] md:float-right md:mb-2 md:ml-2 md:mr-[-24px] lg:w-[24rem] lg:ml-2 lg:mr-[-24px]">
  <SectionSketchInline
    sectionId={s.id}
    abschnittNr={s.abschnitt_nr}
    heightClass="h-[22rem]"
  />
</div>
              {/* Organisation */}
              <div>
                <b>Organisation:</b>
                {renderList(s.organisation, "gray")}
              </div>

                {/* Ablauf */}
                <div className="mt-4">
                  <b>Ablauf:</b>
                  {renderList(s.ablauf, "blue")}
                </div>
              <div className="clear-both" />


              </div>
            );
          }

          // 🔹 Normale Abschnitte
          return (
            <div key={s.id} className="border rounded p-4 bg-gray-700 text-gray-100">
              <h3 className="text-lg font-bold">{title}</h3>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">
                  Spieler: {s.hsf_spieler ?? "–"}
                </p>
                {[1, 3, 5].includes(s.abschnitt_nr) && (
                  hasVariationSections ? (
                    <p className="parallel-hint text-sm text-orange-400">
                      Parallel zu Spielform {s.abschnitt_nr + 1}
                    </p>
                  ) : (
                    <p className="parallel-hint text-sm text-orange-400">
                      Parallel auf 2 Feldern (Kader geteilt)
                    </p>
                  )
                )}
              </div>
<div className="w-full lg:w-80 lg:float-right lg:ml-4 lg:mb-2">
  <SectionSketchInline
    sectionId={s.id}
    abschnittNr={s.abschnitt_nr}
    heightClass="h-[22rem]"
  />
</div>

              {/* Organisation */}
              <div>
                <b>Organisation:</b>
                {renderList(s.organisation, "gray")}
              </div>

              {/* Ablauf */}
              <div className="mt-4">
                <b>Ablauf:</b>
                {renderList(s.ablauf, "blue")}
              </div>

              {/* Zielerfolg */}
              {[1, 3, 5].includes(s.abschnitt_nr) && (
                <div className="mt-4">
                  <b>Zielerfolg:</b>
                  {renderList(s.zielerfolg, "yellow")}
                </div>
              )}

              {/* Coachingpunkte */}
              {[1, 3, 5, 7].includes(s.abschnitt_nr) && (
                <div className="mt-4">
                  <b>Coachingpunkte:</b>
                  {renderList(s.coachingpunkte, "green")}
                </div>
              )}

              {/* Varianten */}
              {[1, 3, 5, 7].includes(s.abschnitt_nr) && (
                <div className="mt-4">
                  <b>Varianten:</b>
                  {renderList(s.varianten, "purple")}
                </div>
              )}
<div className="clear-both" />

            </div>
          );
        })}
        <SketchesSection sections={sections} />

        {/* Aktionen */}
        <div className="mt-6 flex gap-4">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.print()}
          >
            Als PDF exportieren
          </Button>

          <Link
            to={`/days/${day.week_plan_id}`}
            className="text-blue-400 hover:text-blue-200 underline self-center no-print"
          >
            ← Zurück zu Tagen
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

