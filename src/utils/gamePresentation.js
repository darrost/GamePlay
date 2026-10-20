import { platformGroups } from './gameValidation.js';

const platformLabels = Object.fromEntries(platformGroups.flatMap(
    (group) => group.options.map((option) => [option.value, option.label]),
));

export function getPlatformLabel(value) {
    return platformLabels[value] ?? value;
}

export function isValidGameId(value) {
    return typeof value === 'string'
        && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function formatReleaseDate(value) {
    if (!value) return 'Release date unknown';
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return 'Release date unknown';

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    }).format(date);
}
