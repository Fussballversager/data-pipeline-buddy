import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";
import { supabase } from "@/integrations/supabase/client";

export function PlanManager() {
  const {
    userId,
    months,
    weeks,
    days,
    loading,
    currentMonthYear,
    currentWeek,
    today,
    currentMonthPlan,
    currentWeekPlan,
    currentDayPlan,
  } = usePlans();

  if (loading) return <div className="p-6">⏳ Lade Plan-Status...</div>;

  // --- Aktionen ---
  const handleCreateMonthPlan = async () => {
    if (!userId) return;
    await supabase.from("month_plans").insert([
      {
        user_id: userId,
        month_year: currentMonthYear,
        ziele: "Dummy-Ziel: Spieler entwickeln",
        schwerpunkte: "Dummy-Schwerpunkt: Technik & Ballbesitz",
      },
    ]);
    window.location.reload();
  };

  const handleCreateWeekPlan = async (kw: number = currentWeek) => {
    if (!userId || months.length === 0) return;
    await supabase.from("week_plans").insert([
      {
        user_id: userId,
        month_plan_id: months[months.length - 1].id,
        calendar_week: kw,
        ziele: "Dummy-Ziel: Umschalten verbessern",
        schwerpunkte: "Dummy-Schwerpunkt: Pressing & Ballgewinne",
      },
    ]);
    window.location.reload();
  };

  const handleCreateDayPlan = async (date: string = today) => {
    if (!userId || weeks.length === 0) return;
    await supabase.from("day_plans").insert([
      {
        user_id: userId,
        week_plan_id: weeks[weeks.length - 1].id,
        training_date: date,
        abschnitte: { info: "Dummy-Ablauf für Testeinheit" },
        skizzen: { feld: "Dummy-Spielfeld" },
      },
    ]);
    window.location.reload();
  };

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Wirklich löschen?")) return;
    await supabase.from(table).delete().eq("id", id);
    window.location.reload();
  };

  return (
    <Card className="max-w-3xl mx-auto p-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Plan-Manager</CardTitle>
          <div className="flex gap-2">
            {currentMonthPlan && (
              <Link to={`/plans/month/${currentMonthPlan.id}`}>
                <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                  Aktueller Monat
                </Button>
              </Link>
            )}
            {currentWeekPlan && (
              <Link to={`/plans/week/${currentWeekPlan.id}`}>
                <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                  Aktuelle Woche
                </Button>
              </Link>
            )}
            {currentDayPlan && (
              <Link to={`/plans/day/${currentDayPlan.id}`}>
                <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                  Heute
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* --- Erstellungsleiste --- */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex gap-2">
            <Button onClick={handleCreateMonthPlan} className="bg-green-600 text-white hover:bg-green-700">
              Neuen Monatsplan anlegen
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleCreateWeekPlan(currentWeek)}
              disabled={months.length === 0}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Diese Woche anlegen
            </Button>
            <Button
              onClick={() => handleCreateWeekPlan(currentWeek + 1)}
              disabled={months.length === 0}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Nächste Woche anlegen
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => handleCreateDayPlan(today)}
              disabled={weeks.length === 0}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Heute anlegen
            </Button>
            <Button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleCreateDayPlan(tomorrow.toISOString().split("T")[0]);
              }}
              disabled={weeks.length === 0}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Nächster Tag anlegen
            </Button>
          </div>
        </div>

        {/* Monatspläne */}
        <div>
          <span className="font-semibold">Monatspläne</span>
          <ul className="space-y-2 mt-2">
            {months.map((m) => (
              <li
                key={m.id}
                className={`flex justify-between items-center p-2 rounded ${
                  m.month_year === currentMonthYear ? "bg-green-600 text-white" : ""
                }`}
              >
                <span>{m.month_year} – {m.ziele}</span>
                <div className="flex gap-2">
                  <Link to={`/plans/month/${m.id}`}>
                    <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                      Öffnen
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete("month_plans", m.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Wochenpläne */}
        <div>
          <span className="font-semibold">Wochenpläne</span>
          <ul className="space-y-2 mt-2">
            {weeks.map((w) => (
              <li
                key={w.id}
                className={`flex justify-between items-center p-2 rounded ${
                  w.calendar_week === currentWeek ? "bg-green-600 text-white" : ""
                }`}
              >
                <span>KW {w.calendar_week} – {w.ziele}</span>
                <div className="flex gap-2">
                  <Link to={`/plans/week/${w.id}`}>
                    <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                      Öffnen
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete("week_plans", w.id)}
                  >
                    Löschen
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Tagespläne */}
        <div>
          <span className="font-semibold">Tagespläne</span>
          <ul className="space-y-2 mt-2">
            {days.map((d) => (
              <li
                key={d.id}
                className={`flex justify-between items-center p-2 rounded ${
                  d.training_date === today ? "bg-green-600 text-white" : ""
                }`}
              >
                <span>{d.training_date} – {d.abschnitte?.info}</span>
                <div className="flex gap-2">
                  <Link to={`/plans/day/${d.id}`}>
                    <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                      Öffnen
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete("day_plans", d.id)}
                  >
                    Löschen
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
