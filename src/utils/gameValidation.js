export const platformGroups = [
    {
        label: 'Computer',
        options: [
            { value: 'PC', label: 'Windows (PC)' },
            { value: 'macOS', label: 'macOS' },
            { value: 'Linux', label: 'Linux' },
        ],
    },
    {
        label: 'Console',
        options: [
            { value: 'PlayStation', label: 'PlayStation' },
            { value: 'Xbox', label: 'Xbox' },
            { value: 'Nintendo Switch', label: 'Nintendo Switch' },
        ],
    },
    {
        label: 'Mobile',
        options: [
            { value: 'iOS', label: 'iOS' },
            { value: 'Android', label: 'Android' },
        ],
    },
    { label: 'Other', options: [{ value: 'Other', label: 'Other platform' }] },
];

export const supportedPlatforms = platformGroups.flatMap((group) => group.options.map((option) => option.value));

const textLength = (value) => [...value.trim()].length;

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1];
}

export function validateGame(values) {
    const errors = {};

    if (textLength(values.title) < 2 || textLength(values.title) > 120) {
        errors.title = 'Enter a title between 2 and 120 characters.';
    }
    if (textLength(values.description) < 20 || textLength(values.description) > 5000) {
        errors.description = 'Enter a description between 20 and 5,000 characters.';
    }

    const imageUrl = values.image_url.trim();
    try {
        const url = new URL(imageUrl);
        if (!/^https?:\/\//.test(imageUrl) || !['http:', 'https:'].includes(url.protocol) || !url.hostname
            || /\s/.test(imageUrl) || [...imageUrl].length > 2048) {
            throw new Error('Invalid cover URL');
        }
    } catch {
        errors.image_url = 'Enter a complete HTTP or HTTPS image URL, up to 2,048 characters, without spaces.';
    }

    if (textLength(values.genre) < 2 || textLength(values.genre) > 60) {
        errors.genre = 'Enter a genre between 2 and 60 characters.';
    }
    if (!Array.isArray(values.platforms) || values.platforms.length === 0
        || values.platforms.length > supportedPlatforms.length
        || new Set(values.platforms).size !== values.platforms.length
        || values.platforms.some((platform) => !supportedPlatforms.includes(platform))) {
        errors.platforms = 'Select at least one supported platform.';
    }
    if (values.release_date && !isValidDate(values.release_date)) {
        errors.release_date = 'Enter a valid date or leave it empty.';
    }

    return errors;
}

export function toGamePayload(values) {
    return {
        title: values.title.trim(),
        description: values.description.trim(),
        image_url: values.image_url.trim(),
        genre: values.genre.trim(),
        platforms: [...new Set(values.platforms)],
        release_date: values.release_date || null,
    };
}
