import test from 'node:test';
import assert from 'node:assert/strict';
import { toReviewPayload, validateReview } from '../src/utils/reviewValidation.js';

const valid = { rating: '4', body: 'A thoughtful and detailed review of this game.' };

test('reviews accept each whole-star rating from one to five', () => {
    for (const rating of ['1', '2', '3', '4', '5']) {
        assert.deepEqual(validateReview({ ...valid, rating }), {});
    }
});

test('reviews reject missing, fractional, nonnumeric, and out-of-range ratings', () => {
    for (const rating of ['', undefined, '0', '6', '3.5', 'excellent', Infinity]) {
        assert.ok(validateReview({ ...valid, rating }).rating);
    }
});

test('review length uses trimmed characters and counts emoji correctly', () => {
    for (const length of [1, 2000]) {
        assert.equal(validateReview({ ...valid, body: ` ${'🎮'.repeat(length)} ` }).body, undefined);
    }
    for (const body of ['', '   ', 'a'.repeat(2001)]) {
        assert.ok(validateReview({ ...valid, body }).body);
    }
});

test('review payload converts rating and excludes ownership and identity fields', () => {
    assert.deepEqual(toReviewPayload({ ...valid, body: ` ${valid.body} `, id: 'injected',
        user_id: 'someone-else', game_id: 'different-game', created_at: 'injected' }),
    { rating: 4, body: valid.body });
});
