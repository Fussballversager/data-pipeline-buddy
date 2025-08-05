import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, ArrowLeft, Star, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultDisplayProps {
  resultId: string;
  onBack: () => void;
}

interface WorkflowResult {
  id: string;
  result_data: {
    success: boolean;
    processed_data: any;
    recommendation: string;
    score: number;
    next_steps: string[];
  } | null;
  status: string;
}

export function ResultDisplay({ resultId, onBack }: ResultDisplayProps) {
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data, error } = await supabase
          .from('workflow_results')
          .select('*')
          .eq('id', resultId)
          .single();

        if (error) throw error;

        setResult(data);
        
        // Poll for updates if still processing
        if (data.status === 'processing') {
          const interval = setInterval(async () => {
            const { data: updatedData } = await supabase
              .from('workflow_results')
              .select('*')
              .eq('id', resultId)
              .single();
              
            if (updatedData && updatedData.status === 'completed') {
              setResult(updatedData);
              clearInterval(interval);
            }
          }, 1000);

          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error('Error fetching result:', error);
        toast({
          title: "Fehler",
          description: "Ergebnis konnte nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId, toast]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-card border-muted">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Lade Ergebnis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-card border-muted">
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Ergebnis nicht gefunden.</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (result.status === 'processing') {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-card border-muted">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Verarbeitung läuft
          </CardTitle>
          <CardDescription>
            Ihre Daten werden von Make verarbeitet. Bitte warten Sie einen Moment...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Formular
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const resultData = result.result_data;

  if (!resultData || !resultData.success) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gradient-card border-muted">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">Verarbeitung fehlgeschlagen</CardTitle>
          <CardDescription>
            Bei der Verarbeitung Ihrer Daten ist ein Fehler aufgetreten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-card border-muted">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-success mr-2" />
            <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
              Verarbeitung abgeschlossen
            </CardTitle>
          </div>
          <CardDescription>
            Ihre Daten wurden erfolgreich verarbeitet. Hier sind die Ergebnisse:
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Score Card */}
      <Card className="bg-gradient-card border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Bewertung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary">{resultData.score}/100</div>
              <p className="text-muted-foreground">Gesamtbewertung</p>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.ceil(resultData.score / 20)
                      ? 'text-primary fill-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="bg-gradient-card border-muted">
        <CardHeader>
          <CardTitle>Empfehlung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{resultData.recommendation}</p>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-card border-muted">
        <CardHeader>
          <CardTitle>Nächste Schritte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resultData.next_steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <Badge variant="outline" className="shrink-0">
                  {index + 1}
                </Badge>
                <span className="text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Processed Data Summary */}
      <Card className="bg-gradient-card border-muted">
        <CardHeader>
          <CardTitle>Ihre eingereichten Daten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Name:</span>
              <p className="text-foreground">{resultData.processed_data.name}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">E-Mail:</span>
              <p className="text-foreground">{resultData.processed_data.email}</p>
            </div>
            {resultData.processed_data.company && (
              <div>
                <span className="font-medium text-muted-foreground">Unternehmen:</span>
                <p className="text-foreground">{resultData.processed_data.company}</p>
              </div>
            )}
            <div>
              <span className="font-medium text-muted-foreground">Priorität:</span>
              <Badge variant="secondary">{resultData.processed_data.priority_level}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Neue Eingabe
        </Button>
        <Button className="bg-gradient-primary hover:opacity-90">
          Beratungstermin buchen
        </Button>
      </div>
    </div>
  );
}