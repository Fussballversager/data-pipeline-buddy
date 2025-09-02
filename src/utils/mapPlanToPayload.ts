// Hilfsfunktion: reduziert die Pläne auf die wirklich nötigen Felder
export function mapPlanToPayload(plan: any, typ: "Monat" | "Woche" | "Tag") {
  // Stammdaten (kommen aus submission, können aber von plan überschrieben werden)
  const stammdaten = {
    altersstufe: plan.altersstufe,
    saisonsziel: plan.saisonziel,
    spielidee: plan.spielidee,
    match_formation: plan.match_formation,
    trainingsphilosophie: plan.trainingsphilosophie,
    schwachstellen: plan.schwachstellen,
    platz: plan.platz,
    notizen: plan.notizen,
    saisonphase: plan.saisonphase,
    einheit_dauer: plan.einheit_dauer,
    spielerkader: plan.spielerkader,
    torhueter: plan.torhueter,
    tage_pro_woche: plan.tage_pro_woche,
    user_id: plan.user_id,
  };

  switch (typ) {
    case "Monat":
      return {
        plan_typ: "Monat",
        month_year: plan.month_year,
        ...stammdaten, // 👈 Stammdaten immer dabei
      };

    case "Woche":
      return {
        plan_typ: "Woche",
        week_plan_id: plan.id,
        month_plan_id: plan.month_plan_id,
        month_year: plan.month_year,
        calendar_week: plan.calendar_week,
        ...stammdaten, // 👈 Stammdaten immer dabei

        // Wochen-spezifische Ziele
        trainingsziel: plan.trainingsziel,
        schwerpunkt1: plan.schwerpunkt1,
        schwerpunkt2: plan.schwerpunkt2,
        schwerpunkt3: plan.schwerpunkt3,
      };

    case "Tag":
      return {
        plan_typ: "Tag",
        day_plan_id: plan.id,
        week_plan_id: plan.week_plan_id,
        training_date: plan.training_date,
        tag_nr: plan.tag_nr,
        ...stammdaten, // 👈 Stammdaten immer dabei

        // Tages-spezifische Ziele
        trainingsziel: plan.trainingsziel,
        schwerpunkt1: plan.schwerpunkt1,
        schwerpunkt2: plan.schwerpunkt2,
        schwerpunkt3: plan.schwerpunkt3,
      };

    default:
      console.warn("⚠️ Unbekannter Typ für mapPlanToPayload:", typ);
      return plan;
  }
}
