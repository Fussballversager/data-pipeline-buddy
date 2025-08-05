import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  priority_level: string;
  project_description: string;
  budget_range: string;
  timeline: string;
  special_requirements: string;
  additional_notes: string;
}

interface DataFormProps {
  onSuccess: (resultId: string) => void;
}

export function DataForm({ onSuccess }: DataFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    phone: "",
    priority_level: "",
    project_description: "",
    budget_range: "",
    timeline: "",
    special_requirements: "",
    additional_notes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Fehler",
          description: "Sie müssen eingeloggt sein, um Daten zu übermitteln.",
          variant: "destructive",
        });
        return;
      }

      // Store the 5 persistent fields in the database
      const { data: userData, error: userDataError } = await supabase
        .from('user_data')
        .insert({
          user_id: user.id,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          priority_level: formData.priority_level
        })
        .select()
        .single();

      if (userDataError) throw userDataError;

      // Prepare all 10 fields for Make webhook
      const makePayload = {
        ...formData,
        user_data_id: userData.id,
        timestamp: new Date().toISOString()
      };

      // Create workflow result entry
      const { data: workflowResult, error: workflowError } = await supabase
        .from('workflow_results')
        .insert({
          user_data_id: userData.id,
          status: 'processing'
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Here you would send to Make webhook
      // For now, we'll simulate a successful response
      console.log('Sending to Make:', makePayload);
      
      // Simulate Make response after 2 seconds
      setTimeout(async () => {
        const mockResult = {
          success: true,
          processed_data: formData,
          recommendation: "Basierend auf Ihren Eingaben empfehlen wir ein Premium-Paket mit erweiterten Funktionen.",
          score: Math.floor(Math.random() * 40) + 60,
          next_steps: [
            "Detaillierte Beratung buchen",
            "Angebot anfordern",
            "Demo-Termin vereinbaren"
          ]
        };

        await supabase
          .from('workflow_results')
          .update({
            result_data: mockResult,
            status: 'completed'
          })
          .eq('id', workflowResult.id);

        onSuccess(workflowResult.id);
      }, 2000);

      toast({
        title: "Daten übermittelt",
        description: "Ihre Daten werden verarbeitet...",
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-card border-muted">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
          Datenerfassung
        </CardTitle>
        <CardDescription>
          Bitte füllen Sie alle Felder aus. 5 Ihrer Angaben werden für weitere Aktionen gespeichert.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Persistent fields (will be saved) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-medium text-primary">Gespeicherte Daten</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="bg-secondary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="bg-secondary/50"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Unternehmen</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-secondary/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority_level">Prioritätsstufe *</Label>
              <Select value={formData.priority_level} onValueChange={(value) => handleInputChange('priority_level', value)}>
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue placeholder="Wählen Sie eine Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Temporary fields (for Make workflow only) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <span className="text-sm font-medium text-muted-foreground">Workflow-Daten</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="project_description">Projektbeschreibung</Label>
              <Textarea
                id="project_description"
                value={formData.project_description}
                onChange={(e) => handleInputChange('project_description', e.target.value)}
                className="bg-secondary/30"
                placeholder="Beschreiben Sie Ihr Projekt..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget-Bereich</Label>
                <Select value={formData.budget_range} onValueChange={(value) => handleInputChange('budget_range', value)}>
                  <SelectTrigger className="bg-secondary/30">
                    <SelectValue placeholder="Budget auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_5k">Unter 5.000€</SelectItem>
                    <SelectItem value="5k_15k">5.000€ - 15.000€</SelectItem>
                    <SelectItem value="15k_50k">15.000€ - 50.000€</SelectItem>
                    <SelectItem value="over_50k">Über 50.000€</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeline">Zeitrahmen</Label>
                <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                  <SelectTrigger className="bg-secondary/30">
                    <SelectValue placeholder="Zeitrahmen wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">So schnell wie möglich</SelectItem>
                    <SelectItem value="1_month">1 Monat</SelectItem>
                    <SelectItem value="3_months">3 Monate</SelectItem>
                    <SelectItem value="6_months">6 Monate</SelectItem>
                    <SelectItem value="flexible">Flexibel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="special_requirements">Besondere Anforderungen</Label>
              <Textarea
                id="special_requirements"
                value={formData.special_requirements}
                onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                className="bg-secondary/30"
                placeholder="Spezielle Anforderungen oder Wünsche..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_notes">Zusätzliche Notizen</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) => handleInputChange('additional_notes', e.target.value)}
                className="bg-secondary/30"
                placeholder="Weitere Informationen..."
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-elegant"
            disabled={isLoading || !formData.name || !formData.email || !formData.priority_level}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verarbeitung läuft...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Daten an Make senden
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}