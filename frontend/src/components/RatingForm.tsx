import { useState, type SubmitEvent } from 'react';
import StarRating from './StarRating';
import type { RatingResponse, RatingUpdate } from '../types/rating';

interface RatingFormProps {
    rating: RatingResponse | null;
    isSaving: boolean;
    errorMessage: string | null;
    onSave: (data: RatingUpdate) => void;
    onCancel: () => void;
}
export default function RatingForm({
    rating,
    isSaving,
    errorMessage,
    onSave,
    onCancel,
}: RatingFormProps) {
    const [score, setScore] = useState(rating ? String(rating.score) : '');
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
        onSave({ score: Number(score), comment: comment.trim() });
    }
    return (
        <form
            id="book-rating-form"
            className="book-rating-form login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={isSaving}
            aria-label={
                rating ? 'Editar minha avaliação' : 'Avaliar este livro'
            }
        >
            <div className="login-field">
                <StarRating
                    value={score}
                    onChange={(value) => {
                        setScore(value);
                        setValidationMessage(null);
                    }}
                    disabled={isSaving}
                    invalid={Boolean(validationMessage)}
                />
                {validationMessage && (
                    <p
                        id="rating-score-error"
                        className="book-error"
                        role="alert"
                    >
                        {validationMessage}
                    </p>
                )}
            </div>
            <div className="login-field">
                <label htmlFor="rating-comment">
                    Comentário <span className="book-muted">(opcional)</span>
                </label>
                <textarea
                    id="rating-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    disabled={isSaving}
                />
            </div>
            {errorMessage && (
                <p className="book-error" role="alert">
                    {errorMessage}
                </p>
            )}
            <div className="book-form-actions">
                <button
                    className="book-primary"
                    type="submit"
                    disabled={isSaving}
                >
                    {isSaving ? 'Salvando...' : 'Salvar avaliação'}
                </button>
                <button
                    className="book-secondary"
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
