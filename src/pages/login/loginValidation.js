export function validateLogin({ email, password }) {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        errors.email = 'Enter your email address.';
    } else if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = 'Enter a valid email address.';
    }

    if (!password) {
        errors.password = 'Enter your password.';
    }

    return errors;
}
