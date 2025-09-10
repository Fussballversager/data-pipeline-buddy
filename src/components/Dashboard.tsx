import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePlans } from "@/hooks/usePlans";

export function Dashboard() {
  const {
    loading,
    currentDayPlan,
    allDayPlans,
  } = usePlans();

  if (loading) return <div className="p-6 text-gray-200">⏳ Lade Dashboard...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Dashboard Header */}
      <Card className="bg-gray-800 text-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
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

      {/* Tagespläne */}
      <Card className="bg-gray-800 text-gray-100 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Alle Trainingsprogramme</CardTitle>
        </CardHeader>
        <CardContent>
          {allDayPlans.filter((p) => p.section_count > 0).length === 0 ? (
            <p className="text-gray-400">Keine geplanten Trainingstage vorhanden</p>
          ) : (
            <div className="space-y-3">
              {allDayPlans
                .filter((p) => p.section_count > 0) // 👉 nur Tage mit Abschnitten
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-gray-700 p-4 rounded shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-100">
                        {p.training_date}
                      </h4>
                      <p className="text-sm text-gray-200">
                        {p.trainingsziel || "–"}
                      </p>
                    </div>
                    <Link to={`/day/${p.id}`}>
                      <Button
                        size="sm"
                        className="bg-green-600 text-white hover:bg-green-700"
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
