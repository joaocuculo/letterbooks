import { Feedback } from './ui/feedback';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useState, type SubmitEvent } from 'react';
import StarRating from './StarRating';
import type { RatingResponse, RatingUpdate } from '../types/rating';

interface RatingFormProps {
    rating: RatingResponse | null;
    isSaving: boolean;
    errorMessage: string | null;
    onSave: (data: RatingUpdate) => void;
    onCancelEditing?: () => void;
}
export default function RatingForm({
    rating,
    isSaving,
    errorMessage,
    onSave,
    onCancelEditing,
}: RatingFormProps) {
    const [score, setScore] = useState(rating ? String(rating.score) : '');
    const [comment, setComment] = useState(rating?.comment ?? '');
    const [validationMessage, setValidationMessage] = useState<string | null>(
        null
    );
    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isSaving) return;
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
                <Textarea
                    id="rating-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    disabled={isSaving}
                />
            </div>
            {errorMessage && <Feedback kind="error" title={errorMessage} />}
            <div className="book-form-actions">
                <Button
                    loading={isSaving}
                    variant="default"
                    type="submit"
                    disabled={isSaving || score === ''}
                >
                    {isSaving ? 'Publicando...' : 'Publicar avaliação'}
                </Button>
                {onCancelEditing && (
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={isSaving}
                        onClick={onCancelEditing}
                    >
                        Cancelar edição
                    </Button>
                )}
            </div>
        </form>
    );
}
