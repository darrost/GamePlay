import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLogin } from '../src/pages/login/loginValidation.js';

test('login requires both email and password', () => {
    assert.deepEqual(Object.keys(validateLogin({ email: '', password: '' })), ['email', 'password']);
});

test('login accepts trimmed email and an existing password', () => {
    assert.deepEqual(validateLogin({ email: ' player@example.com ', password: 'existing-password' }), {});
});

test('login rejects malformed or excessively long email addresses', () => {
    for (const email of ['player', 'a@b@c.com', 'a b@example.com', `${'a'.repeat(250)}@example.com`]) {
        assert.ok(validateLogin({ email, password: 'password' }).email);
    }
});

test('login does not apply new registration password rules to existing accounts', () => {
    assert.deepEqual(validateLogin({ email: 'player@example.com', password: 'short' }), {});
    assert.deepEqual(validateLogin({ email: 'player@example.com', password: ' password ' }), {});
});
