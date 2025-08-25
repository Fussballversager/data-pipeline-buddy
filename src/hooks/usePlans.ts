import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getCurrentCalendarWeek = () => {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor(
    (now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
};

export function usePlans() {
  const [userId, setUserId] = useState<string | null>(null);
  const [months, setMonths] = useState<any[]>([]);
  const [weeks, setWeeks] = useState<any[]>([]);
  const [days, setDays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentMonthYear = getCurrentMonthYear();
  const currentWeek = getCurrentCalendarWeek();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setLoading(false);
        return;
      }
      setUserId(data.user.id);

      const { data: m } = await supabase
        .from("month_plans")
        .select("*")
        .eq("user_id", data.user.id)
        .order("month_year", { ascending: true });
      setMonths(m || []);

      const { data: w } = await supabase
        .from("week_plans")
        .select("*")
        .eq("user_id", data.user.id)
        .order("calendar_week", { ascending: true });
      setWeeks(w || []);

      const { data: d } = await supabase
        .from("day_plans")
        .select("*")
        .eq("user_id", data.user.id)
        .order("training_date", { ascending: true });
      setDays(d || []);

      setLoading(false);
    });
  }, []);

  const currentMonthPlan = months.find((m) => m.month_year === currentMonthYear);
  const currentWeekPlan = weeks.find((w) => w.calendar_week === currentWeek);
  const currentDayPlan = days.find((d) => d.training_date === today);

  return {
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
  };
}
