import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Workflow } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Lade Anwendung...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-gradient-card border-muted">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Workflow className="h-8 w-8 text-primary mr-2" />
              <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                Make Integration
              </CardTitle>
            </div>
            <CardDescription>
              Melden Sie sich an, um Ihre Daten zu verarbeiten und zu speichern.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(142 76% 36%)',
                      brandAccent: 'hsl(142 76% 46%)',
                      inputBackground: 'hsl(240 3.7% 15.9%)',
                      inputBorder: 'hsl(240 3.7% 15.9%)',
                      inputText: 'hsl(0 0% 98%)',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'transition-all duration-200',
                  input: 'bg-secondary/50 border-muted',
                },
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'E-Mail-Adresse',
                    password_label: 'Passwort',
                    button_label: 'Anmelden',
                    loading_button_label: 'Anmeldung läuft...',
                    link_text: 'Haben Sie bereits ein Konto? Melden Sie sich an',
                  },
                  sign_up: {
                    email_label: 'E-Mail-Adresse',
                    password_label: 'Passwort erstellen',
                    button_label: 'Registrieren',
                    loading_button_label: 'Registrierung läuft...',
                    link_text: 'Noch kein Konto? Registrieren Sie sich',
                  },
                },
              }}
              providers={[]}
              redirectTo={window.location.origin}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children(user)}</>;
}