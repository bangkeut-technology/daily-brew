import * as axios from 'axios';
import { joinPaths } from '@tanstack/react-router';

const host = '/api';
const apiVersion = '/v1';

const locale = sessionStorage.getItem('locale') || 'en';

export const apiAxios = axios.default.create({
    baseURL: joinPaths([host, apiVersion, locale]),
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});
