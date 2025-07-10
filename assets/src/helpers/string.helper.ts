import { User } from '@/types/User';

export class StringHelper {
    static camelCaseToSneakCase = (str: string) => {
        return str.replace(/[A-Z]/g, (letter, index) => {
            return index == 0 ? letter.toLowerCase() : '_' + letter.toLowerCase();
        });
    };

    static replace = (str: string) => {
        return str.replace(/([~!@#$%^&*()_+=`{}[\]|\\:;'<>,./? ])+/g, '-').replace(/^(-)+|(-)+$/g, '');
    };

    static getFullName = (user: User | undefined | null) => {
        if (user) {
            return `${user.firstName} ${user.lastName}`;
        }
        return '';
    };
}
