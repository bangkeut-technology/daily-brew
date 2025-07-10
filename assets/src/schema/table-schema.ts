import { number, object, ObjectSchema, string } from 'yup';
import { NewTable } from '@/types/Table';

export const tableSchema: ObjectSchema<NewTable> = object({
    name: string().required('Name is required'),
    seats: string().test('is-number', 'Seat must be a number', (value) => {
        return !value || !isNaN(Number(value));
    }),
    zone: number(),
});
