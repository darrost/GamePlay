import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration } from '../src/pages/register/registerValidation.js';

const valid = { email: 'player@example.com', password: 'a-long-password', confirmPassword: 'a-long-password' };

test('accepts valid registration values and surrounding email whitespace', () => {
    assert.deepEqual(validateRegistration(valid), {});
    assert.deepEqual(validateRegistration({ ...valid, email: ' player@example.com ' }), {});
});

test('requires all three fields', () => {
    assert.deepEqual(Object.keys(validateRegistration({ email: '', password: '', confirmPassword: '' })),
        ['email', 'password', 'confirmPassword']);
});

test('rejects malformed email addresses', () => {
    for (const email of ['player', 'player@', '@example.com', 'player name@example.com', 'a@b@c.com']) {
        assert.ok(validateRegistration({ ...valid, email }).email, email);
    }
});

test('rejects excessively long email addresses', () => {
    assert.ok(validateRegistration({ ...valid, email: `${'a'.repeat(250)}@example.com` }).email);
});

test('enforces both password length boundaries', () => {
    for (const size of [7, 129]) {
        const password = 'a'.repeat(size);
        assert.ok(validateRegistration({ ...valid, password, confirmPassword: password }).password);
    }
    for (const size of [8, 128]) {
        const password = 'a'.repeat(size);
        assert.deepEqual(validateRegistration({ ...valid, password, confirmPassword: password }), {});
    }
});

test('requires exact confirmation without trimming the password', () => {
    assert.ok(validateRegistration({ ...valid, confirmPassword: `${valid.password} ` }).confirmPassword);
    assert.deepEqual(validateRegistration({ ...valid, password: ' password ', confirmPassword: ' password ' }), {});
});
