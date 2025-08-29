import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/console/_authenticated/_layout/performance/attendances/')({
    component: AttendanceListPage,
    validateSearch: z.object({
        from: z.string().optional(), // 'yyyy-MM-dd'
        to: z.string().optional(), // 'yyyy-MM-dd'
        employeeId: z.string().optional().default(''),
        status: z
            .enum(['present', 'absent', 'leave', 'late', 'sick', 'holiday', 'remote'])
            .optional()
            .or(z.literal(''))
            .default(''),
        q: z.string().optional().default(''),
    }),
});

// —————————————————————————————————————————
// Page
function AttendanceListPage() {
    return <div>Attendance List Page</div>;
}
