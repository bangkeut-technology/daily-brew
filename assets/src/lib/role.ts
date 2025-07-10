import i18next from '@/i18next';

export const getRoleLabel = (roles: string[]) => {
    if (roles.includes('ROLE_COMPANY_OWNER')) {
        return i18next.t('role_company_owner');
    }

    if (roles.includes('ROLE_COMPANY_MANAGER')) {
        return i18next.t('role_company_owner');
    }

    if (roles.includes('ROLE_PRODUCT_MANAGER')) {
        return i18next.t('role_company_owner');
    }

    if (roles.includes('ROLE_COUPON_MANAGER')) {
        return i18next.t('role_coupon_manager');
    }

    if (roles.includes('ROLE_EMPLOYEE_MANAGER')) {
        return i18next.t('role_employee_manager');
    }

    if (roles.includes('ROLE_DELIVERY_MANAGER')) {
        return i18next.t('role_delivery_manager');
    }

    if (roles.includes('REPORT_VIEWER')) {
        return i18next.t('role_report_viewer');
    }

    return i18next.t('role_employee');
};

export const getRole = (roles: string[]) => {
    if (roles.includes('COMPANY_OWNER')) {
        return 'COMPANY_OWNER';
    }

    if (roles.includes('COMPANY_MANAGER')) {
        return 'COMPANY_MANAGER';
    }

    if (roles.includes('PRODUCT_MANAGER')) {
        return 'PRODUCT_MANAGER';
    }

    if (roles.includes('COUPON_MANAGER')) {
        return 'COUPON_MANAGER';
    }

    if (roles.includes('EMPLOYEE_MANAGER')) {
        return 'EMPLOYEE_MANAGER';
    }

    if (roles.includes('DELIVERY_MANAGER')) {
        return 'DELIVERY_MANAGER';
    }

    if (roles.includes('REPORT_VIEWER')) {
        return 'REPORT_VIEWER';
    }

    return 'ROLE_EMPLOYEE';
};
export const getEmployeeRoleLabel = (roles: string[]) => {
    if (roles.includes('ROLE_STORE_MANAGER')) {
        return i18next.t('role_store_manager');
    }

    if (roles.includes('ROLE_DELIVERER')) {
        return i18next.t('role_deliverer');
    }

    if (roles.includes('ROLE_CASHIER')) {
        return i18next.t('role_cashier');
    }

    if (roles.includes('ROLE_WAITER')) {
        return i18next.t('role_waiter');
    }
    return 'ROLE_EMPLOYEE';
};

export const getEmployeeRole = (roles: string[]) => {
    if (roles.includes('ROLE_STORE_MANAGER')) {
        return 'ROLE_STORE_MANAGER';
    }

    if (roles.includes('ROLE_DELIVERER')) {
        return 'ROLE_DELIVERER';
    }

    if (roles.includes('ROLE_CASHIER')) {
        return 'ROLE_CASHIER';
    }

    if (roles.includes('ROLE_WAITER')) {
        return 'ROLE_WAITER';
    }
    return 'ROLE_EMPLOYEE';
};
