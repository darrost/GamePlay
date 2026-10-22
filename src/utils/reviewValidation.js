export function validateReview(values) {
    const errors = {};
    const rating = Number(values.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.rating = 'Choose a rating from 1 to 5 stars.';
    }
    const length = [...values.body.trim()].length;
    if (length < 1 || length > 2000) {
        errors.body = 'Write a review between 1 and 2,000 characters.';
    }
    return errors;
}

export function toReviewPayload(values) {
    return { rating: Number(values.rating), body: values.body.trim() };
}
