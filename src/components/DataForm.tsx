import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DataForm() {
  const [form, setForm] = useState({
    name: "",
    verein: "",
    team: "",
    altersstufe: "",
    spieleranzahl: "",
  });

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🧠 User laden + vorhandene Stammdaten holen
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", data.user.id)
        .limit(1)
        .single();

      if (profile) {
        setForm({
          name: profile.display_name ?? "",
          verein: profile.verein ?? "",
          team: profile.team ?? "",
          altersstufe: profile.altersstufe ?? "",
          spieleranzahl: profile.spieleranzahl?.toString() ?? "",
        });
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "spieleranzahl") {
      const num = parseInt(value, 10);
      // Eingabe korrigieren & validieren
      if (isNaN(num) || num < 1) {
        setError("Bitte eine gültige Spieleranzahl (mind. 1) eingeben.");
        setForm({ ...form, spieleranzahl: value });
      } else {
        setError(null);
        setForm({ ...form, spieleranzahl: String(num) });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage("❌ Kein eingeloggter User gefunden.");
      return;
    }

    // Letzter Schutz vor dem Speichern
    const num = parseInt(form.spieleranzahl, 10);
    if (isNaN(num) || num < 1) {
      setError("Spieleranzahl muss mindestens 1 betragen.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("user_profiles").upsert([
      {
        user_id: userId,
        display_name: form.name,
        verein: form.verein,
        team: form.team,
        altersstufe: form.altersstufe,
        spieleranzahl: num,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      if ((error as any).code === "23514") {
        setMessage("❌ Ungültige Eingabe – Spieleranzahl muss positiv sein.");
      } else {
        setMessage("❌ Fehler beim Speichern: " + error.message);
      }
    } else {
      setMessage("✅ Stammdaten gespeichert!");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Stammdaten</h2>

      <div>
        <Label>Trainer</Label>
        <Input name="name" value={form.name} onChange={handleChange} />
      </div>

      <div>
        <Label>Verein</Label>
        <Input name="verein" value={form.verein} onChange={handleChange} />
      </div>

      <div>
        <Label>Team</Label>
        <Input name="team" value={form.team} onChange={handleChange} />
      </div>

      <div>
        <Label>Altersstufe</Label>
        <Input
          name="altersstufe"
          value={form.altersstufe}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Spielerkader</Label>
        <Input
          type="number"
          name="spieleranzahl"
          min={1}
          step={1}
          value={form.spieleranzahl}
          onChange={handleChange}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Speichern..." : "Speichern"}
      </Button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
