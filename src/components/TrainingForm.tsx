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
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    altersstufe: "",
    spielerkader: "",
    torhueter: "",
    tage_pro_woche: "",
    einheit_dauer: "",
    saisonphase: "",
    saisonziel: "",
    spielidee: "",
    match_formation: "",
    fokus: "",
    trainingsphilosophie: "",
    schwachstellen: "",
    platz: "",
    notizen: "",
  });

  // 🧠 User & vorhandene Daten laden
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
        } else {
          // 🪄 Backup: Stammdaten holen
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("altersstufe, spieleranzahl")
            .eq("user_id", data.user.id)
            .limit(1)
            .single();

          if (profile) {
            setForm((prev: any) => ({
              ...prev,
              altersstufe: profile.altersstufe ?? "",
              spielerkader: profile.spieleranzahl ?? "",
            }));
          }
        }
      }
    });
  }, []);

  // 🧩 Hilfsfunktion: Zahl clampen
  const clampNumber = (val: string, min: number, max?: number) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return "";
    if (max !== undefined) return Math.min(Math.max(num, min), max);
    return Math.max(num, min);
  };

  const handleChange = (field: string, value: string) => {
    let safeValue = value;

    if (["spielerkader", "torhueter", "tage_pro_woche", "einheit_dauer"].includes(field)) {
      if (value === "") {
        safeValue = "";
      } else {
        switch (field) {
          case "spielerkader":
            safeValue = String(clampNumber(value, 1));
            break;
          case "torhueter":
            safeValue = String(clampNumber(value, 0));
            break;
          case "tage_pro_woche":
            safeValue = String(clampNumber(value, 1, 7));
            break;
          case "einheit_dauer":
            safeValue = String(clampNumber(value, 1));
            break;
        }
      }
    }

    setForm({ ...form, [field]: safeValue });
    setError(null);
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage("❌ Kein eingeloggter User gefunden.");
      return;
    }

    // ✅ Validierung vor dem Speichern
    const numFields = {
      spielerkader: parseInt(form.spielerkader, 10),
      torhueter: parseInt(form.torhueter, 10),
      tage_pro_woche: parseInt(form.tage_pro_woche, 10),
      einheit_dauer: parseInt(form.einheit_dauer, 10),
    };

    if (
      numFields.spielerkader < 1 ||
      numFields.torhueter < 0 ||
      numFields.tage_pro_woche < 1 ||
      numFields.tage_pro_woche > 7 ||
      numFields.einheit_dauer < 1
    ) {
      setError("Bitte gültige positive Zahlen eingeben.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("taggy_submissions").upsert(
      [
        {
          user_id: userId,
          altersstufe: form.altersstufe,
          spielerkader: numFields.spielerkader,
          torhueter: numFields.torhueter,
          tage_pro_woche: numFields.tage_pro_woche,
          einheit_dauer: numFields.einheit_dauer,
          plan_typ: "Monat",
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
      ],
      { onConflict: "user_id" }
    );

    setLoading(false);

    if (error) {
      console.error(error);
      if ((error as any).code === "23514") {
        setMessage("❌ Ungültige Eingabe – bitte nur positive Zahlen eingeben.");
      } else {
        setMessage("❌ Fehler beim Speichern: " + error.message);
      }
    } else {
      setMessage("✅ Daten gespeichert!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-xl font-bold">Trainingsdaten</h2>

      {/* 🧱 Eingaben */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Altersstufe</Label>
          <Input
            value={form.altersstufe}
            onChange={(e) => handleChange("altersstufe", e.target.value)}
          />
        </div>

        <div>
          <Label>Spielerkader</Label>
          <Input
            type="number"
            min={1}
            value={form.spielerkader}
            onChange={(e) => handleChange("spielerkader", e.target.value)}
          />
        </div>

        <div>
          <Label>Torhüter</Label>
          <Input
            type="number"
            min={0}
            value={form.torhueter}
            onChange={(e) => handleChange("torhueter", e.target.value)}
          />
        </div>

        <div>
          <Label>Einheiten pro Woche</Label>
          <Input
            type="number"
            min={1}
            max={7}
            value={form.tage_pro_woche}
            onChange={(e) => handleChange("tage_pro_woche", e.target.value)}
          />
        </div>

        <div>
          <Label>Einheitsdauer (Minuten)</Label>
          <Input
            type="number"
            min={1}
            value={form.einheit_dauer}
            onChange={(e) => handleChange("einheit_dauer", e.target.value)}
          />
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
              <SelectItem value="Hinrunde">Hinrunde</SelectItem>
              <SelectItem value="Winterpause">Winterpause</SelectItem>
              <SelectItem value="Rückrunde">Rückrunde</SelectItem>
              <SelectItem value="Saison-Ende">Saison-Ende</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
            <SelectItem value="4-4-2">4-4-2</SelectItem>
            <SelectItem value="4-1-4-1">4-1-4-1</SelectItem>
            <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
            <SelectItem value="3-5-2">3-5-2</SelectItem>
            <SelectItem value="3-4-3">3-4-3</SelectItem>
            <SelectItem value="5-3-2">5-3-2</SelectItem>
            <SelectItem value="5-2-3">5-2-3</SelectItem>
          </SelectContent>
        </Select>
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
            <SelectItem value="DFB">DFB-Trainingsphilosophie</SelectItem>
            <SelectItem value="Horst Wein Funino">Funino - Horst Wein</SelectItem>
            <SelectItem value="Niederlande">Niederlandes Philosophie</SelectItem>
            <SelectItem value="Spanien">Spaniens Philosophie</SelectItem>
            <SelectItem value="Dribbler">Dribbler wie Jamal und Messi</SelectItem>
            <SelectItem value="Quälix">Quälix wie Magath</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {/* Rest unverändert */}
      {/* Saisonphase, Ziel, Spielidee etc... */}
      {/* Variante 1: Statischer Block */}
      <div className="border rounded p-4 bg-gray-700 shadow-sm mt-4">
        <h3 className="text-lg font-bold text-gray-100 mb-2">Trainingsphilosophie</h3>
        <ul className="list-disc pl-6 space-y-1 text-gray-200">
          <li>
            <b>DFB:</b> systematische breite Ausbildung, Technik + Spielformen, klare Abläufe, strukturierte Spieleröffnung
          </li>
          <li>
            <b>Horst Wein:</b> spielerisch, kleine Spielformen, Funino-Logik, Umschalten im Kleinen, intensives Lernen
          </li>
          <li>
            <b>Niederlande:</b> Rondos, Spielfluss, Ballbesitz sichern, Umschalten variabel, viel Tempo
          </li>
          <li>
            <b>Spanien:</b> Positionsspiel, Tiqui-Taca, Dreiecksbildung, sofortiges Gegenpressing nach Ballverlust, sehr gute Technik und Entscheidungsfähigkeit
          </li>
          <li>
            <b>Dribbler:</b> 1v1, Kreativität, mutige Aktionen, viel individuelles Dribbeln, freie Lösungen im Umschalten
          </li>
          <li>
            <b>Quälix:</b> Hohe Intensität, Kondition, Disziplin, klare Lauf- und Zweikampfvorgaben
          </li>
        </ul>
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
        {loading ? "Speichern..." : "Speichern"}
      </Button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
