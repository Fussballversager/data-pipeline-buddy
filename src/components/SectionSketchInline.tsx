import { useLatestSectionSketch } from "@/hooks/useLatestSectionSketch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const DEFAULT_HEIGHT = "h-[28rem]";
const SHOW_BORDER = false;

export function SectionSketchInline({
  sectionId,
  abschnittNr,
  heightClass = DEFAULT_HEIGHT,
  printMaxHeightClass = "print:max-h-[80mm]", // <= Print-Größe hier zentral steuerbar

}: {
  sectionId: string;
  abschnittNr: number;
  heightClass?: string;
  printMaxHeightClass?: string
}) {
  if ([0, 8].includes(Number(abschnittNr))) return null;

  const { url, loading } = useLatestSectionSketch(sectionId);
  if (loading) return <div className="mt-3 text-xs text-gray-400">Skizze lädt…</div>;
  if (!url) return null;

  const title = `Skizze · Abschnitt ${abschnittNr}`;

  return (
    <div className="mt-4 break-inside-avoid">
      {/* Bildschirm-Version (Dialog) */}
      <div className="print:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="w-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
              aria-label={`${title} in groß öffnen`}
            >
              <div className={`w-full ${heightClass} ${SHOW_BORDER ? "border" : ""} rounded-xl bg-transparent p-2`}>
                <div className="h-full w-full flex items-center justify-end lg:pr-2">
                  <img
                    src={url}
                    alt={title}
                    className="max-h-full max-w-full object-contain object-right transition-transform duration-200 group-hover:scale-[1.005]"

                    loading="eager"
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Print-Fallback: pures IMG */}
      <div className="hidden print:block">
        <img src={url} alt={title} className={`w-full h-auto object-contain ${printMaxHeightClass}`} />
      </div>
    </div>
  );
}
