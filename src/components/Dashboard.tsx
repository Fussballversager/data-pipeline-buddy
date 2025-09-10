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

  if (loading) return <div className="p-6 text-gray-200">⏳ Lade Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Dashboard Header mit Buttons */}
      <Card className="bg-gray-800 text-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {currentMonthPlan && (
              <Link to={`/month/${currentMonthPlan.id}`}>
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Aktueller Monat ({currentMonthPlan.month_year})
                </Button>
              </Link>
            )}
            {currentWeekPlan && (
              <Link to={`/week/${currentWeekPlan.id}`}>
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Aktuelle Woche (KW {currentWeekPlan.calendar_week})
                </Button>
              </Link>
            )}
            {currentDayPlan && (
              <Link to={`/day/${currentDayPlan.id}`}>
                <Button
                  size="sm"
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Heute ({currentDayPlan.training_date})
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monatspläne */}
      <Card className="bg-gray-800 text-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Alle Monatspläne</CardTitle>
        </CardHeader>
        <CardContent>
          {allMonthPlans.length === 0 ? (
            <p className="text-gray-400">Keine Monatspläne vorhanden</p>
          ) : (
            <div className="space-y-3">
              {allMonthPlans.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-700 p-4 rounded shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-gray-100">
                      Monat {p.month_year}
                    </h4>
                    <p className="text-sm text-gray-200">
                      Fokus: {p.fokus || "–"} | Schwachstellen: {p.schwachstellen || "–"}
                    </p>
                  </div>
                  <Link to={`/month/${p.id}`}>
                    <Button
                      size="sm"
                      className="bg-gray-600 text-white hover:bg-gray-500"
                    >
                      Ansehen
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wochenpläne */}
      <Card className="bg-gray-800 text-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Alle Wochenpläne</CardTitle>
        </CardHeader>
        <CardContent>
          {allWeekPlans.length === 0 ? (
            <p className="text-gray-400">Keine Wochenpläne vorhanden</p>
          ) : (
            <div className="space-y-3">
              {[...allWeekPlans]
                .sort((a, b) => {
                  const monthA =
                    allMonthPlans.find((m) => m.id === a.month_plan_id)?.month_year || "";
                  const monthB =
                    allMonthPlans.find((m) => m.id === b.month_plan_id)?.month_year || "";
                  if (monthA === monthB) {
                    return (a.calendar_week || 0) - (b.calendar_week || 0);
                  }
                  return monthA.localeCompare(monthB);
                })
                .map((p) => {
                  const monthYear =
                    allMonthPlans.find((m) => m.id === p.month_plan_id)?.month_year;
                  return (
                    <div
                      key={p.id}
                      className="bg-gray-700 p-4 rounded shadow-sm flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-100">
                          {monthYear ? `${monthYear} – ` : ""}KW {p.calendar_week}
                        </h4>
                        <p className="text-sm text-gray-200">{p.trainingsziel || "–"}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/week/${p.id}`}>
                          <Button
                            size="sm"
                            className="bg-gray-600 text-white hover:bg-gray-500"
                          >
                            Ansehen
                          </Button>
                        </Link>
                        {p.day_count > 0 && (
                          <Link to={`/days/${p.id}`}>
                            <Button
                              size="sm"
                              className="bg-blue-600 text-white hover:bg-blue-500"
                            >
                              Tage öffnen
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tagespläne */}
      <Card className="bg-gray-800 text-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Alle Tagespläne</CardTitle>
        </CardHeader>
        <CardContent>
          {allDayPlans.length === 0 ? (
            <p className="text-gray-400">Keine Tagespläne vorhanden</p>
          ) : (
            <div className="space-y-3">
              {allDayPlans.map((p) => (
                <div
                  key={p.id}
                  className="bg-gray-700 p-4 rounded shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold text-gray-100">
                      {p.training_date}
                    </h4>
                    <p className="text-sm text-gray-200">{p.trainingsziel || "–"}</p>
                  </div>
                  <Link to={`/day/${p.id}`}>
                    <Button
                      size="sm"
                      className="bg-gray-600 text-white hover:bg-gray-500"
                    >
                      Ansehen
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
