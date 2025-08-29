import React, { useState } from "react";

interface Props {
  plan: any; // der komplette Plan aus PlanViewer
}

const SendToMakeButton: React.FC<Props> = ({ plan }) => {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const sendToMake = async () => {
    setStatus("loading");
    console.log("📡 Sende Plan an Make...");
    console.log("➡️ Payload:", plan);

    try {
      const response = await fetch(
        "https://hook.eu2.make.com/jr6wvnrr27mc7wr0r73pkstjb2o75z5p", // deine korrekte URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(plan), // hier jetzt der gesamte Datensatz
        }
      );

      if (!response.ok) throw new Error("Fehler beim Webhook-Request");

      console.log("✅ Request erfolgreich:", response.status);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("❌ Fehler beim Request:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <button
      onClick={sendToMake}
      disabled={status === "loading"}
      className={`px-4 py-2 rounded-lg text-white ${
        status === "loading"
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
      }`}
    >
      {status === "loading"
        ? "Senden..."
        : status === "success"
        ? "✅ Gesendet"
        : status === "error"
        ? "❌ Fehler"
        : "An Make senden"}
    </button>
  );
};

export default SendToMakeButton;
