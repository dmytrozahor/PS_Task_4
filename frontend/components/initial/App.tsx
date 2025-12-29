import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchReviews,
    createReview,
    editReview,
    deleteReview,
} from '../../app/actions/reviews.action';
import { type AppDispatch } from '../../app/types/reviews.types';
import { type RootState } from '../../app/stores/reviews.store';
import { type Review } from '../../app/types/reviews.types';
import './style/App.css';

const PAGE_SIZE = 5;

const App = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: reviews, loading, nextCursor } = useSelector(
        (state: RootState) => state.reviews
    );

    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [bookId, setBookId] = useState<number>(654);

    const [newReview, setNewReview] = useState({
        bookId: 0,
        rating: 1,
        comment: '',
    });

    useEffect(() => {
        dispatch(fetchReviews({ bookId: bookId, limit: PAGE_SIZE }));
    }, [dispatch, bookId]);

    const handleCreate = () => {
        dispatch(createReview(newReview));
        setNewReview({ bookId: 0, rating: 1, comment: '' });
    };

    const handleUpdate = () => {
        if (!selectedReview) return;
        dispatch(editReview(selectedReview));
    };

    const handleDelete = () => {
        if (!selectedReview) return;
        if (!confirm('Delete this review?')) return;
        dispatch(deleteReview(selectedReview._id));
        setSelectedReview(null);
    };

    const loadMore = () => {
        if (!nextCursor) return;
        dispatch(fetchReviews({ bookId: bookId, limit: PAGE_SIZE, cursor: nextCursor }));
    };

    return (
        <div className="layout">
            {/* COLUMN 1 – CREATE */}
            <section className="column">
                <h2>Create Review</h2>

                <input
                    type="number"
                    placeholder="Book ID"
                    value={newReview.bookId}
                    onChange={(e) =>
                        setNewReview({ ...newReview, bookId: Number(e.target.value) })
                    }
                />

                <input
                    type="number"
                    min={1}
                    max={5}
                    value={newReview.rating}
                    onChange={(e) =>
                        setNewReview({ ...newReview, rating: Number(e.target.value) })
                    }
                />

                <textarea
                    placeholder="Comment"
                    value={newReview.comment}
                    onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                    }
                />

                <button onClick={handleCreate}>Create</button>
            </section>

            {/* COLUMN 2 – EDIT */}
            <section className="column">
                <h2>Edit Review</h2>

                {selectedReview ? (
                    <>
                        <p><strong>ID:</strong> {selectedReview._id}</p>

                        <input
                            type="number"
                            min={1}
                            max={5}
                            value={selectedReview.rating}
                            onChange={(e) =>
                                setSelectedReview({
                                    ...selectedReview,
                                    rating: Number(e.target.value),
                                })
                            }
                        />

                        <textarea
                            value={selectedReview.comment}
                            onChange={(e) =>
                                setSelectedReview({
                                    ...selectedReview,
                                    comment: e.target.value,
                                })
                            }
                        />

                        <div className="button-group">
                            <button onClick={handleUpdate}>Update</button>
                            <button className="danger" onClick={handleDelete}>
                                Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <p>Select a review from the list</p>
                )}
            </section>

            {/* COLUMN 3 – LIST */}
            <section className="column">
                <h2>Reviews</h2>

                <input
                    type="text"
                    placeholder="Book ID"
                    value={bookId}
                    onChange={(e) => setBookId(Number(e.target.value))}
                />

                {loading && <p>Loading...</p>}

                <ul className="review-list">
                    {reviews.map((r) => (
                        <li
                            key={r._id}
                            className="review-item"
                            onClick={() => setSelectedReview(r)}
                        >
                            <strong>Book:</strong> {r.bookId}<br />
                            <strong>Rating:</strong> {r.rating}/5<br />
                            <span>{r.comment}</span>
                        </li>
                    ))}
                </ul>

                {nextCursor && (
                    <button onClick={loadMore} disabled={loading}>
                        Load more
                    </button>
                )}
            </section>
        </div>
    );
};

export default App;
