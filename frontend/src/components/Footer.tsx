function Footer() {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="bg-sky-950 text-white text-center">
            <small>@{currentYear} LetterBooks</small>
        </footer>
    );
}

export default Footer;
