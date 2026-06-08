<?php

declare(strict_types=1);

namespace App\Service\Attendance;

use App\Entity\Workspace;
use App\Service\DateService;
use Dompdf\Dompdf;
use Dompdf\Options as DompdfOptions;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Twig\Environment;

/**
 * Renders the attendance row list (from AttendanceRowBuilder) as XLSX or PDF
 * for the Espresso+ download buttons on the attendance page. The row list is
 * the same shape the list endpoint returns; this service derives a few
 * presentation fields (status label, hours worked) before handing off to the
 * renderer.
 */
class AttendanceExportService
{
    private const STATUS_LABELS = [
        'present' => 'Present',
        'absent' => 'Absent',
        'on_leave' => 'On leave',
    ];

    public function __construct(private Environment $twig) {}

    /**
     * @param list<array<string, mixed>> $rows raw output from AttendanceRowBuilder::build()
     */
    public function toXlsx(array $rows, Workspace $workspace, string $from, string $to): string
    {
        $decorated = $this->decorate($rows);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Attendance');

        $headers = ['Employee', 'Date', 'Shift', 'Check-in', 'Check-out', 'Status', 'Late', 'Left early', 'Hours', 'Notes'];
        $sheet->fromArray($headers, null, 'A1');

        $headerStyle = $sheet->getStyle('A1:J1');
        $headerStyle->getFont()->setBold(true);
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFEFEAE3');
        $headerStyle->getBorders()->getBottom()->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setARGB('FF6B4226');

        $rowIdx = 2;
        foreach ($decorated as $row) {
            $sheet->setCellValue("A{$rowIdx}", $row['employeeName']);
            $sheet->setCellValue("B{$rowIdx}", $row['date']);
            $sheet->setCellValue("C{$rowIdx}", $row['shiftName'] ?? '');
            $sheet->setCellValue("D{$rowIdx}", $row['checkInAt'] ?? '');
            $sheet->setCellValue("E{$rowIdx}", $row['checkOutAt'] ?? '');
            $sheet->setCellValue("F{$rowIdx}", $row['statusLabel']);
            $sheet->setCellValue("G{$rowIdx}", $row['isLate'] ? 'Yes' : '');
            $sheet->setCellValue("H{$rowIdx}", $row['leftEarly'] ? 'Yes' : '');
            $sheet->setCellValue("I{$rowIdx}", $row['hoursWorked'] ?? '');
            $sheet->setCellValue("J{$rowIdx}", $row['editReason'] ?? '');
            $rowIdx++;
        }

        // Auto-size columns
        foreach (range('A', 'J') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
        // Right-align hours column
        $sheet->getStyle('I2:I' . ($rowIdx - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Header bar with workspace name + range above the table
        $sheet->insertNewRowBefore(1, 2);
        $sheet->setCellValue('A1', sprintf('%s — Attendance %s to %s', $workspace->getName(), $from, $to));
        $sheet->mergeCells('A1:J1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $sheet->setCellValue('A2', sprintf('Timezone: %s · Generated %s', $this->timezone($workspace), DateService::now()->format('Y-m-d H:i')));
        $sheet->mergeCells('A2:J2');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setARGB('FF6B6463');

        $writer = new Xlsx($spreadsheet);
        $stream = fopen('php://temp', 'r+');
        $writer->save($stream);
        rewind($stream);
        $contents = stream_get_contents($stream);
        fclose($stream);

        return $contents !== false ? $contents : '';
    }

    /**
     * @param list<array<string, mixed>> $rows raw output from AttendanceRowBuilder::build()
     */
    public function toPdf(array $rows, Workspace $workspace, string $from, string $to): string
    {
        $decorated = $this->decorate($rows);

        $html = $this->twig->render('exports/attendance.html.twig', [
            'workspaceName' => $workspace->getName(),
            'from' => $from,
            'to' => $to,
            'timezone' => $this->timezone($workspace),
            'rows' => $decorated,
            'generatedAt' => DateService::now()->format('Y-m-d H:i'),
        ]);

        $options = new DompdfOptions();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return $dompdf->output() ?: '';
    }

    /**
     * Adds presentation fields (status label, hours worked) and sorts rows
     * chronologically — exports read more naturally oldest-first.
     *
     * @param list<array<string, mixed>> $rows
     *
     * @return list<array<string, mixed>>
     */
    private function decorate(array $rows): array
    {
        $decorated = [];
        foreach ($rows as $row) {
            $row['statusLabel'] = self::STATUS_LABELS[$row['status']] ?? ucfirst((string) $row['status']);
            $row['hoursWorked'] = $this->hoursWorked($row['checkInAt'] ?? null, $row['checkOutAt'] ?? null);
            $decorated[] = $row;
        }

        usort($decorated, static function (array $a, array $b): int {
            $dateCmp = $a['date'] <=> $b['date'];
            return $dateCmp !== 0 ? $dateCmp : $a['employeeName'] <=> $b['employeeName'];
        });

        return $decorated;
    }

    private function hoursWorked(?string $checkIn, ?string $checkOut): ?string
    {
        if ($checkIn === null || $checkOut === null) {
            return null;
        }
        $in = DateService::createFromFormat('H:i', $checkIn);
        $out = DateService::createFromFormat('H:i', $checkOut);
        $minutes = (int) (($out->getTimestamp() - $in->getTimestamp()) / 60);
        if ($minutes < 0) {
            // Shift crossed midnight — add 24h.
            $minutes += 24 * 60;
        }
        return sprintf('%d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    private function timezone(Workspace $workspace): string
    {
        return $workspace->getSetting()?->getTimezone() ?? 'UTC';
    }
}
