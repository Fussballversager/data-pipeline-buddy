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

  // Overrides für Tests
  const [overridePhilosophie, setOverridePhilosophie] = useState<string | null>(null);
  const [overrideAltersstufe, setOverrideAltersstufe] = useState<string | null>(null);
  const [overrideSpielerkader, setOverrideSpielerkader] = useState<number | null>(null);

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

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("team, altersstufe, verein, display_name")
        .eq("user_id", userId)
        .single();

      setSubmission({ ...submissionData, ...profileData });

      // Monatspläne laden
      const { data: months } = await supabase
        .from("month_plans")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: true });

      // Wochenpläne laden
      const { data: weeks } = await supabase
        .from("view_week_plans")
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

        {/* Monatspläne */}
        <div>
          <h3 className="font-medium mb-2">Monatspläne</h3>
          <ul className="space-y-2">
            {monthPlans.map((p) => (
              <li
                key={p.id}
                className={`flex justify-between items-center border rounded p-3 shadow-sm
                  ${p.last_run_at ? "bg-gray-600" : "bg-gray-700"} text-gray-100`}
              >
                <div className="flex flex-col text-sm">
                  <span className="font-medium">
                    {p.month_year}: {p.fokus || "–"} – {p.schwachstellen || "–"}
                  </span>
                  <span>
                    Kader: {p.spielerkader ?? "–"} | TW: {p.torhueter ?? "–"} |{" "}
                    {p.tage_pro_woche ?? "–"}x/Woche | {p.einheit_dauer ?? "–"} Min{" "}
                    {p.last_run_at && (
                      <span className="text-green-400 font-medium">
                        – KI genutzt am {new Date(p.last_run_at).toLocaleDateString()}
                      </span>
                    )}
                  </span>
                </div>
                {submission && (
                  <SendToMakeButton
                    plan={p}
                    typ="Monat"
                    submission={submission}
                    overrides={{
                      overridePhilosophie,
                      overrideAltersstufe,
                      overrideSpielerkader,
                    }}
                  />
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
          <h3 className="font-medium mb-2">Wochenpläne</h3>
          <ul className="space-y-2">
            {weekPlans.map((p) => {
              const monthYear = monthPlans.find((m) => m.id === p.month_plan_id)?.month_year;
              return (
                <li
                  key={p.id}
                  className={`flex justify-between items-center border rounded p-3 shadow-sm
                    ${p.last_run_at ? "bg-gray-600" : "bg-gray-700"} text-gray-100`}
                >
                  <div className="flex flex-col max-w-[70%]">
                    <span className="font-medium truncate">
                      {monthYear ?? "?"} – KW {p.calendar_week ?? "?"}: {p.trainingsziel || "kein Ziel"}
                    </span>
                    {p.last_run_at && (
                      <span className="text-green-400">
                        KI genutzt am {new Date(p.last_run_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {submission && (
                    <SendToMakeButton
                      plan={{ ...p, month_year: monthYear }}
                      typ="Woche"
                      submission={submission}
                      overrides={{
                        overridePhilosophie,
                        overrideAltersstufe,
                        overrideSpielerkader,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tagespläne */}
        <div>
          <h3 className="font-medium mb-2">Tagespläne</h3>
          <ul className="space-y-2">
            {dayPlans.map((p) => (
              <li
                key={p.id}
                className={`flex justify-between items-center border rounded p-3 shadow-sm
                  ${p.last_run_at ? "bg-gray-600" : "bg-gray-700"} text-gray-100`}
              >
                <div className="flex flex-col max-w-[70%]">
                  <span className="font-medium truncate">
                    {p.training_date} – Ziel: {p.trainingsziel?.slice(0, 40) || "kein Ziel"}
                  </span>
                  {p.last_run_at && (
                    <span className="text-green-400">
                      KI genutzt am {new Date(p.last_run_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {submission && (
                  <SendToMakeButton
                    plan={p}
                    typ="Tag"
                    submission={submission}
                    overrides={{
                      overridePhilosophie,
                      overrideAltersstufe,
                      overrideSpielerkader,
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Debug Payload */}
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
