// src/components/SectionSketchInline.tsx
import { useLatestSectionSketch } from "@/hooks/useLatestSectionSketch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// kleine "Konstanten" = spätere Feineinstellungen an einer Stelle ändern
const DEFAULT_HEIGHT = "h-[28rem]";   // z.B. "h-96" | "h-[32rem]"
const SHOW_BORDER = false;             // auf false setzen, wenn randlos

export function SectionSketchInline({
  sectionId,
  abschnittNr,
  heightClass = DEFAULT_HEIGHT,
}: {
  sectionId: string;
  abschnittNr: number;
  heightClass?: string;
}) {
  if ([0, 8].includes(Number(abschnittNr))) return null;

  const { url, loading } = useLatestSectionSketch(sectionId);
  if (loading) return <div className="mt-3 text-xs text-gray-400">Skizze lädt…</div>;
  if (!url) return null;

  const title = `Skizze · Abschnitt ${abschnittNr}`;

  return (
    <div className="mt-4">
{/* <div className="text-sm text-gray-300 mb-1">{title}</div> */}

      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
            aria-label={`${title} in groß öffnen`}
          >
 <div className={`w-full ${heightClass} ${SHOW_BORDER ? "border" : ""} rounded-xl bg-transparent p-2 md:pl-6 md:pr-2`}>
              <div className="h-full w-full flex items-center justify-center">
                <img
                  src={url}
                  alt={title}
                  className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.005]"
                  loading="lazy"
                />
              </div>
            </div>
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-[95vw] sm:max-w-5xl p-4">
          <img
            src={url}
            alt={title}
            className="max-h-[80vh] w-auto max-w-full object-contain mx-auto"
          />
          <div className="mt-2 text-sm text-center">{title}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
