function Footer() {
    const currentYear = new Date().getFullYear();
    const appName = import.meta.env.VITE_APP_NAME;
    return (
        <footer className="bg-sky-950 px-4 py-3 text-center text-white">
            <small>
                @{currentYear} {appName}
            </small>
        </footer>
    );
}

export default Footer;
