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
        <section className="mt-8">
            <h2>{rating ? 'Editar minha avaliação' : 'Avaliar este livro'}</h2>

            <form
                className="mt-3 flex max-w-xl flex-col gap-4"
                onSubmit={handleSubmit}
                noValidate
            >
                <div className="flex flex-col items-start gap-1">
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

                <div className="flex flex-col gap-1">
                    <label htmlFor="rating-comment">Comentário</label>
                    <textarea
                        className="min-h-28 w-full"
                        id="rating-comment"
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        disabled={isSaving}
                    />
                </div>

                {errorMessage && <p role="alert">{errorMessage}</p>}

                <button className="self-start" type="submit" disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar avaliação'}
                </button>
            </form>
        </section>
    );
}

export default RatingForm;
