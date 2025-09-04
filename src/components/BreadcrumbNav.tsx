import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  to?: string; // Wenn vorhanden: Link, sonst nur Text
}

export function BreadcrumbNav({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="text-base text-gray-200 mb-4 px-1">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {item.to ? (
              <Link to={item.to} className="text-blue-400 hover:text-blue-200 font-semibold">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-white">{item.label}</span>
            )}
            {i < items.length - 1 && <span className="text-gray-400">›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

