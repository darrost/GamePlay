import test from 'node:test';
import assert from 'node:assert/strict';
import { supportedPlatforms, toGamePayload, validateGame } from '../src/utils/gameValidation.js';

const valid = {
    title: 'Test game', description: 'A sufficiently detailed description of a game.',
    image_url: 'https://example.com/cover.jpg', genre: 'Adventure', platforms: ['PC'], release_date: '',
};

test('accepts valid games with optional, future, and leap-day dates', () => {
    for (const release_date of ['', '2030-01-01', '2024-02-29', '2000-02-29', '0001-01-01']) {
        assert.deepEqual(validateGame({ ...valid, release_date }), {});
    }
});

test('requires title, description, cover, genre, and platforms', () => {
    assert.deepEqual(Object.keys(validateGame({
        title: '', description: '', image_url: '', genre: '', platforms: [], release_date: '',
    })), ['title', 'description', 'image_url', 'genre', 'platforms']);
});

test('enforces trimmed text boundaries without counting emoji as two characters', () => {
    for (const [field, min, max] of [['title', 2, 120], ['description', 20, 5000], ['genre', 2, 60]]) {
        for (const size of [min, max]) {
            assert.equal(validateGame({ ...valid, [field]: ` ${'🎮'.repeat(size)} ` })[field], undefined);
        }
        for (const size of [min - 1, max + 1]) {
            assert.ok(validateGame({ ...valid, [field]: 'a'.repeat(size) })[field]);
        }
    }
});

test('rejects non-HTTP, malformed, spaced, and overlong image URLs', () => {
    for (const image_url of ['javascript:alert(1)', 'ftp://example.com/x', '/cover.jpg', 'https://', 'https:example.com', 'https:/example.com', 'https://example.com/a b', `https://example.com/${'a'.repeat(2048)}`]) {
        assert.ok(validateGame({ ...valid, image_url }).image_url);
    }
    assert.equal(validateGame({ ...valid, image_url: 'http://example.com/cover.jpg' }).image_url, undefined);
});

test('requires unique supported platform selections', () => {
    for (const platforms of [[], ['unsupported'], [null], ['PC', 'PC'], 'PC']) {
        assert.ok(validateGame({ ...valid, platforms }).platforms);
    }
    assert.deepEqual(validateGame({ ...valid, platforms: supportedPlatforms }), {});
});

test('rejects impossible dates without silently rolling to another month', () => {
    for (const release_date of ['2025-02-29', '1900-02-29', '2026-04-31', '0000-01-01', '2026-13-01', '2026-01-00', '10/19/2026']) {
        assert.ok(validateGame({ ...valid, release_date }).release_date, release_date);
    }
});

test('payload trims text, uses null for unknown release date, and omits protected fields', () => {
    const payload = toGamePayload({ ...valid, title: ' Test game ', platforms: ['PC', 'PC'],
        id: 'injected-id', owner_id: 'someone-else', created_at: 'injected-date' });
    assert.deepEqual(payload, { ...valid, release_date: null });
    assert.deepEqual(Object.keys(payload), ['title', 'description', 'image_url', 'genre', 'platforms', 'release_date']);
    assert.equal(toGamePayload({ ...valid, release_date: '2026-10-19' }).release_date, '2026-10-19');
});
