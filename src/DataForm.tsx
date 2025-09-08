import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function DataForm() {
  const [form, setForm] = useState({ name: "", verein: "", team: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const { error } = await supabase.from("stammdaten").insert([form]);
    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Gespeichert!");
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
      <button onClick={handleSave}>Speichern</button>
    </div>
  );
}
