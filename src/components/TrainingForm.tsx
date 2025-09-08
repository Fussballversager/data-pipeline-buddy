import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function TrainingForm() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    altersstufe: "",
    spielerkader: "",
    torhueter: "",
    tage_pro_woche: "",
    einheit_dauer: "",
    plan_typ: "",
    saisonphase: "", // neu
    saisonziel: "",
    spielidee: "",
    match_formation: "",
    fokus: "",
    trainingsphilosophie: "",
    schwachstellen: "",
    platz: "",
    notizen: "",
  });

  // User-ID laden & vorhandene Trainingsdaten holen
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);

        const { data: submission, error } = await supabase
          .from("taggy_submissions")
          .select("*")
          .eq("user_id", data.user.id)
          .limit(1)
          .single();

        if (!error && submission) {
          setForm({
            altersstufe: submission.altersstufe ?? "",
            spielerkader: submission.spielerkader ?? "",
            torhueter: submission.torhueter ?? "",
            tage_pro_woche: submission.tage_pro_woche ?? "",
            einheit_dauer: submission.einheit_dauer ?? "",
            plan_typ: submission.plan_typ ?? "",
            saisonphase: submission.saisonphase ?? "",
            saisonziel: submission.saisonziel ?? "",
            spielidee: submission.spielidee ?? "",
            match_formation: submission.match_formation ?? "",
            fokus: submission.fokus ?? "",
            trainingsphilosophie: submission.trainingsphilosophie ?? "",
            schwachstellen: submission.schwachstellen ?? "",
            platz: submission.platz ?? "",
            notizen: submission.notizen ?? "",
          });
        }
      }
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage("❌ Kein eingeloggter User gefunden.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("taggy_submissions").upsert([
      {
        user_id: userId,
        altersstufe: form.altersstufe,
        spielerkader: form.spielerkader ? parseInt(form.spielerkader, 10) : null,
        torhueter: form.torhueter ? parseInt(form.torhueter, 10) : null,
        tage_pro_woche: form.tage_pro_woche ? parseInt(form.tage_pro_woche, 10) : null,
        einheit_dauer: form.einheit_dauer ? parseInt(form.einheit_dauer, 10) : null,
        plan_typ: form.plan_typ,
        saisonphase: form.saisonphase,
        saisonziel: form.saisonziel,
        spielidee: form.spielidee,
        match_formation: form.match_formation,
        fokus: form.fokus,
        trainingsphilosophie: form.trainingsphilosophie,
        schwachstellen: form.schwachstellen,
        platz: form.platz,
        notizen: form.notizen,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("❌ Fehler beim Speichern: " + error.message);
    } else {
      setMessage("✅ Daten gespeichert!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">Trainings-Parameter</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Altersstufe</Label>
          <Input
            value={form.altersstufe}
            onChange={(e) => handleChange("altersstufe", e.target.value)}
          />
        </div>
        <div>
          <Label>Kadergröße</Label>
          <Input
            type="number"
            value={form.spielerkader}
            onChange={(e) => handleChange("spielerkader", e.target.value)}
          />
        </div>
        <div>
          <Label>Torhüter</Label>
          <Input
            type="number"
            value={form.torhueter}
            onChange={(e) => handleChange("torhueter", e.target.value)}
          />
        </div>
        <div>
          <Label>Einheiten pro Woche</Label>
          <Input
            type="number"
            value={form.tage_pro_woche}
            onChange={(e) => handleChange("tage_pro_woche", e.target.value)}
          />
        </div>
        <div>
          <Label>Einheitsdauer (Minuten)</Label>
          <Input
            type="number"
            value={form.einheit_dauer}
            onChange={(e) => handleChange("einheit_dauer", e.target.value)}
          />
        </div>
        <div>
          <Label>Plan-Typ</Label>
          <Select
            value={form.plan_typ}
            onValueChange={(v) => handleChange("plan_typ", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monat">Monatsplan</SelectItem>
              <SelectItem value="Woche">Wochenplan</SelectItem>
              <SelectItem value="Tag">Tagesplan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Saisonphase</Label>
          <Select
            value={form.saisonphase}
            onValueChange={(v) => handleChange("saisonphase", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Vorbereitung">Vorbereitung</SelectItem>
              <SelectItem value="Meisterschaft">Meisterschaft</SelectItem>
              <SelectItem value="Winterpause">Winterpause</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Saisonziel</Label>
          <Input
            value={form.saisonziel}
            onChange={(e) => handleChange("saisonziel", e.target.value)}
          />
        </div>
        <div>
          <Label>Spielidee</Label>
          <Input
            value={form.spielidee}
            onChange={(e) => handleChange("spielidee", e.target.value)}
          />
        </div>
        <div>
          <Label>Formation</Label>
          <Select
            value={form.match_formation}
            onValueChange={(v) => handleChange("match_formation", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4-3-3">4-3-3</SelectItem>
              <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
              <SelectItem value="3-5-2">3-5-2</SelectItem>
              <SelectItem value="5-3-2">5-3-2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Fokus</Label>
        <Input
          value={form.fokus}
          onChange={(e) => handleChange("fokus", e.target.value)}
        />
      </div>
      <div>
        <Label>Trainingsphilosophie</Label>
        <Select
          value={form.trainingsphilosophie}
          onValueChange={(v) => handleChange("trainingsphilosophie", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DFB">DFB</SelectItem>
            <SelectItem value="Horst Wein Funino">Horst Wein</SelectItem>
            <SelectItem value="Niederlande">Niederlande</SelectItem>
            <SelectItem value="Spanien">Spanien</SelectItem>
            <SelectItem value="Dribbler">Dribbler</SelectItem>
            <SelectItem value="Quälix">Magath</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Schwachstellen</Label>
        <Textarea
          value={form.schwachstellen}
          onChange={(e) => handleChange("schwachstellen", e.target.value)}
        />
      </div>
      <div>
        <Label>Platz / Material</Label>
        <Textarea
          value={form.platz}
          onChange={(e) => handleChange("platz", e.target.value)}
        />
      </div>
      <div>
        <Label>Notizen</Label>
        <Textarea
          value={form.notizen}
          onChange={(e) => handleChange("notizen", e.target.value)}
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Speichert..." : "Speichern"}
      </Button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}


