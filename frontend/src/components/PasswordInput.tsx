import { useState, type ComponentProps } from 'react';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
    visibilityLabel: string;
};

function PasswordInput({ visibilityLabel, ...props }: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="login-password-input">
            <input {...props} type={isVisible ? 'text' : 'password'} />
            <button
                className="login-password-toggle"
                type="button"
                onClick={() => setIsVisible((current) => !current)}
                aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} ${visibilityLabel}`}
                aria-controls={props.id}
                disabled={props.disabled}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {isVisible && <path d="m3 3 18 18" />}
                </svg>
            </button>
        </div>
    );
}

export default PasswordInput;
