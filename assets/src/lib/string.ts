import { User } from '@/types/user';
import i18next from '@/i18next';

export const currencyFormat = (value: number | string, currency: 'USD' | 'KHR' = 'USD') => {
    const number = typeof value === 'string' ? Number(value) : value;
    if (!isNaN(number)) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(number);
    }
    return '';
};

export const getRoleName = (role: string) => {
    return i18next.t(role.toLocaleLowerCase() as any);
};

export const getInitials = (str: string | undefined) => {
    if (!str) return '';
    return str
        .split(/\s+/) // split by spaces
        .map((word) => word.charAt(0)) // take first letter of each
        .join('')
        .substring(0, 2) // take up to 2 chars
        .toUpperCase();
};

export const getLocaleLabel = (locale: string) => {
    switch (locale) {
        case 'en':
            return 'English';
        case 'fr':
            return 'Français';
        default:
            return 'ភាសាខ្មែរ';
    }
};

export const getUserFullName = (user: User) => `${user.firstName} ${user.lastName}`;

/**
 * Converts a hex color string to its HSL representation.
 *
 * @param hex - The hex color code to convert (e.g., `#RRGGBB`).
 * @param valuesOnly - If true, returns only the values of hue, saturation, and lightness as a string.
 * @returns {string | undefined} A string representing the HSL color (e.g., `hsl(0, 100%, 50%)`) or undefined if the hex is invalid.
 */
export const hexToHsl = (hex: string, valuesOnly = false): string | undefined => {
    const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const result = regex.exec(hex);
    if (!result) return undefined;

    const red = parseInt(result[1], 16) / 255;
    const green = parseInt(result[2], 16) / 255;
    const blue = parseInt(result[3], 16) / 255;

    const maximum = Math.max(red, green, blue);
    const minimum = Math.min(red, green, blue);
    const delta = maximum - minimum;

    let hue = 0;
    let saturation = 0;
    let lightness = (maximum + minimum) / 2;

    if (delta !== 0) {
        if (maximum === red) {
            hue = (green - blue) / delta + (green < blue ? 6 : 0);
        } else if (maximum === green) {
            hue = (blue - red) / delta + 2;
        } else {
            hue = (red - green) / delta + 4;
        }

        hue *= 60;
        saturation = delta / (1 - Math.abs(2 * lightness - 1));
    }

    // Convert to percentages
    hue = Math.round(hue);
    saturation = Math.round(saturation * 100);
    lightness = Math.round(lightness * 100);

    return valuesOnly ? `${hue}, ${saturation}%, ${lightness}%` : `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

type HslOptions = {
    hue?: number[];
    saturation?: number[];
    lightness?: number[];
};

/**
 * Converts a given string into an HSL color value.
 *
 * @param {string} string - The input string used to generate the HSL value. Must not be empty.
 * @param {HslOptions} [options] - Optional settings to customize the HSL value.
 * Contains ranges for hue, saturation, and lightness.
 * @param {number[]} [options.hue=[0, 360]] - Defines the range of possible hue values.
 * @param {number[]} [options.saturation=[75, 100]] - Defines the range of possible saturation values (percentage).
 * @param {number[]} [options.lightness=[40, 60]] - Defines the range of possible lightness values (percentage).
 * @throws {Error} Throws an error if the input string is empty.
 * @returns {string} A string representing the generated HSL value in the format `hsl(hue, saturation%, lightness%)`.
 */
export const toHSL = (string: string, options?: HslOptions): string => {
    const length = string.length;
    if (length === 0) throw new Error('String must not be empty');
    options = options || {};
    options.hue = options.hue || [0, 360];
    options.saturation = options.saturation || [75, 100];
    options.lightness = options.lightness || [40, 60];

    const range = function (hash: number, minimum: number, maximum: number) {
        const diff = maximum - minimum;
        const x = ((hash % diff) + diff) % diff;
        return x + minimum;
    };

    let hash = 0;
    for (let i = 0; i < length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    const hue = range(hash, options.hue[0], options.hue[1]);
    const saturation = range(hash, options.saturation[0], options.saturation[1]);
    const lightness = range(hash, options.lightness[0], options.lightness[1]);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

/**
 * Converts a given string into a hex color value.
 *
 * @param {string} string - The input string used to generate the hex value. Must not be empty.
 * @throws {Error} Throws an error if the input string is empty.
 * @returns {string} A string representing the generated hex value in the format `#RRGGBB`.
 */
export const toHex = (string: string): string => {
    const h = Array.from(string).reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return `#${((h & 0xffffff) | 0x1000000).toString(16).slice(1)}`;
};
