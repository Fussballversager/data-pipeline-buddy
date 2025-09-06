import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SendToMakeButton from "@/components/SendToMakeButton"; 
import { mapPlanToPayload } from "../utils/mapPlanToPayload"; // 👈 korrekt

export function PlanManager() {
  const [monthPlans, setMonthPlans] = useState<any[]>([]);
  const [weekPlans, setWeekPlans] = useState<any[]>([]);
  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [submission, setSubmission] = useState<any | null>(null); // 👈 Stammdaten

  const [newMonthYear, setNewMonthYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [tageProWoche, setTageProWoche] = useState<number>(3);
  const [einheitDauer, setEinheitDauer] = useState<number>(90);
  const [spielerkader, setSpielerkader] = useState<number>(18);
  const [torhueter, setTorhueter] = useState<number>(2);

  // zuletzt gesendetes Payload für Debug
  const [lastPayload, setLastPayload] = useState<any | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      // Stammdaten laden
      const { data: submissionData } = await supabase
        .from("taggy_submissions")
        .select("*")
        .eq("user_id", userId)
        .single();
      setSubmission(submissionData);

      // Monatspläne laden
      const { data: months } = await supabase
        .from("month_plans")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: true });

      // Wochenpläne laden
      const { data: weeks } = await supabase
        .from("week_plans")
        .select("*")
        .eq("user_id", userId)
        .order("calendar_week", { ascending: true });

      // Tagespläne laden
      const { data: days } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", userId)
        .order("training_date", { ascending: true });

      setMonthPlans(months || []);
      setWeekPlans(weeks || []);
      setDayPlans(days || []);
    };

    loadPlans();
  }, []);

  // Monatsplan anlegen
  const createMonthPlan = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user || !newMonthYear) {
      setMessage("❌ Bitte Monat eingeben (YYYY-MM)");
      return;
    }
    const userId = userData.user.id;

    setLoading(true);
    setMessage(null);

    const { data: submission } = await supabase
      .from("taggy_submissions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!submission) {
      setMessage("❌ Keine Stammdaten gefunden");
      setLoading(false);
      return;
    }

    const payload = mapPlanToPayload(
      {
        ...submission,
        month_year: newMonthYear,
        user_id: userId,
        fokus: submission.fokus ?? "–",
        schwachstellen: submission.schwachstellen ?? "–",
        notizen: submission.notizen ?? null,
        spielerkader: submission.spielerkader ?? spielerkader,
        torhueter: submission.torhueter ?? torhueter,
        tage_pro_woche: submission.tage_pro_woche ?? tageProWoche,
        einheit_dauer: submission.einheit_dauer ?? einheitDauer,
      },
      "Monat"
    );

    setLastPayload(payload);

    try {
      const response = await fetch(
        "https://hook.eu2.make.com/jr6wvnrr27mc7wr0r73pkstjb2o75z5p",
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
      <CardContent className="space-y-8">

        {/* Monatspläne */}
        <div>
          <h3 className="font-bold text-lg mb-2">Monatspläne</h3>
          <ul className="space-y-2">
            {monthPlans.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.month_year}</span>
                {submission && (
                  <SendToMakeButton plan={p} typ="Monat" submission={submission} />
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2 items-center">
            <Input
              placeholder="YYYY-MM"
              value={newMonthYear}
              onChange={(e) => setNewMonthYear(e.target.value)}
            />
            <Button
              onClick={createMonthPlan}
              disabled={loading}
              className="bg-green-600 text-white"
            >
              {loading ? "Sende..." : "Neuen Monat anlegen"}
            </Button>
          </div>
          {message && <p className="mt-2">{message}</p>}
        </div>

        {/* Wochenpläne */}
        <div>
          <h3 className="font-bold text-lg mb-2">Wochenpläne</h3>
          <ul className="space-y-2">
            {weekPlans.map((p) => {
              const monthYear = monthPlans.find(m => m.id === p.month_plan_id)?.month_year;
              return (
                <li key={p.id} className="flex justify-between items-center cursor-pointer">
                  <span>
                    {monthYear ?? "?"} – KW {p.calendar_week ?? "?"} –{" "}
                    {p.trainingsziel ? p.trainingsziel.slice(0, 40) : "kein Ziel"}
                  </span>
                  {submission && (
                    <SendToMakeButton
                      plan={{ ...p, month_year: monthYear }}
                      typ="Woche"
                      submission={submission}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tagespläne */}
        <div>
          <h3 className="font-bold text-lg mb-2">Tagespläne</h3>
          <ul className="space-y-2">
            {dayPlans.map((p) => (
              <li key={p.id} className="flex justify-between items-center">
                <span>
                  {p.training_date} – Ziel: {p.trainingsziel?.slice(0, 30)}...
                </span>
                {submission && (
                  <SendToMakeButton plan={p} typ="Tag" submission={submission} />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Debug Payload */}
        {lastPayload && (
          <div className="mt-6">
            <h4 className="font-bold">Letztes gesendetes Payload</h4>
            <pre className="bg-gray-100 p-3 text-xs rounded overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(lastPayload, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
