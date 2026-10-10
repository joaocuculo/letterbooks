import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import '../styles/drawer.css';

// Adaptado do Drawer shadcn/Base UI, com os estilos locais do LetterBooks.
export function Drawer(props: DrawerPrimitive.Root.Props) {
    return <DrawerPrimitive.Root {...props} />;
}
export function DrawerTrigger(props: DrawerPrimitive.Trigger.Props) {
    return <DrawerPrimitive.Trigger {...props} />;
}
export function DrawerClose(props: DrawerPrimitive.Close.Props) {
    return <DrawerPrimitive.Close {...props} />;
}
export function DrawerTitle(props: DrawerPrimitive.Title.Props) {
    return <DrawerPrimitive.Title {...props} />;
}
export function DrawerDescription(props: DrawerPrimitive.Description.Props) {
    return <DrawerPrimitive.Description {...props} />;
}

export function DrawerContent({
    children,
    className,
    ...props
}: DrawerPrimitive.Popup.Props) {
    return (
        <DrawerPrimitive.Portal>
            <DrawerPrimitive.Backdrop className="drawer-overlay" />
            <DrawerPrimitive.Viewport className="drawer-viewport">
                <DrawerPrimitive.Popup
                    className={`drawer-popup ${className || ''}`}
                    {...props}
                >
                    <DrawerPrimitive.Content className="drawer-content">
                        {children}
                    </DrawerPrimitive.Content>
                </DrawerPrimitive.Popup>
            </DrawerPrimitive.Viewport>
        </DrawerPrimitive.Portal>
    );
}
