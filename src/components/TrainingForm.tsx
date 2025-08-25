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
    spieleranzahl: "",
    torhueter: "",
    einheiten_pro_woche: "",
    einheit_dauer: "",
    plan_typ: "",
    saisonziel: "",
    spielidee: "",
    match_formation: "",
    entwicklungsschwerpunkte: "",
    philosophie: "",
    ziel_konkret: "",
    platz_material: "",
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
            spieleranzahl: submission.spieleranzahl ?? "",
            torhueter: submission.torhueter ?? "",
            einheiten_pro_woche: submission.einheiten_pro_woche ?? "",
            einheit_dauer: submission.einheit_dauer ?? "",
            plan_typ: submission.plan_typ ?? "",
            saisonziel: submission.saisonziel ?? "",
            spielidee: submission.spielidee ?? "",
            match_formation: submission.match_formation ?? "",
            entwicklungsschwerpunkte: submission.entwicklungsschwerpunkte ?? "",
            philosophie: submission.philosophie ?? "",
            ziel_konkret: submission.ziel_konkret ?? "",
            platz_material: submission.platz_material ?? "",
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
        spieleranzahl: form.spieleranzahl ? parseInt(form.spieleranzahl, 10) : null,
        torhueter: form.torhueter ? parseInt(form.torhueter, 10) : null,
        einheiten_pro_woche: form.einheiten_pro_woche ? parseInt(form.einheiten_pro_woche, 10) : null,
        einheit_dauer: form.einheit_dauer ? parseInt(form.einheit_dauer, 10) : null,
        plan_typ: form.plan_typ,
        saisonziel: form.saisonziel,
        spielidee: form.spielidee,
        match_formation: form.match_formation,
        entwicklungsschwerpunkte: form.entwicklungsschwerpunkte,
        philosophie: form.philosophie,
        ziel_konkret: form.ziel_konkret,
        platz_material: form.platz_material,
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
          <Label>Spieleranzahl</Label>
          <Input
            type="number"
            value={form.spieleranzahl}
            onChange={(e) => handleChange("spieleranzahl", e.target.value)}
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
            value={form.einheiten_pro_woche}
            onChange={(e) => handleChange("einheiten_pro_woche", e.target.value)}
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
              <SelectItem value="trainingstag">Trainingstag</SelectItem>
              <SelectItem value="wochenplan">Wochenplan</SelectItem>
              <SelectItem value="monatsplan">Monatsplan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Saisonziel</Label>
          <Select
            value={form.saisonziel}
            onValueChange={(v) => handleChange("saisonziel", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aufstieg">Aufstieg</SelectItem>
              <SelectItem value="meisterschaft">Meisterschaft</SelectItem>
              <SelectItem value="entwicklung">Entwicklung</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Spielidee</Label>
          <Select
            value={form.spielidee}
            onValueChange={(v) => handleChange("spielidee", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Wählen..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ballbesitz">Ballbesitz</SelectItem>
              <SelectItem value="umschalten">Umschalten</SelectItem>
              <SelectItem value="pressing">Pressing</SelectItem>
            </SelectContent>
          </Select>
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
        <Label>Entwicklungsschwerpunkte</Label>
        <Input
          value={form.entwicklungsschwerpunkte}
          onChange={(e) => handleChange("entwicklungsschwerpunkte", e.target.value)}
        />
      </div>
      <div>
        <Label>Philosophie</Label>
        <Select
          value={form.philosophie}
          onValueChange={(v) => handleChange("philosophie", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wählen..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dfb">DFB</SelectItem>
            <SelectItem value="nl">Niederlande</SelectItem>
            <SelectItem value="esp">Spanien</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Konkretes Ziel</Label>
        <Textarea
          value={form.ziel_konkret}
          onChange={(e) => handleChange("ziel_konkret", e.target.value)}
        />
      </div>
      <div>
        <Label>Platz / Material</Label>
        <Textarea
          value={form.platz_material}
          onChange={(e) => handleChange("platz_material", e.target.value)}
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
