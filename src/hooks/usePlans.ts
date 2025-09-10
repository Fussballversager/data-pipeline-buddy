import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Hilfsfunktionen für aktuelle Zeitkontexte
function getCurrentMonth() {
  return format(new Date(), "yyyy-MM"); // z. B. "2025-08"
}

function getCurrentCalendarWeek() {
  return format(new Date(), "I"); // KW, z. B. "35"
}

function getToday() {
  return format(new Date(), "yyyy-MM-dd"); // z. B. "2025-08-28"
}

export function usePlans() {
  const [loading, setLoading] = useState(true);

  const [currentMonthPlan, setCurrentMonthPlan] = useState<any | null>(null);
  const [currentWeekPlan, setCurrentWeekPlan] = useState<any | null>(null);
  const [currentDayPlan, setCurrentDayPlan] = useState<any | null>(null);

  const [allMonthPlans, setAllMonthPlans] = useState<any[]>([]);
  const [allWeekPlans, setAllWeekPlans] = useState<any[]>([]);
  const [allDayPlans, setAllDayPlans] = useState<any[]>([]);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      const userId = userData.user.id;

      // Monatspläne
      const { data: months, error: mErr } = await supabase
        .from("month_plans")
        .select("*")
        .eq("user_id", userId)
        .order("month_year", { ascending: true });
      if (mErr) console.error("❌ Fehler beim Laden month_plans:", mErr);
      setAllMonthPlans(months || []);

      // Wochenpläne
      const { data: weeks, error: wErr } = await supabase
        .from("view_week_plans")
        .select("*")
        .eq("user_id", userId)
        .order("calendar_week", { ascending: true });
      if (wErr) console.error("❌ Fehler beim Laden week_plans:", wErr);
      setAllWeekPlans(weeks || []);

      // Tagespläne nur wenn section_count > 0
      const { data: days, error: dErr } = await supabase
        .from("view_day_plans")
        .select("*")
        .eq("user_id", userId)
        .gt("section_count", 0) // ✅ nur Tage mit mindestens 1 Section
        .order("training_date", { ascending: true });
      if (dErr) console.error("❌ Fehler beim Laden day_plans:", dErr);
      setAllDayPlans(days || []);

      // Aktueller Monat
      const thisMonth = getCurrentMonth();
      const currentMonth = (months || []).find((m) => m.month_year === thisMonth);
      setCurrentMonthPlan(currentMonth || null);

      // Aktuelle Woche
      const thisWeek = getCurrentCalendarWeek();
      const currentWeek = (weeks || []).find((w) => String(w.calendar_week) === thisWeek);
      setCurrentWeekPlan(currentWeek || null);

      // Aktueller Tag
      const today = getToday();
      const currentDay = (days || []).find((d) => d.training_date === today);
      setCurrentDayPlan(currentDay || null);

      setLoading(false);
    };

    loadPlans();
  }, []);

  return {
    loading,
    currentMonthPlan,
    currentWeekPlan,
    currentDayPlan,
    allMonthPlans,
    allWeekPlans,
    allDayPlans,
  };
}
