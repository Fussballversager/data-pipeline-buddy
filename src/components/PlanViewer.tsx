import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SendToMakeButton from "./SendToMakeButton";

export function PlanViewer() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
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

      // Plan laden
      const { data: planData, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) console.error("❌ Fehler beim Laden Plan:", error);

      // Stammdaten laden
      const { data: userData } = await supabase.auth.getUser();
      let submissionData = {};
      if (userData.user) {
        const { data: submission } = await supabase
          .from("taggy_submissions")
          .select("*")
          .eq("user_id", userData.user.id)
          .maybeSingle();
        if (submission) submissionData = submission;
      }

      // Zeitkontext hinzufügen
      let zeitData: any = {};
      if (type === "month") zeitData.monat = planData?.month_year;
      if (type === "week") zeitData.woche = planData?.calendar_week;
      if (type === "day") zeitData.tag = planData?.training_date;

      // Für Tagespläne zusätzlich sections laden
      let sectionData: any[] = [];
      if (type === "day") {
        const { data: s } = await supabase
          .from("sections")
          .select("*")
          .eq("day_id", id)
          .order("abschnitt_nr", { ascending: true });
        sectionData = s || [];
        setSections(sectionData);
      }

      const mergedPlan = { ...planData, ...submissionData, ...zeitData };
      setPlan(mergedPlan);

      // alle Pläne für Navigation laden
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

  // Navigation
  const idx = allPlans.findIndex((p) => p.id === plan.id);
  const prevPlan = idx > 0 ? allPlans[idx - 1] : null;
  const nextPlan = idx < allPlans.length - 1 ? allPlans[idx + 1] : null;

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
            <p><b>Monat:</b> {plan.monat}</p>
            <label className="block font-semibold">Ziele (Fokus)</label>
            <Textarea
              value={plan.fokus || ""}
              onChange={(e) => setPlan({ ...plan, fokus: e.target.value })}
            />
            <label className="block font-semibold">Schwachstellen</label>
            <Textarea
              value={plan.schwachstellen || ""}
              onChange={(e) => setPlan({ ...plan, schwachstellen: e.target.value })}
            />
          </>
        )}

        {/* Wochenplan */}
        {type === "week" && (
          <>
            <p><b>KW:</b> {plan.woche}</p>
            <label className="block font-semibold">Trainingsziel</label>
            <Textarea
              value={plan.trainingsziel || ""}
              onChange={(e) => setPlan({ ...plan, trainingsziel: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkt 1</label>
            <Textarea
              value={plan.schwerpunkt1 || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkt1: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkt 2</label>
            <Textarea
              value={plan.schwerpunkt2 || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkt2: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkt 3</label>
            <Textarea
              value={plan.schwerpunkt3 || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkt3: e.target.value })}
            />
          </>
        )}

        {/* Tagesplan */}
        {type === "day" && (
          <>
            <p><b>Datum:</b> {plan.tag}</p>
            <label className="block font-semibold">Trainingsziel</label>
            <Textarea
              value={plan.trainingsziel || ""}
              onChange={(e) => setPlan({ ...plan, trainingsziel: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkt 1</label>
            <Textarea
              value={plan.schwerpunkt1 || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkt1: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkt 2</label>
            <Textarea
              value={plan.schwerpunkt2 || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkt2: e.target.value })}
            />
            <label className="block font-semibold">Schwerpunkt 3</label>
            <Textarea
              value={plan.schwerpunkt3 || ""}
              onChange={(e) => setPlan({ ...plan, schwerpunkt3: e.target.value })}
            />

            <label className="block font-semibold">Abschnitte (aus sections)</label>
            <Textarea
              value={JSON.stringify(sections, null, 2)}
              onChange={(e) => setSections(JSON.parse(e.target.value))}
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

        {/* Aktionen */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white"
          >
            {saving ? "Speichern..." : "Änderungen speichern"}
          </Button>
          <SendToMakeButton plan={plan} />
        </div>

        {message && <p>{message}</p>}
      </CardContent>
    </Card>
  );
}
