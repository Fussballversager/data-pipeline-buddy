import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PlanManager() {
  const navigate = useNavigate();

  const [monthPlans, setMonthPlans] = useState<any[]>([]);
  const [weekPlans, setWeekPlans] = useState<any[]>([]);
  const [dayPlans, setDayPlans] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Für neuen Monatsplan
  const [newMonthYear, setNewMonthYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Für Wochenplanung
  const [selectedWeek, setSelectedWeek] = useState<any | null>(null);
  const [tageProWoche, setTageProWoche] = useState<number>(3);
  const [einheitDauer, setEinheitDauer] = useState<number>(90);
  const [spielerkader, setSpielerkader] = useState<number>(18);
  const [torhueter, setTorhueter] = useState<number>(2);
  const [weekStartDate, setWeekStartDate] = useState<string>("");
  const [weekMessage, setWeekMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setUserId(userData.user.id);

      const { data: months } = await supabase
        .from("month_plans")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("month_year", { ascending: true });

      const { data: weeks } = await supabase
        .from("week_plans")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("calendar_week", { ascending: true });

      const { data: days } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("training_date", { ascending: true });

      setMonthPlans(months || []);
      setWeekPlans(weeks || []);
      setDayPlans(days || []);
    };

    loadPlans();
  }, []);

  // 1. Neuer Monatsplan
  const createMonthPlan = async () => {
    if (!userId || !newMonthYear) {
      setMessage("❌ Bitte Monat eingeben (YYYY-MM)");
      return;
    }

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

    const payload = {
      ...submission,
      plan_typ: "Monat",
      month_year: newMonthYear,
    };

    console.log("➡️ Monatsplan Payload", payload);

    try {
      const response = await fetch("https://hook.eu2.make.com/jr6wvnrr27mc7wr0r73pkstjb2o75z5p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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

  // 2. Neue Woche für ausgewählten Monat
  const sendWeekPlan = async () => {
    if (!selectedWeek || !weekStartDate) {
      setWeekMessage("❌ Bitte Woche auswählen und Startdatum setzen");
      return;
    }

    const payload = {
      plan_typ: "Woche",
      week_plan_id: selectedWeek.id,
      month_plan_id: selectedWeek.month_plan_id,
      woche_nr: selectedWeek.woche_nr,
      trainingsziel: selectedWeek.trainingsziel,
      schwerpunkt1: selectedWeek.schwerpunkt1,
      schwerpunkt2: selectedWeek.schwerpunkt2,
      schwerpunkt3: selectedWeek.schwerpunkt3,
      tage_pro_woche: tageProWoche,
      einheit_dauer: einheitDauer,
      spielerkader: spielerkader,
      torhueter: torhueter,
      week_start_date: weekStartDate,
      user_id: userId,
    };

    console.log("➡️ Wochenplan Payload", payload);

    try {
      const res = await fetch("https://hook.eu2.make.com/jr6wvnrr27mc7wr0r73pkstjb2o75z5p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");

      setWeekMessage("✅ Wochenplan an Make gesendet");
    } catch (err) {
      console.error(err);
      setWeekMessage("❌ Fehler beim Senden");
    }
  };

  // 3. Neuer Tagesplan
  const sendDayPlan = async (day: any) => {
    if (!day || !userId) return;

    const payload = {
      plan_typ: "Tag",
      day_plan_id: day.id,
      week_plan_id: day.week_plan_id,
      training_date: day.training_date,
      tag_nr: day.tag_nr,
      trainingsziel: day.trainingsziel,
      schwerpunkt1: day.schwerpunkt1,
      schwerpunkt2: day.schwerpunkt2,
      schwerpunkt3: day.schwerpunkt3,
      einheit_dauer: einheitDauer,
      spielerkader: spielerkader,
      torhueter: torhueter,
      user_id: userId,
    };

    console.log("➡️ Tagesplan Payload", payload);

    try {
      const res = await fetch("https://hook.eu2.make.com/jr6wvnrr27mc7wr0r73pkstjb2o75z5p", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");

      alert("✅ Tagesplan an Make gesendet");
    } catch (err) {
      console.error(err);
      alert("❌ Fehler beim Senden");
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
                <Button
                  onClick={() => navigate(`/plans/month/${p.id}`)}
                  className="bg-blue-600 text-white"
                >
                  Öffnen
                </Button>
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
            {weekPlans.map((p) => (
              <li
                key={p.id}
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setSelectedWeek(p)}
              >
                <span>
                  KW {p.calendar_week} – {p.trainingsziel?.slice(0, 40)}...
                </span>
                <Button
                  onClick={() => navigate(`/plans/week/${p.id}`)}
                  className="bg-blue-600 text-white"
                >
                  Öffnen
                </Button>
              </li>
            ))}
          </ul>

          {selectedWeek && (
            <div className="mt-6 p-4 border rounded">
              <h4 className="font-bold mb-2">
                Planung für Woche {selectedWeek.woche_nr}
              </h4>

              <label className="block mt-2 font-semibold">Trainingsziel</label>
              <Input
                value={selectedWeek.trainingsziel || ""}
                onChange={(e) =>
                  setSelectedWeek({
                    ...selectedWeek,
                    trainingsziel: e.target.value,
                  })
                }
              />

              <label className="block mt-2 font-semibold">Schwerpunkt 1</label>
              <Input
                value={selectedWeek.schwerpunkt1 || ""}
                onChange={(e) =>
                  setSelectedWeek({
                    ...selectedWeek,
                    schwerpunkt1: e.target.value,
                  })
                }
              />

              <label className="block mt-2 font-semibold">Schwerpunkt 2</label>
              <Input
                value={selectedWeek.schwerpunkt2 || ""}
                onChange={(e) =>
                  setSelectedWeek({
                    ...selectedWeek,
                    schwerpunkt2: e.target.value,
                  })
                }
              />

              <label className="block mt-2 font-semibold">Schwerpunkt 3</label>
              <Input
                value={selectedWeek.schwerpunkt3 || ""}
                onChange={(e) =>
                  setSelectedWeek({
                    ...selectedWeek,
                    schwerpunkt3: e.target.value,
                  })
                }
              />

              <label className="block mt-2 font-semibold">
                Startdatum der Woche (Montag)
              </label>
              <Input
                type="date"
                value={weekStartDate}
                onChange={(e) => setWeekStartDate(e.target.value)}
              />

              <label className="block mt-2 font-semibold">
                Trainingstage pro Woche
              </label>
              <Input
                type="number"
                value={tageProWoche}
                onChange={(e) => setTageProWoche(parseInt(e.target.value))}
              />

              <label className="block mt-2 font-semibold">
                Einheitdauer (Minuten)
              </label>
              <Input
                type="number"
                value={einheitDauer}
                onChange={(e) => setEinheitDauer(parseInt(e.target.value))}
              />

              <label className="block mt-2 font-semibold">Spielerkader</label>
              <Input
                type="number"
                value={spielerkader}
                onChange={(e) => setSpielerkader(parseInt(e.target.value))}
              />

              <label className="block mt-2 font-semibold">Torhüter</label>
              <Input
                type="number"
                value={torhueter}
                onChange={(e) => setTorhueter(parseInt(e.target.value))}
              />

              <Button
                onClick={sendWeekPlan}
                className="bg-green-600 text-white mt-4"
              >
                Wochenplan an Make senden
              </Button>
              {weekMessage && <p className="mt-2">{weekMessage}</p>}
            </div>
          )}
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/plans/day/${p.id}`)}
                    className="bg-blue-600 text-white"
                  >
                    Öffnen
                  </Button>
                  <Button
                    onClick={() => sendDayPlan(p)}
                    className="bg-green-600 text-white"
                  >
                    Tagesplan senden
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

