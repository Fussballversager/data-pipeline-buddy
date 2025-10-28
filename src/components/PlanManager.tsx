import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SendToMakeButton from "@/components/SendToMakeButton";
import { mapPlanToPayload } from "../utils/mapPlanToPayload";

export function PlanManager() {
  const [monthPlans, setMonthPlans] = useState<any[]>([]);
  const [weekPlans, setWeekPlans] = useState<any[]>([]);
  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [submission, setSubmission] = useState<any | null>(null);
  const [newMonthYear, setNewMonthYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tageProWoche, setTageProWoche] = useState<number>(3);
  const [einheitDauer, setEinheitDauer] = useState<number>(90);
  const [spielerkader, setSpielerkader] = useState<number>(18);
  const [torhueter, setTorhueter] = useState<number>(2);
  const [overridePhilosophie, setOverridePhilosophie] = useState<string | null>(null);
  const [overrideAltersstufe, setOverrideAltersstufe] = useState<string | null>(null);
  const [overrideSpielerkader, setOverrideSpielerkader] = useState<number | null>(null);
  const [lastPayload, setLastPayload] = useState<any | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      const { data: submissionData } = await supabase
        .from("taggy_submissions")
        .select("*")
        .eq("user_id", userId)
        .single();
      console.log("🧩 submissionData from DB:", submissionData);

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("team, altersstufe, verein, display_name")
        .eq("user_id", userId)
        .single();

      // setSubmission({ ...submissionData, ...profileData });
      // NEU FÜR ANZAHL_MONATE

      setSubmission({ submissionData, profileData, });

      const { data: months } = await supabase
        .from("month_plans")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: true });

      const { data: weeks } = await supabase
        .from("view_week_plans")
        .select("*")
        .eq("user_id", userId);

      const { data: days } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", userId)
        .order("training_date", { ascending: true });

      setMonthPlans(months || []);

      const weeksSorted = [...(weeks || [])].sort((a, b) => {
        const monthA = months?.find((m) => m.id === a.month_plan_id)?.month_year ?? "";
        const monthB = months?.find((m) => m.id === b.month_plan_id)?.month_year ?? "";

        if (monthA < monthB) return -1;
        if (monthA > monthB) return 1;
        return (a.calendar_week ?? 0) - (b.calendar_week ?? 0);
      });

      setWeekPlans(weeksSorted);
      setDayPlans(days || []);
    };

    loadPlans();
  }, []);

  const createMonthPlan = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !newMonthYear) {
      setMessage("❌ Bitte Monat eingeben (YYYY-MM)");
      return;
    }

    const userId = userData.user.id;
    setLoading(true);
    setMessage(null);

    if (!submission?.submissionData) {
      setMessage("❌ Keine Stammdaten geladen");
      setLoading(false);
      return;
    }

    const stammdaten = submission.submissionData;
    const profil = submission.profileData;

    const payload = mapPlanToPayload(
      {
        ...stammdaten,
        ...profil,
        month_year: newMonthYear,
        user_id: userId,
        altersstufe:
          overrideAltersstufe ||
          profil?.altersstufe ||
          stammdaten?.altersstufe ||
          "–",
        trainingsphilosophie:
          overridePhilosophie ||
          stammdaten?.trainingsphilosophie ||
          "–",
        spielerkader:
          overrideSpielerkader ??
          stammdaten?.spielerkader ??
          spielerkader,
        torhueter: stammdaten?.torhueter ?? torhueter,
        tage_pro_woche: stammdaten?.tage_pro_woche ?? tageProWoche,
        einheit_dauer: stammdaten?.einheit_dauer ?? einheitDauer,
        anzahl_monate: stammdaten?.anzahl_monate ?? 1, // Großschreibung wie in DB
      },
      "Monat",
      { overridePhilosophie, overrideAltersstufe, overrideSpielerkader }
    );

    setLastPayload(payload);

    try {
      const response = await fetch(
        "https://hook.eu2.make.com/x0ec5ntg8y8sqcl94nqeh6u57tqmnwg1",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Fehler beim Senden");

      setMessage("✅ Monatsplan an Make gesendet");
      setNewMonthYear("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Fehler beim Senden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-6">
      <CardHeader>
        <CardTitle>Plan Manager</CardTitle>
      </CardHeader>


<CardContent className="space-y-8 text-sm">
  {/* Monatsplanung */}
  <div>
    <h3 className="text-lg font-semibold mb-4">📅 Monatsplanung</h3>

    {monthPlans.map((month) => {
      const weeksInMonth = weekPlans.filter((w) => w.month_plan_id === month.id);

      return (
        <div key={month.id} className="border rounded-lg p-4 mb-6 bg-gray-800 text-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-semibold text-base">
                {month.month_year} – {month.fokus || "Kein Fokus"}
              </h4>
              <p className="text-xs text-gray-300">
                Kader: {month.spielerkader ?? "–"} | TW: {month.torhueter ?? "–"} | {month.tage_pro_woche ?? "–"}x/Woche | {month.einheit_dauer ?? "–"} Min
              </p>
            </div>
<div className="min-w-[210px] text-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-700 text-white flex justify-center items-center shadow-sm">
              Plan erstellt am{" "}
              {new Date(month.created_at ?? month.inserted_at ?? Date.now()).toLocaleDateString()}
            </div>
          </div>

          {/* Wochenplanung */}
          {weeksInMonth.map((week) => {
            const daysInWeek = dayPlans
              .filter((d) => d.week_plan_id === week.id)
              .sort((a, b) => new Date(a.training_date).getTime() - new Date(b.training_date).getTime());

            return (
              <div key={week.id} className="ml-4 mt-4 border-l-2 border-gray-600 pl-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium">
                    🗓 KW {week.calendar_week ?? "?"} – {week.trainingsziel || "kein Wochenziel"}
                  </h5>
                  {submission && (
                    week.last_run_at ? (
<div className="min-w-[210px] text-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-700 text-white flex justify-center items-center shadow-sm">
                        Tagespläne erstellt am {new Date(week.last_run_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <SendToMakeButton
                        plan={{ ...week, month_year: month.month_year }}
                        typ="Woche"
                        type="week"
                        submission={submission}
                        overrides={{ overridePhilosophie, overrideAltersstufe, overrideSpielerkader }}
                        buttonLabel="Tagespläne generieren"
                        className="bg-green-600 text-white"
                      />
                    )
                  )}
                </div>

                {/* Trainingstage */}
                {daysInWeek.length > 0 && (
                  <ul className="space-y-1 ml-4">
                    {daysInWeek.map((day) => (
                      <li key={day.id} className="flex justify-between items-center border rounded p-2 bg-gray-700">
                        <span>
                          {day.training_date} – Trainingsziel: {day.trainingsziel || "kein Ziel"}
                        </span>
                        {submission && (
                          day.last_run_at ? (
<div className="min-w-[210px] text-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-700 text-white flex justify-center items-center shadow-sm">

                              Trainingsprogramm erstellt am {new Date(day.last_run_at).toLocaleDateString()}
                            </div>
                          ) : (
                            <SendToMakeButton
                              plan={day}
                              typ="Tag"
                              type="day"
                              submission={submission}
                              overrides={{ overridePhilosophie, overrideAltersstufe, overrideSpielerkader }}
                              buttonLabel="Trainingsprogramm erstellen"
                              className="bg-green-600 text-white"
                            />
                          )
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      );
    })}

    {/* Monat hinzufügen */}
    <div className="mt-6 flex gap-2 items-center">
      <Input
        placeholder="YYYY-MM"
        value={newMonthYear}
        onChange={(e) => setNewMonthYear(e.target.value)}
      />
      <Button onClick={createMonthPlan} disabled={loading} className="bg-green-600 text-white">
        {loading ? "Sende..." : "Neuen Monat planen"}
      </Button>
    </div>
    {message && <p className="mt-2">{message}</p>}
  </div>

  {/* Debug / Letztes Payload */}
  {lastPayload && (
    <div className="mt-6">
      <h4 className="font-medium">Letztes gesendetes Payload</h4>
      <pre className="bg-gray-100 p-3 text-xs rounded overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(lastPayload, null, 2)}
      </pre>
    </div>
  )}
</CardContent>


    </Card>
  );
}