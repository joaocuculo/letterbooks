function Footer() {
    const currentYear = new Date().getFullYear();
    const appName = import.meta.env.APP_NAME;
    return (
        <footer className="bg-sky-950 text-white text-center">
            <small>
                @{currentYear} {appName}
            </small>
        </footer>
    );
}

export default Footer;
