import '../styles/brand.css';

interface BrandLogoProps {
    tone?: 'dark' | 'light';
}

function BrandLogo({ tone = 'dark' }: BrandLogoProps) {
    const color = tone === 'light' ? 'branco' : 'preto';

    return (
        <img
            className="brand-logo"
            src={`/brand/png/logo-horizontal/letterbooks-logo-horizontal-${color}-740.png`}
            srcSet={`/brand/png/logo-horizontal/letterbooks-logo-horizontal-${color}-1480.png 2x`}
            width={740}
            height={160}
            alt="LetterBooks"
        />
    );
}

export default BrandLogo;
