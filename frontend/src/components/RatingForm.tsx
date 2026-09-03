import { useState, type SubmitEvent } from 'react';
import type { RatingResponse, RatingUpdate } from '../types/rating';

interface RatingFormProps {
    rating: RatingResponse | null;
    isSaving: boolean;
    errorMessage: string | null;
    onSave: (data: RatingUpdate) => void;
}

function RatingForm({
    rating,
    isSaving,
    errorMessage,
    onSave,
}: RatingFormProps) {
    const [score, setScore] = useState(
        rating ? String(rating.score) : ''
    );
    const [comment, setComment] = useState(rating?.comment ?? '');
    const [validationMessage, setValidationMessage] = useState<string | null>(
        null
    );

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (score === '') {
            setValidationMessage('Selecione uma nota.');
            return;
        }

        setValidationMessage(null);
        onSave({
            score: Number(score),
            comment: comment.trim(),
        });
    }

    return (
        <section>
            <h2>{rating ? 'Editar minha avaliação' : 'Avaliar este livro'}</h2>

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="rating-score">Nota</label>
                    <select
                        id="rating-score"
                        value={score}
                        onChange={(event) => {
                            setScore(event.target.value);
                            setValidationMessage(null);
                        }}
                        disabled={isSaving}
                        aria-invalid={Boolean(validationMessage)}
                        aria-describedby={
                            validationMessage ? 'rating-score-error' : undefined
                        }
                    >
                        <option value="" disabled>
                            Selecione uma nota
                        </option>
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>

                    {validationMessage && (
                        <p id="rating-score-error">{validationMessage}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="rating-comment">Comentário</label>
                    <textarea
                        id="rating-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        disabled={isSaving}
                    />
                </div>

                {errorMessage && <p role="alert">{errorMessage}</p>}

                <button type="submit" disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar avaliação'}
                </button>
            </form>
        </section>
    );
}

export default RatingForm;
