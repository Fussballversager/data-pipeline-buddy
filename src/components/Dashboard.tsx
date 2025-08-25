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
  } = usePlans();

  if (loading) return <div className="p-6">⏳ Lade Dashboard...</div>;

  return (
    <Card className="max-w-4xl mx-auto p-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Dashboard</CardTitle>
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
      <CardContent>
        <p>Willkommen im Trainer-Dashboard 👋</p>
        <p>Nutze die Buttons oben, um direkt in deine aktuellen Pläne zu springen.</p>
      </CardContent>
    </Card>
  );
}
