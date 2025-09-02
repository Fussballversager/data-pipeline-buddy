import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Abschnitt {
  abschnitt_nr: number;
  abschnitt_dauer: number;
  trainingsziel: string;
  spielform: string;
  organisation: string;
  ablauf: string;
  zielerfolg: string;
  coachingpunkte: string;
  varianten: string;
}

interface TrainingDay {
  day_plan_id: string;
  training_date: string;
  tagesziel: string;
  einheit_dauer: number;
  spielerkader: number;
  torhueter: number;
  abschnitte: Abschnitt[];
}

export function TrainingDayOverview({ dayPlanId }: { dayPlanId: string }) {
  const [data, setData] = useState<TrainingDay | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("training_day_overview_json")
        .select("*")
        .eq("day_plan_id", dayPlanId)
        .single();

      if (!error && data) {
        setData(data as TrainingDay);
      } else {
        console.error(error);
      }
    };

    fetchData();
  }, [dayPlanId]);

  if (!data) return <p>Lade Trainingstag...</p>;

  return (
    <Card className="max-w-3xl mx-auto p-6 space-y-6">
      <CardHeader>
        <CardTitle>
          Trainingstag {data.training_date} – Ziel: {data.tagesziel}
        </CardTitle>
        <p>
          Dauer: {data.einheit_dauer} Min · Kader: {data.spielerkader} Spieler ·
          Torhüter: {data.torhueter}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.abschnitte.map((a) => (
          <div
            key={a.abschnitt_nr}
            className="border p-4 rounded-lg shadow-sm space-y-2"
          >
            <h3 className="font-bold">
              Abschnitt {a.abschnitt_nr} ({a.abschnitt_dauer} Min) – {a.spielform}
            </h3>
            <p><span className="font-semibold">Trainingsziel:</span> {a.trainingsziel}</p>
            <p><span className="font-semibold">Organisation:</span> {a.organisation}</p>
            <p><span className="font-semibold">Ablauf:</span> {a.ablauf}</p>
            <p><span className="font-semibold">Zielerfolg:</span> {a.zielerfolg}</p>
            <p><span className="font-semibold">Coaching:</span> {a.coachingpunkte}</p>
            <p><span className="font-semibold">Varianten:</span> {a.varianten}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
