import { useState } from 'react';
import { Star } from 'lucide-react';

export function RatingStars({ score }: { score: number }) {
    return (
        <span
            className="book-stars"
            aria-label={`${score} de 5 estrelas`}
            role="img"
        >
            {[1, 2, 3, 4, 5].map((value) => (
                <Star
                    key={value}
                    size={15}
                    fill={value <= score ? 'currentColor' : 'none'}
                    aria-hidden="true"
                />
            ))}
        </span>
    );
}
export default function StarRating({
    value,
    onChange,
    disabled,
    invalid,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    invalid: boolean;
}) {
    const [preview, setPreview] = useState<number | null>(null);
    const active = preview ?? Number(value || 0);
    return (
        <fieldset
            className="book-star-field"
            disabled={disabled}
            aria-describedby={invalid ? 'rating-score-error' : undefined}
            aria-invalid={invalid}
        >
            <legend>Sua nota</legend>
            <div
                className="book-star-options"
                onMouseLeave={() => setPreview(null)}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <label
                        key={star}
                        className="book-star-option"
                        onMouseEnter={() => !disabled && setPreview(star)}
                    >
                        <input
                            className="book-visually-hidden"
                            type="radio"
                            name="rating-score"
                            value={star}
                            checked={value === String(star)}
                            onChange={() => onChange(String(star))}
                            onFocus={() => setPreview(null)}
                            onBlur={() => setPreview(null)}
                            aria-label={`${star} de 5 estrelas`}
                            autoFocus={
                                star === (value === '' ? 1 : Number(value))
                            }
                        />
                        <Star
                            size={27}
                            fill={star <= active ? 'currentColor' : 'none'}
                            aria-hidden="true"
                        />
                    </label>
                ))}
                <label className="book-zero-rating">
                    <input
                        type="radio"
                        name="rating-score"
                        value="0"
                        checked={value === '0'}
                        onChange={() => onChange('0')}
                        autoFocus={value === '0'}
                        onFocus={() => setPreview(null)}
                    />{' '}
                    Sem estrelas
                </label>
            </div>
        </fieldset>
    );
}
