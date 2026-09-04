import type { RatingResponse } from '../types/rating';

interface RatingsListProps {
    ratings: RatingResponse[];
}

function RatingsList({ ratings }: RatingsListProps) {
    return (
        <section className="mt-8">
            <h2 className="mb-3">Avaliações</h2>

            {ratings.length === 0 ? (
                <p>Este livro ainda não possui avaliações.</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {ratings.map((rating) => (
                        <article
                            className="flex flex-col gap-1"
                            key={rating.id}
                        >
                            <p>
                                <strong>{rating.user.name}</strong>:{' '}
                                {rating.score}/5
                            </p>
                            {rating.comment && <p>{rating.comment}</p>}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

export default RatingsList;
