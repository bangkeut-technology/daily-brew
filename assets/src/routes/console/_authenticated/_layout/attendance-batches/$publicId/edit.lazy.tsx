import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/console/_authenticated/_layout/attendance-batches/$publicId/edit')({
    component: EditAttendanceBatchPage,
});

function EditAttendanceBatchPage() {}
