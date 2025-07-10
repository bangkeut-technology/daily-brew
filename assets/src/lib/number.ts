export const round = (value: number | string): number => {
    return +(Math.round(Number(value) * 1e2) + 'e-2');
};

export const roundToDecimalPlace = (value: number, decimalPlaces: number): number => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round((value + Number.EPSILON) * factor) / factor;
};
