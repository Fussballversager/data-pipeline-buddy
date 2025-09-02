import { useParams } from "react-router-dom";
import { TrainingDayOverview } from "@/components/TrainingDayOverview";

export default function DayPlanPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <p>Kein Trainingstag ausgewählt</p>;

  return <TrainingDayOverview dayPlanId={id} />;
}
