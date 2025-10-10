import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { AuthWrapper } from "@/components/AuthWrapper";
import { DataForm } from "@/components/DataForm";
import { TrainingForm } from "@/components/TrainingForm";
import { Button } from "@/components/ui/button";
import { User, Dumbbell } from "lucide-react"; // 👈 Icons
import { Dashboard } from "@/components/Dashboard";
import { LayoutDashboard } from "lucide-react";
import { PlanManager } from "@/components/PlanManager";
import { CalendarCheck } from "lucide-react";
import { PlanViewer } from "@/components/PlanViewer";
import { TrainingDayOverview } from "@/components/TrainingDayOverview";
import DayPlanPage from "@/pages/DayPlanPage";
import { MonthOverview } from "@/pages/MonthOverview";
import { WeekOverview } from "@/pages/WeekOverview";
import { DayOverview } from "@/pages/DayOverview";
import { MonthDetail } from "@/pages/MonthDetail";
import { WeekDetail } from "@/pages/WeekDetail";
import { DayDetail } from "@/pages/DayDetail";
import { DayMeta } from "@/pages/DayMeta";


// Kleine Wrapper-Komponente für NavButton mit Icon
function NavButton({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <Button
        className={
          isActive
            ? "bg-green-700 text-white flex items-center gap-2"
            : "bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        }
      >
        <Icon className="w-4 h-4" />
        {label}
      </Button>
    </Link>
  );
}

const App = () => (
  <BrowserRouter>
    {/* Navigation */}
    <nav className="flex gap-4 p-4 border-b border-gray-200 mb-6 bg-gray-50">
      <NavButton to="/dataform" label="Stammdaten" icon={User} />
      <NavButton to="/trainingform" label="Trainingsdaten" icon={Dumbbell} />
      <NavButton to="/dashboard" label="Dashboard Trainingsprogramme" icon={LayoutDashboard} />
      <NavButton to="/planmanager" label="Plan-Manager" icon={CalendarCheck} />
      <NavButton to="/months" label="Übersicht" icon={CalendarCheck} />

    </nav>

    <Routes>
      {/* Stammdaten */}
      <Route
        path="/dataform"
        element={
          <AuthWrapper>
            <DataForm />
          </AuthWrapper>
        }
      />

      {/* Trainingsdaten */}
      <Route
        path="/trainingform"
        element={
          <AuthWrapper>
            <TrainingForm />
          </AuthWrapper>
        }
      />

      {/* Default: / -> /dataform */}
      <Route path="/" element={<Navigate to="/dataform" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<div>Not Found</div>} />
      <Route
        path="/dashboard"
        element={
          <AuthWrapper>
            <Dashboard />
          </AuthWrapper>
        }
      />

      <Route
        path="/planmanager"
        element={
          <AuthWrapper>
            <PlanManager />
          </AuthWrapper>
        }
      />

      <Route
        path="/plans/:type/:id"
        element={
          <AuthWrapper>
            <PlanViewer />
          </AuthWrapper>
        }
      />

      <Route path="/plans/day/:id" element={<DayPlanPage />} />

      <Route path="/months" element={<MonthOverview />} />
      <Route path="/month/:monthId" element={<MonthDetail />} />

      <Route path="/weeks/:monthId" element={<WeekOverview />} />
      <Route path="/week/:weekId" element={<WeekDetail />} />

      <Route path="/days/:weekId" element={<DayOverview />} />
      <Route path="/day/:dayId" element={<DayDetail />} />
      <Route path="/day-meta/:dayId" element={<DayMeta />} />

    </Routes>
  </BrowserRouter>
);

export default App;

