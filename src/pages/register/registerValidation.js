export function validateRegistration({ email, password, confirmPassword }) {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
        errors.email = 'Enter your email address.';
    } else if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        errors.email = 'Enter a valid email address.';
    }

    if (!password) {
        errors.password = 'Enter a password.';
    } else if (password.length < 8) {
        errors.password = 'Use at least 8 characters.';
    } else if (password.length > 128) {
        errors.password = 'Use no more than 128 characters.';
    }

    if (!confirmPassword) {
        errors.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords must match.';
    }

    return errors;
}
