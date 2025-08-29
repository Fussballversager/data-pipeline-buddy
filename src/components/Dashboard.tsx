import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";

export function Dashboard() {
  const {
    loading,
    currentMonthPlan,
    currentWeekPlan,
    currentDayPlan,
    allMonthPlans,
    allWeekPlans,
    allDayPlans,
  } = usePlans();

  if (loading) return <div className="p-6">⏳ Lade Dashboard...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6 space-y-8">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Aktuelle Buttons --- */}
        <div className="flex gap-2">
          {currentMonthPlan && (
            <Link to={`/plans/month/${currentMonthPlan.id}`}>
              <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                Aktueller Monat ({currentMonthPlan.month_year})
              </Button>
            </Link>
          )}
          {currentWeekPlan && (
            <Link to={`/plans/week/${currentWeekPlan.id}`}>
              <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                Aktuelle Woche (KW {currentWeekPlan.calendar_week})
              </Button>
            </Link>
          )}
          {currentDayPlan && (
            <Link to={`/plans/day/${currentDayPlan.id}`}>
              <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                Heute ({currentDayPlan.training_date})
              </Button>
            </Link>
          )}
        </div>

        {/* --- Monatspläne --- */}
        <div>
          <h3 className="font-bold text-lg mb-2">Alle Monatspläne</h3>
          {allMonthPlans.length === 0 ? (
            <p className="text-gray-500">Keine Monatspläne vorhanden</p>
          ) : (
            <ul className="space-y-1">
              {allMonthPlans.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/plans/month/${p.id}`}
                    className="text-gray-200 hover:underline"
                  >
                    Monat {p.month_year}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Wochenpläne --- */}
        <div>
          <h3 className="font-bold text-lg mb-2">Alle Wochenpläne</h3>
          {allWeekPlans.length === 0 ? (
            <p className="text-gray-500">Keine Wochenpläne vorhanden</p>
          ) : (
            <ul className="space-y-1">
              {allWeekPlans.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/plans/week/${p.id}`}
                    className="text-gray-200 hover:underline"
                  >
                    KW {p.calendar_week} – {p.trainingsziel}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Tagespläne --- */}
        <div>
          <h3 className="font-bold text-lg mb-2">Alle Tagespläne</h3>
          {allDayPlans.length === 0 ? (
            <p className="text-gray-500">Keine Tagespläne vorhanden</p>
          ) : (
            <ul className="space-y-1">
              {allDayPlans.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/plans/day/${p.id}`}
                    className="text-gray-200 hover:underline"
                  >
                    {p.training_date} – {p.trainingsziel}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
