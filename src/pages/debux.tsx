import React from "react";

export default function Debug() {
  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h2>Env Check</h2>
      <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
    </div>
  );
}
