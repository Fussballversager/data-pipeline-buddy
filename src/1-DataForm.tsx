import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function DataForm() {
  const [form, setForm] = useState({
    name: "",
    verein: "",
    team: "",
    spielerkader: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // numerische Felder abfangen
    if (name === "spielerkader") {
      const num = parseInt(value, 10);
      setForm({
        ...form,
        [name]: isNaN(num) ? 0 : Math.max(1, num), // mindestens 1
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    // ✅ Sicherheit: validiere vor dem Speichern
    if (form.spielerkader < 1) {
      alert("Bitte eine gültige Spieleranzahl (mind. 1) eingeben.");
      return;
    }

    const { error } = await supabase.from("stammdaten").insert([form]);

    if (error) {
      // 🧠 DB-spezifischen Constraint-Fehler abfangen
      if ((error as any).code === "23514") {
        alert("Ungültige Eingabe – Spieleranzahl muss ≥ 1 sein.");
      } else {
        alert("Fehler beim Speichern: " + error.message);
      }
    } else {
      alert("Gespeichert!");
      setForm({ name: "", verein: "", team: "", spielerkader: 1 });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Stammdaten</h2>

      <input
        name="name"
        placeholder="Trainer"
        value={form.name}
        onChange={handleChange}
      />
      <input
        name="verein"
        placeholder="Verein"
        value={form.verein}
        onChange={handleChange}
      />
      <input
        name="team"
        placeholder="Team"
        value={form.team}
        onChange={handleChange}
      />

      {/* 🧩 Neues Feld: Spielerkader */}
      <input
        type="number"
        name="spielerkader"
        placeholder="Spieleranzahl"
        min={1}
        step={1}
        value={form.spielerkader}
        onChange={handleChange}
      />

      <button onClick={handleSave}>Speichern</button>
    </div>
  );
}
