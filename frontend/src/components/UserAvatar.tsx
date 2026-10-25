export default function UserAvatar({ name }: { name: string }) {
    const initials = name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
    return (
        <span className="user-avatar" aria-hidden="true">
            {initials}
        </span>
    );
}
