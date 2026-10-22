import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { createReview, deleteReview, REVIEW_PAGE_SIZE, updateReview } from '../../services/reviewService';
import ReviewForm from './ReviewForm';
import ReviewDeleteDialog from './ReviewDeleteDialog';
import './GameReviews.css';

export default function GameReviews({ gameId, gameTitle, userId }) {
    const { reviews, stats, ownReview, status, count, page, changePage, reload } = useReviews(gameId, userId);
    const [isEditing, setIsEditing] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [notice, setNotice] = useState('');
    const active = useRef(false);
    const pendingDelete = useRef(false);
    const editingRef = useRef(null);
    const editButtonRef = useRef(null);

    useEffect(() => {
        active.current = true;
        return () => { active.current = false; };
    }, []);

    useEffect(() => {
        if (isEditing) editingRef.current?.querySelector('input[name="rating"]:checked')?.focus();
    }, [isEditing]);

    async function handleSave(values) {
        if (ownReview) await updateReview(ownReview.id, userId, values);
        else await createReview(gameId, values);
        if (!active.current) return;
        setNotice(ownReview ? 'Your review was updated.' : 'Your review was posted.');
        setIsEditing(false);
        reload();
    }

    async function handleDelete() {
        if (pendingDelete.current || !ownReview) return;
        pendingDelete.current = true;
        setIsDeleting(true);
        setDeleteError('');
        try {
            await deleteReview(ownReview.id, userId);
            if (!active.current) return;
            setIsConfirming(false);
            setIsEditing(false);
            setNotice('Your review and rating were deleted.');
            reload();
        } catch {
            if (active.current) setDeleteError('We could not delete your review. Check your connection and account, then try again.');
        } finally {
            pendingDelete.current = false;
            if (active.current) setIsDeleting(false);
        }
    }

    function cancelEditing() {
        setIsEditing(false);
        requestAnimationFrame(() => editButtonRef.current?.focus());
    }

    const ownReviewIsVisible = ownReview && reviews.some((review) => review.id === ownReview.id);
    const ownActions = (
        <div className="review-actions">
            <button type="button" ref={editButtonRef} onClick={() => setIsEditing(true)}>Edit your review</button>
            <button type="button" className="review-danger" onClick={() => {
                setDeleteError('');
                setIsConfirming(true);
            }}>Delete your review</button>
        </div>
    );

    const totalPages = Math.max(1, Math.ceil(count / REVIEW_PAGE_SIZE));

    return (
        <section className="game-reviews" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading">Reviews and ratings</h2>
            {notice && <p className="review-notice" role="status">{notice}</p>}
            {status === 'loading' && <p role="status">Loading reviews…</p>}
            {status === 'error' && (
                <div className="review-panel">
                    <p className="review-error" role="alert">We could not load the reviews. Check your connection and try again.</p>
                    <button type="button" onClick={reload}>Try loading reviews again</button>
                </div>
            )}
            {status === 'success' && (
                <>
                    <p className="review-summary">
                        {Number(stats.review_count) > 0
                            ? `${Number(stats.average_rating).toFixed(1)} / 5 stars · ${stats.review_count} ${Number(stats.review_count) === 1 ? 'review' : 'reviews'}`
                            : 'No ratings yet. Be the first to review this game.'}
                    </p>
                    {userId ? (ownReview ? (
                        (isEditing || !ownReviewIsVisible) && <div className="review-panel">
                            {!isEditing && <h3>Your review</h3>}
                            {isEditing ? (
                                <div ref={editingRef}>
                                    <ReviewForm key={ownReview.id} initialValues={ownReview} editing onSave={handleSave} onCancel={cancelEditing} />
                                </div>
                            ) : (
                                <>
                                    <p>{ownReview.rating} / 5 stars</p>
                                    <p className="review-body">{ownReview.body}</p>
                                    {ownActions}
                                </>
                            )}
                        </div>
                    ) : <ReviewForm onSave={handleSave} />) : (
                        <p><Link to="/login">Log in</Link> to rate this game and write a review.</p>
                    )}
                    {reviews.length > 0 ? (
                        <ul className="review-list" aria-label="Community reviews">
                            {reviews.filter((review) => !isEditing || review.id !== ownReview?.id).map((review) => (
                                <li key={review.id} className="review-panel">
                                    <div className="review-byline">
                                        <strong>{review.user_id === userId ? 'Your review' : 'Community member'}</strong>
                                        <time dateTime={review.created_at}>{new Intl.DateTimeFormat('en-GB', {
                                            day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
                                        }).format(new Date(review.created_at))}</time>
                                    </div>
                                    <p className="review-stars" aria-label={`${review.rating} out of 5 stars`}>
                                        <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                    </p>
                                    <p className="review-body">{review.body}</p>
                                    {review.user_id === userId && ownActions}
                                </li>
                            ))}
                        </ul>
                    ) : count > 0 ? <p>No reviews remain on this page. Use Previous to return to earlier reviews.</p> : null}
                    {count > REVIEW_PAGE_SIZE || page > 0 ? (
                        <nav className="review-pagination" aria-label="Review pages">
                            <button type="button" disabled={page === 0} onClick={() => changePage(page - 1)}>Previous reviews</button>
                            <span>Page {page + 1} of {Math.max(page + 1, totalPages)}</span>
                            <button type="button" disabled={(page + 1) * REVIEW_PAGE_SIZE >= count} onClick={() => changePage(page + 1)}>Next reviews</button>
                        </nav>
                    ) : null}
                    <button type="button" className="review-reload" onClick={() => {
                        setIsEditing(false);
                        reload();
                    }}>Reload reviews</button>
                </>
            )}
            {isConfirming && <ReviewDeleteDialog gameTitle={gameTitle} isDeleting={isDeleting} error={deleteError}
                onConfirm={handleDelete} onCancel={() => setIsConfirming(false)} />}
        </section>
    );
}
