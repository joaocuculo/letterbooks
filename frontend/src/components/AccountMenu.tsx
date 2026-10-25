import UserAvatar from './UserAvatar';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import type { UserResponse } from '../types/user';
import NavigationMenu from './NavigationMenu';
import { DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';

export default function AccountMenu({
    user,
    onSignOut,
}: {
    user: UserResponse | null;
    onSignOut: () => void;
}) {
    return (
        <NavigationMenu
            triggerClassName="account-menu-trigger"
            leading={<UserAvatar name={user?.name ?? 'Minha conta'} />}
            showChevron={false}
            label={user?.name?.split(' ')[0] ?? 'Minha conta'}
        >
            <DropdownMenuItem render={<Link to="/profile" />}>
                Meu perfil
            </DropdownMenuItem>
            {user?.role === 'ADMIN' && (
                <>
                    <DropdownMenuItem render={<Link to="/admin/authors" />}>
                        Autores
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link to="/admin/categories" />}>
                        Categorias
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link to="/admin/users" />}>
                        Usuários
                    </DropdownMenuItem>
                </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onSignOut}>
                <LogOut aria-hidden="true" />
                Sair
            </DropdownMenuItem>
        </NavigationMenu>
    );
}
