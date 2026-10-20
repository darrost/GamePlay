import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReleaseDate, getPlatformLabel, isValidGameId } from '../src/utils/gamePresentation.js';

test('accepts canonical database UUIDs and rejects malformed route IDs', () => {
    assert.equal(isValidGameId('696d2002-2c3d-408a-ab54-283785273cd5'), true);
    assert.equal(isValidGameId('696D2002-2C3D-408A-AB54-283785273CD5'), true);
    for (const value of ['create', '', undefined, '123', "x' OR true", '696d2002-2c3d-408a-ab54-283785273cd5-extra']) {
        assert.equal(isValidGameId(value), false);
    }
});

test('shows platform labels consistently with the creation form', () => {
    assert.equal(getPlatformLabel('PC'), 'Windows (PC)');
    assert.equal(getPlatformLabel('Linux'), 'Linux');
    assert.equal(getPlatformLabel('Other'), 'Other platform');
    assert.equal(getPlatformLabel('Future platform'), 'Future platform');
});

test('formats calendar dates in UTC and handles unknown dates', () => {
    assert.equal(formatReleaseDate('2022-02-25'), '25 Feb 2022');
    assert.equal(formatReleaseDate('2024-02-29'), '29 Feb 2024');
    for (const value of [null, undefined, '', 'invalid']) {
        assert.equal(formatReleaseDate(value), 'Release date unknown');
    }
});
