// Hilfsfunktion: reduziert die Pläne auf die wirklich nötigen Felder
export function mapPlanToPayload(plan: any, typ: "Monat" | "Woche" | "Tag") {
  switch (typ) {
    case "Monat":
      return {
        plan_typ: "Monat",
        month_year: plan.month_year,
        altersstufe: plan.altersstufe,
        saisonsziel: plan.saisonziel,
        spielidee: plan.spielidee,
        match_formation: plan.match_formation,
        fokus: plan.fokus,
        trainingsphilosophie: plan.trainingsphilosophie,
        schwachstellen: plan.schwachstellen,
        platz: plan.platz,
        notizen: plan.notizen,
        saisonphase: plan.saisonphase,
        user_id: plan.user_id,

        // 🚀 Ergänzt: Stammdaten, die bisher gefehlt haben
        einheit_dauer: plan.einheit_dauer,
        spielerkader: plan.spielerkader,
        torhueter: plan.torhueter,
        tage_pro_woche: plan.tage_pro_woche,
      };

    case "Woche":
      return {
        plan_typ: "Woche",
        week_plan_id: plan.id,
        month_plan_id: plan.month_plan_id,
        month_year: plan.month_year,
        calendar_week: plan.calendar_week,   // 👈 Ergänzt

        // Schwerpunkte/Ziele
        trainingsziel: plan.trainingsziel,
        schwerpunkt1: plan.schwerpunkt1,
        schwerpunkt2: plan.schwerpunkt2,
        schwerpunkt3: plan.schwerpunkt3,

        // 🚀 Stammdaten auch hier erzwingen
        tage_pro_woche: plan.tage_pro_woche,
        einheit_dauer: plan.einheit_dauer,
        spielerkader: plan.spielerkader,
        torhueter: plan.torhueter,

        user_id: plan.user_id,
      };

    case "Tag":
      return {
        plan_typ: "Tag",
        day_plan_id: plan.id,
        week_plan_id: plan.week_plan_id,
        training_date: plan.training_date,
        tag_nr: plan.tag_nr,

        // Schwerpunkte/Ziele
        trainingsziel: plan.trainingsziel,
        schwerpunkt1: plan.schwerpunkt1,
        schwerpunkt2: plan.schwerpunkt2,
        schwerpunkt3: plan.schwerpunkt3,

        // 🚀 Stammdaten auch hier erzwingen
        einheit_dauer: plan.einheit_dauer,
        spielerkader: plan.spielerkader,
        torhueter: plan.torhueter,
        tage_pro_woche: plan.tage_pro_woche,

        user_id: plan.user_id,
      };

    default:
      console.warn("⚠️ Unbekannter Typ für mapPlanToPayload:", typ);
      return plan; // Fallback: alles durchreichen
  }
}
