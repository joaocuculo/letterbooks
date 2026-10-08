import { useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';

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
                {isVisible ? (
                    <EyeOff size={20} strokeWidth={1.7} aria-hidden="true" />
                ) : (
                    <Eye size={20} strokeWidth={1.7} aria-hidden="true" />
                )}
            </button>
        </div>
    );
}

export default PasswordInput;
