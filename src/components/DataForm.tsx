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

  // User-ID laden & Stammdaten holen
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);

        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", data.user.id)
          .limit(1)
          .single();

        if (!error && profile) {
          setForm({
            name: profile.display_name ?? "",
            verein: profile.verein ?? "",
            team: profile.team ?? "",
            altersstufe: profile.altersstufe ?? "",
            spieleranzahl: profile.spieleranzahl ?? "",
          });
        }
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!userId) {
      setMessage("❌ Kein eingeloggter User gefunden.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("user_profiles").upsert([
      {
        user_id: userId, // 🔑 wichtig für RLS
        display_name: form.name,
        verein: form.verein,
        team: form.team,
        altersstufe: form.altersstufe,
        spieleranzahl: form.spieleranzahl
          ? parseInt(form.spieleranzahl, 10)
          : null,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      setMessage("❌ Fehler beim Speichern: " + error.message);
    } else {
      setMessage("✅ Stammdaten gespeichert!");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Stammdaten</h2>

      <div>
        <Label>Trainer</Label>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Verein</Label>
        <Input
          name="verein"
          value={form.verein}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label>Team</Label>
        <Input
          name="team"
          value={form.team}
          onChange={handleChange}
        />
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
          name="spieleranzahl"
          type="number"
          value={form.spieleranzahl}
          onChange={handleChange}
        />
      </div>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Speichert..." : "Speichern"}
      </Button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
