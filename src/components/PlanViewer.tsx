import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function PlanViewer() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<any>(null);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!type || !id) return;

      const table =
        type === "month"
          ? "month_plans"
          : type === "week"
          ? "week_plans"
          : "day_plans";

      // aktuellen Plan laden
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error("❌ Fehler beim Laden:", error);
      setPlan(data);

      // alle Pläne des Users chronologisch laden
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data: all } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", userData.user.id)
          .order(
            type === "month"
              ? "month_year"
              : type === "week"
              ? "calendar_week"
              : "training_date",
            { ascending: true }
          );
        setAllPlans(all || []);
      }

      setLoading(false);
    };
    load();
  }, [type, id]);

  const handleSave = async () => {
    if (!plan || !type || !id) return;

    setSaving(true);
    setMessage(null);

    const table =
      type === "month"
        ? "month_plans"
        : type === "week"
        ? "week_plans"
        : "day_plans";

    const { error } = await supabase.from(table).update(plan).eq("id", id);

    setSaving(false);

    if (error) {
      console.error(error);
      setMessage("❌ Fehler beim Speichern: " + error.message);
    } else {
      setMessage("✅ Änderungen gespeichert!");
    }
  };

  if (loading) return <div className="p-6">⏳ Lade Plan...</div>;
  if (!plan) return <div className="p-6">❌ Kein Plan gefunden</div>;

  // Position im Array finden
  const idx = allPlans.findIndex((p) => p.id === plan.id);
  const prevPlan = idx > 0 ? allPlans[idx - 1] : null;
  const nextPlan = idx < allPlans.length - 1 ? allPlans[idx + 1] : null;

  // Label für Navigation
  const getPlanLabel = (p: any) => {
    if (type === "month") return `Monat ${p.month_year}`;
    if (type === "week") return `KW ${p.calendar_week}`;
    if (type === "day") return p.training_date;
    return "";
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 space-y-6">
      <CardHeader>
        <CardTitle>
          {type === "month" && "Monatsplan"}
          {type === "week" && "Wochenplan"}
          {type === "day" && "Tagesplan"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Monatsplan */}
        {type === "month" && (
          <>
            <p><b>Monat:</b> {plan.month_year}</p>
            <label className="block font-semibold">Ziele</label>
            <Textarea
              value={plan.ziele || ""}
              onChange={(e) => setPlan({ ...plan, ziele: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkte</label>
            <Textarea
              value={plan.schwerpunkte || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkte: e.target.value })}
            />
          </>
        )}

        {/* Wochenplan */}
        {type === "week" && (
          <>
            <p><b>KW:</b> {plan.calendar_week}</p>
            <label className="block font-semibold">Ziele</label>
            <Textarea
              value={plan.ziele || ""}
              onChange={(e) => setPlan({ ...plan, ziele: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkte</label>
            <Textarea
              value={plan.schwerpunkte || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkte: e.target.value })}
            />
          </>
        )}

        {/* Tagesplan */}
        {type === "day" && (
          <>
            <p><b>Datum:</b> {plan.training_date}</p>
            <label className="block font-semibold">Abschnitte (JSON)</label>
            <Textarea
              value={JSON.stringify(plan.abschnitte, null, 2)}
              onChange={(e) =>
                setPlan({ ...plan, abschnitte: JSON.parse(e.target.value) })
              }
            />
            <label className="block font-semibold">Skizzen (JSON)</label>
            <Textarea
              value={JSON.stringify(plan.skizzen, null, 2)}
              onChange={(e) =>
                setPlan({ ...plan, skizzen: JSON.parse(e.target.value) })
              }
            />
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          {prevPlan && (
            <Button
              onClick={() => navigate(`/plans/${type}/${prevPlan.id}`)}
              className="bg-gray-500 text-white"
            >
              ◀ {getPlanLabel(prevPlan)}
            </Button>
          )}
          {nextPlan && (
            <Button
              onClick={() => navigate(`/plans/${type}/${nextPlan.id}`)}
              className="bg-gray-500 text-white"
            >
              {getPlanLabel(nextPlan)} ▶
            </Button>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 text-white"
        >
          {saving ? "Speichern..." : "Änderungen speichern"}
        </Button>
        {message && <p>{message}</p>}
      </CardContent>
    </Card>
  );
}
