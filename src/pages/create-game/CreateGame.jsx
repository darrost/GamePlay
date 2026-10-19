import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { createGame } from '../../services/gameService';
import { platformGroups, validateGame } from '../../utils/gameValidation';
import './CreateGame.css';

const emptyGame = {
    title: '', description: '', image_url: '', genre: '', platforms: [], release_date: '',
};

const textFields = [
    { name: 'title', label: 'Title', type: 'text', hint: '2–120 characters.' },
    { name: 'description', label: 'Description', type: 'textarea', hint: '20–5,000 characters.' },
    { name: 'image_url', label: 'Cover image URL', type: 'url', hint: 'A complete HTTP or HTTPS image address.' },
    { name: 'genre', label: 'Genre', type: 'text', hint: 'For example: RPG, Adventure, or Strategy. 2–60 characters.' },
];

export default function CreateGame() {
    const [values, setValues] = useState(emptyGame);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdGame, setCreatedGame] = useState(null);
    const requestInProgress = useRef(false);

    function handleChange(event) {
        const { name, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: value }));
        setErrors({});
        setSubmitError('');
    }

    function handlePlatformChange(event) {
        const { value, checked } = event.target;
        setValues((previous) => ({
            ...previous,
            platforms: checked
                ? [...previous.platforms, value]
                : previous.platforms.filter((platform) => platform !== value),
        }));
        setErrors({});
        setSubmitError('');
    }

    async function handleSubmit(event) {
        event.preventDefault();
        if (requestInProgress.current) return;

        const validationErrors = validateGame(values);
        setErrors(validationErrors);
        setSubmitError('');
        const firstInvalidField = Object.keys(validationErrors)[0];

        if (firstInvalidField) {
            event.currentTarget.querySelector(`[name="${firstInvalidField}"]`)?.focus();
            return;
        }

        requestInProgress.current = true;
        setIsSubmitting(true);

        try {
            const game = await createGame(values);
            setCreatedGame(game);
            setValues(emptyGame);
        } catch (error) {
            if (error?.code === '42501' || error?.status === 401) {
                setSubmitError('You do not have permission to add a game. Make sure you are logged in, then try again.');
            } else if (error?.code === '23514') {
                setSubmitError('The game does not meet the database rules. Check the fields and try again.');
            } else {
                setSubmitError(error?.message || 'The game could not be saved. Check your connection and try again.');
            }
        } finally {
            requestInProgress.current = false;
            setIsSubmitting(false);
        }
    }

    function handleAddAnother() {
        setCreatedGame(null);
        setErrors({});
        setSubmitError('');
    }

    return (
        <section className="create-game-page" aria-labelledby="create-game-heading">
            <h1 id="create-game-heading">Add a game</h1>
            <p>Add a game to the shared catalog. You will be able to manage the entries you create.</p>

            {createdGame ? (
                <div className="create-game-success" role="status">
                    <h2>Game added</h2>
                    <p>{createdGame.title} was saved successfully.</p>
                    <div className="create-game-actions">
                        <Link to={`/games/${createdGame.id}`}>Open game page</Link>
                        <button type="button" onClick={handleAddAnother}>Add another game</button>
                    </div>
                </div>
            ) : (
                <form className="create-game-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
                    <fieldset className="create-game-fields" disabled={isSubmitting}>
                        {textFields.map((field) => {
                            const props = {
                                id: `game-${field.name}`,
                                name: field.name,
                                value: values[field.name],
                                onChange: handleChange,
                                required: true,
                                'aria-invalid': Boolean(errors[field.name]),
                                'aria-describedby': `game-${field.name}-hint${errors[field.name] ? ` game-${field.name}-error` : ''}`,
                            };

                            return (
                                <div className="create-game-field" key={field.name}>
                                    <label htmlFor={props.id}>{field.label}</label>
                                    {field.type === 'textarea'
                                        ? <textarea {...props} rows={6} />
                                        : <input {...props} type={field.type} />}
                                    <p className="create-game-hint" id={`game-${field.name}-hint`}>{field.hint}</p>
                                    {errors[field.name] && <p className="create-game-error" id={`game-${field.name}-error`}>{errors[field.name]}</p>}
                                </div>
                            );
                        })}

                        <fieldset className="create-game-platforms"
                            aria-describedby={errors.platforms ? 'game-platforms-error' : undefined}>
                            <legend>Platforms</legend>
                            <div className="create-game-platform-options">
                                {platformGroups.map((group) => (
                                    <fieldset className="create-game-platform-group" key={group.label}>
                                        <legend>{group.label}</legend>
                                        {group.options.map((platform) => (
                                            <label key={platform.value}>
                                                <input type="checkbox" name="platforms" value={platform.value}
                                                    checked={values.platforms.includes(platform.value)} onChange={handlePlatformChange}
                                                    aria-invalid={Boolean(errors.platforms)} />
                                                {platform.label}
                                            </label>
                                        ))}
                                    </fieldset>
                                ))}
                            </div>
                            {errors.platforms && <p className="create-game-error" id="game-platforms-error">{errors.platforms}</p>}
                        </fieldset>

                        <div className="create-game-field">
                            <label htmlFor="game-release_date">Release date (optional)</label>
                            <input id="game-release_date" name="release_date" type="date" min="0001-01-01" max="9999-12-31"
                                value={values.release_date} onChange={handleChange}
                                aria-invalid={Boolean(errors.release_date)}
                                aria-describedby={errors.release_date ? 'game-date-error' : undefined} />
                            {errors.release_date && <p className="create-game-error" id="game-date-error">{errors.release_date}</p>}
                        </div>

                        {Object.keys(errors).length > 0 && <p className="create-game-error" role="alert">Please correct the highlighted fields.</p>}
                        {submitError && <p className="create-game-error" role="alert">{submitError}</p>}
                        <button type="submit">{isSubmitting ? 'Saving game…' : 'Add game'}</button>
                        {isSubmitting && <p role="status">Saving your game. Please wait.</p>}
                        <Link to="/games">Cancel and return to Games</Link>
                    </fieldset>
                </form>
            )}
        </section>
    );
}
