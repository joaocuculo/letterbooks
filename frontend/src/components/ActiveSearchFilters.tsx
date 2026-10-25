import { Badge } from './ui/badge';

export default function ActiveSearchFilters({
    items,
}: {
    items: { label: string; value?: string }[];
}) {
    const active = items.filter((item) => item.value?.trim());
    if (!active.length) return null;
    return (
        <div
            className="active-search-filters"
            role="group"
            aria-label="Filtros da pesquisa avançada"
        >
            {active.map((item) => (
                <Badge
                    key={item.label}
                    variant="secondary"
                    className="active-search-filter"
                >
                    <strong>{item.label}:</strong> {item.value}
                </Badge>
            ))}
        </div>
    );
}
