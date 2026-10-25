import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from './ui/dropdown-menu';

export default function NavigationMenu({
    label,
    children,
    triggerClassName,
    leading,
    showChevron = true,
}: {
    label: string;
    children: ReactNode;
    triggerClassName?: string;
    leading?: ReactNode;
    showChevron?: boolean;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={triggerClassName}
                render={<Button variant="ghost" />}
            >
                {leading}
                <span className="navigation-menu-label">{label}</span>
                {showChevron && <ChevronDown aria-hidden="true" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6}>
                {children}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
