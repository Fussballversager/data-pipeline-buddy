import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

type AuthWrapperProps = {
  children?: React.ReactNode; // optional, weil Login-Seite auch ohne geht
};

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{ padding: 20 }}>⏳ Lade...</div>;
  }

  if (!session) {
    // Kein Login → Supabase Auth UI anzeigen
    return (
      <div style={{ maxWidth: 400, margin: "50px auto" }}>
        <h2>Login</h2>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  // Eingeloggt → wenn Kinder übergeben, diese anzeigen
  if (children) {
    return <>{children}</>;
  }

  // Eingeloggt, aber keine Kinder (z. B. auf /login)
  return (
    <div style={{ padding: 20 }}>
      ✅ Erfolgreich eingeloggt! <br />
      Gehe zu <a href="/dataform"><b>/dataform</b></a>
    </div>
  );
  }
