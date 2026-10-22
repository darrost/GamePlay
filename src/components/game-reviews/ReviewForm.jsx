import { useRef, useState } from 'react';
import { validateReview } from '../../utils/reviewValidation';

export default function ReviewForm({ initialValues = { rating: '', body: '' }, onSave, onCancel, editing = false }) {
    const [values, setValues] = useState(() => ({ rating: String(initialValues.rating), body: initialValues.body }));
    const [errors, setErrors] = useState({});
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const pending = useRef(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
        setErrors({});
        setError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (pending.current) return;
        const validationErrors = validateReview(values);
        setErrors(validationErrors);
        setError('');
        const firstInvalid = Object.keys(validationErrors)[0];
        if (firstInvalid) {
            event.currentTarget.querySelector(`[name="${firstInvalid}"]`)?.focus();
            return;
        }

        pending.current = true;
        setIsSaving(true);
        try {
            await onSave(values);
        } catch (requestError) {
            if (requestError?.code === '23505') {
                setError('You already reviewed this game. Reload reviews to manage your existing review.');
            } else if (requestError?.code === '42501' || requestError?.status === 401) {
                setError('You do not have permission to save this review. Check that you are logged in with the correct account.');
            } else {
                setError('We could not save your review. Check your connection and try again.');
            }
        } finally {
            pending.current = false;
            setIsSaving(false);
        }
    }

    return (
        <form className="review-form" onSubmit={handleSubmit} noValidate aria-busy={isSaving}>
            <h3>{editing ? 'Edit your review' : 'Write a review'}</h3>
            <fieldset disabled={isSaving}>
                <fieldset className="review-rating-picker" aria-invalid={Boolean(errors.rating)}
                    aria-describedby={errors.rating ? 'review-rating-error' : undefined}>
                    <legend>Rating</legend>
                    <div className="review-rating-options">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <label key={rating} className="review-rating-option">
                                <input type="radio" name="rating" value={rating} checked={values.rating === String(rating)}
                                    onChange={handleChange} required aria-label={`${rating} ${rating === 1 ? 'star' : 'stars'}`} />
                                <span className={rating <= Number(values.rating) ? 'is-selected' : ''} aria-hidden="true">★</span>
                            </label>
                        ))}
                    </div>
                    <span className="review-rating-value">{values.rating ? `${values.rating} / 5 stars` : 'Choose a rating'}</span>
                </fieldset>
                {errors.rating && <p className="review-error" id="review-rating-error">{errors.rating}</p>}
                <label htmlFor="review-body">Your review</label>
                <textarea id="review-body" name="body" rows={5} value={values.body} onChange={handleChange} required
                    aria-invalid={Boolean(errors.body)} aria-describedby={`review-body-hint${errors.body ? ' review-body-error' : ''}`} />
                <p id="review-body-hint">1–2,000 characters. Reviews are visible to everyone.</p>
                {errors.body && <p className="review-error" id="review-body-error">{errors.body}</p>}
                {Object.keys(errors).length > 0 && <p className="review-error" role="alert">Please correct the highlighted fields.</p>}
                {error && <p className="review-error" role="alert">{error}</p>}
                <div className="review-actions">
                    <button type="submit">{isSaving ? 'Saving review…' : editing ? 'Save review changes' : 'Post review'}</button>
                    {onCancel && <button type="button" onClick={onCancel}>Cancel editing</button>}
                </div>
                {isSaving && <p role="status">Saving your review. Please wait.</p>}
            </fieldset>
        </form>
    );
}
