function Footer() {
    const currentYear = new Date().getFullYear();
    const appName = import.meta.env.VITE_APP_NAME;
    return (
        <footer className="bg-sky-950 text-white text-center">
            <small>
                @{currentYear} {appName}
            </small>
        </footer>
    );
}

export default Footer;
