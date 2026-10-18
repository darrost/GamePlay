import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { validateLogin } from './loginValidation';
import './Login.css';

export default function Login() {
    const [values, setValues] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
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

        const validationErrors = validateLogin(values);
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
            const { data, error } = await supabase.auth.signInWithPassword({
                email: values.email.trim(),
                password: values.password,
            });

            if (error) throw error;
            if (!data.session) throw new Error('Login could not be completed. Please try again.');

            setValues({ email: '', password: '' });
            navigate('/games', { replace: true });
        } catch (error) {
            if (error?.code === 'invalid_credentials') {
                setSubmitError('The email or password is incorrect.');
            } else if (error?.code === 'email_not_confirmed') {
                setSubmitError('Confirm your email using the link in your inbox before logging in.');
            } else {
                setSubmitError(error instanceof Error ? error.message : 'We could not connect. Please try again.');
            }
        } finally {
            requestInProgress.current = false;
            setIsSubmitting(false);
        }
    }

    return (
        <section className="login-page" aria-labelledby="login-heading">
            <h1 id="login-heading">Log in</h1>
            <p>Welcome back. Log in to review games and manage your library.</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                <fieldset disabled={isSubmitting}>
                    <div className="login-field">
                        <label htmlFor="login-email">Email</label>
                        <input id="login-email" name="email" type="email" autoComplete="email"
                            value={values.email} onChange={handleChange} required maxLength={254}
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'login-email-error' : undefined} />
                        {errors.email && <p className="login-error" id="login-email-error">{errors.email}</p>}
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">Password</label>
                        <input id="login-password" name="password" type="password" autoComplete="current-password"
                            value={values.password} onChange={handleChange} required
                            aria-invalid={Boolean(errors.password)}
                            aria-describedby={errors.password ? 'login-password-error' : undefined} />
                        {errors.password && <p className="login-error" id="login-password-error">{errors.password}</p>}
                    </div>

                    {Object.keys(errors).length > 0 && <p className="login-error" role="alert">Please correct the highlighted fields.</p>}
                    {submitError && <p className="login-error" role="alert">{submitError}</p>}
                    <button type="submit">{isSubmitting ? 'Logging in…' : 'Log in'}</button>
                    {isSubmitting && <p role="status">Please wait while we log you in.</p>}
                </fieldset>
            </form>

            <p className="login-register">New to GamePlay? <Link to="/register">Create an account</Link></p>
        </section>
    );
}
