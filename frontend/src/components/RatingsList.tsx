import type { RatingResponse } from '../types/rating';

interface RatingsListProps {
    ratings: RatingResponse[];
}

function RatingsList({ ratings }: RatingsListProps) {
    return (
        <section>
            <h2>Avaliações</h2>

            {ratings.length === 0 ? (
                <p>Este livro ainda não possui avaliações.</p>
            ) : (
                ratings.map((rating) => (
                    <article key={rating.id}>
                        <p>
                            <strong>{rating.user.name}</strong>: {rating.score}/5
                        </p>
                        {rating.comment && <p>{rating.comment}</p>}
                    </article>
                ))
            )}
        </section>
    );
}

export default RatingsList;
