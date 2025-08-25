import { useState } from "react";
import { AuthWrapper } from "@/components/AuthWrapper";
import { DataForm } from "@/components/DataForm";
import { ResultDisplay } from "@/components/ResultDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Workflow, Database, Zap, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState<'form' | 'result'>('form');
  const [resultId, setResultId] = useState<string>('');
  const { toast } = useToast();

  const handleFormSuccess = (id: string) => {
    setResultId(id);
    setCurrentView('result');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
    setResultId('');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  return (
    <AuthWrapper>
      {(user) => (
        <div className="min-h-screen bg-background">
          {/* Header */}
          <header className="border-b border-muted/20 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-primary rounded-lg">
                    <Workflow className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      Make Integration Platform
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Automatisierte Datenverarbeitung und Workflow-Integration
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Angemeldet</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            {currentView === 'form' ? (
              <div className="space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    Datenverarbeitung mit Make
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Geben Sie Ihre Daten ein, um sie über Make-Workflows zu verarbeiten. 
                    5 wichtige Felder werden für Sie gespeichert, alle 10 Felder werden an Make übertragen.
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <Card className="bg-gradient-card border-muted text-center">
                    <CardHeader>
                      <Database className="h-8 w-8 text-primary mx-auto" />
                      <CardTitle className="text-lg">Datenspeicherung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        5 wichtige Felder werden dauerhaft in der Datenbank gespeichert
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card border-muted text-center">
                    <CardHeader>
                      <Zap className="h-8 w-8 text-primary mx-auto" />
                      <CardTitle className="text-lg">Make Integration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Alle 10 Datenfelder werden automatisch an Ihren Make-Workflow übertragen
                      </CardDescription>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-card border-muted text-center">
                    <CardHeader>
                      <Workflow className="h-8 w-8 text-primary mx-auto" />
                      <CardTitle className="text-lg">Ergebnis-Anzeige</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        Verarbeitete Daten und Empfehlungen werden übersichtlich dargestellt
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>

                {/* Form */}
                <DataForm onSuccess={handleFormSuccess} />
              </div>
            ) : (
              <ResultDisplay resultId={resultId} onBack={handleBackToForm} />
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-muted/20 bg-card/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>© 2025 Make Integration Platform. Automatisierte Datenverarbeitung leicht gemacht.</p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </AuthWrapper>
  );
};

export default Index;
