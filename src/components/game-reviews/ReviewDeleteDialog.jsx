import { useEffect, useRef } from 'react';

export default function ReviewDeleteDialog({ gameTitle, isDeleting, error, onConfirm, onCancel }) {
    const dialogRef = useRef(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        const trigger = document.activeElement;
        dialog.showModal();
        cancelRef.current?.focus();
        return () => {
            dialog.close();
            trigger?.focus();
        };
    }, []);

    function cancel(event) {
        event?.preventDefault();
        if (!isDeleting) onCancel();
    }

    return (
        <dialog ref={dialogRef} className="review-delete-dialog" onCancel={cancel}
            aria-labelledby="delete-review-heading" aria-describedby="delete-review-description" aria-busy={isDeleting}>
            <h3 id="delete-review-heading">Delete your review?</h3>
            <p id="delete-review-description">Remove your review and rating for <strong>{gameTitle}</strong>? This cannot be undone.</p>
            {error && <p className="review-error" role="alert">{error}</p>}
            <div className="review-actions">
                <button type="button" ref={cancelRef} onClick={cancel} disabled={isDeleting}>Cancel</button>
                <button type="button" className="review-danger" onClick={onConfirm} disabled={isDeleting}>
                    {isDeleting ? 'Deleting review…' : 'Yes, delete review'}
                </button>
            </div>
            {isDeleting && <p role="status">Deleting your review. Please wait.</p>}
        </dialog>
    );
}
