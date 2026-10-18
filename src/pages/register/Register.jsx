import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { validateRegistration } from './registerValidation';
import './Register.css';

export default function Register() {
    const [values, setValues] = useState({ email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmationPending, setConfirmationPending] = useState(false);
    const requestInProgress = useRef(false);
    const navigate = useNavigate();

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
        setErrors({});
        setSubmitError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (requestInProgress.current) return;

        const validationErrors = validateRegistration(values);
        setErrors(validationErrors);
        setSubmitError('');

        const firstInvalidField = Object.keys(validationErrors)[0];
        if (firstInvalidField) {
            event.currentTarget.elements.namedItem(firstInvalidField).focus();
            return;
        }

        requestInProgress.current = true;
        setIsSubmitting(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email.trim(),
                password: values.password,
            });

            if (error) throw error;
            if (!data.user) throw new Error('Registration could not be completed. Please try again.');

            setValues({ email: '', password: '', confirmPassword: '' });

            if (data.session) {
                navigate('/games', { replace: true });
            } else {
                setConfirmationPending(true);
            }
        } catch (error) {
            setSubmitError(error instanceof Error
                ? error.message
                : 'We could not connect. Please try again.');
        } finally {
            requestInProgress.current = false;
            setIsSubmitting(false);
        }
    }

    return (
        <section className="register-page" aria-labelledby="register-heading">
            <h1 id="register-heading">Create an account</h1>
            <p>Join GamePlay to rate games, share reviews, and build your library.</p>

            {confirmationPending ? (
                <div className="register-success" role="status">
                    <h2>Check your email</h2>
                    <p>Check your inbox for a confirmation link before logging in. If you already have an account, try logging in instead.</p>
                    <Link to="/login">Go to login</Link>
                </div>
            ) : (
                <form className="register-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                    <fieldset disabled={isSubmitting}>
                        <div className="register-field">
                            <label htmlFor="register-email">Email</label>
                            <input id="register-email" name="email" type="email" autoComplete="email"
                                value={values.email} onChange={handleChange} required maxLength={254}
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'register-email-error' : undefined} />
                            {errors.email && <p className="register-error" id="register-email-error">{errors.email}</p>}
                        </div>

                        <div className="register-field">
                            <label htmlFor="register-password">Password</label>
                            <input id="register-password" name="password" type="password" autoComplete="new-password"
                                value={values.password} onChange={handleChange} required minLength={8} maxLength={128}
                                aria-invalid={Boolean(errors.password)}
                                aria-describedby={`register-password-hint${errors.password ? ' register-password-error' : ''}`} />
                            <p className="register-hint" id="register-password-hint">Use 8–128 characters. Choose a unique password.</p>
                            {errors.password && <p className="register-error" id="register-password-error">{errors.password}</p>}
                        </div>

                        <div className="register-field">
                            <label htmlFor="register-confirm-password">Confirm password</label>
                            <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password"
                                value={values.confirmPassword} onChange={handleChange} required maxLength={128}
                                aria-invalid={Boolean(errors.confirmPassword)}
                                aria-describedby={errors.confirmPassword ? 'register-confirm-error' : undefined} />
                            {errors.confirmPassword && <p className="register-error" id="register-confirm-error">{errors.confirmPassword}</p>}
                        </div>

                        {Object.keys(errors).length > 0 && <p className="register-error" role="alert">Please correct the highlighted fields.</p>}
                        {submitError && <p className="register-error" role="alert">{submitError}</p>}

                        <button type="submit">{isSubmitting ? 'Creating account…' : 'Create account'}</button>
                        {isSubmitting && <p role="status">Please wait while we create your account.</p>}
                    </fieldset>
                </form>
            )}

            {!confirmationPending && <p className="register-login">Already have an account? <Link to="/login">Log in</Link></p>}
        </section>
    );
}
