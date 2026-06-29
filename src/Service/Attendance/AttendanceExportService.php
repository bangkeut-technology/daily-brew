<?php

declare(strict_types=1);

namespace App\Service\Attendance;

use App\Entity\Workspace;
use App\Service\DateService;
use Dompdf\Dompdf;
use Dompdf\Options as DompdfOptions;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Twig\Environment;

/**
 * Renders the attendance grid (from AttendanceSummaryBuilder) as a gantt-style
 * monthly matrix — employees down the rows, calendar days across the columns,
 * each cell a short status code (Pre / Lt / LfE / Abs / Lv / Off / C / Vd) plus
 * the check-in time on present days. Used by the Espresso+ XLSX/PDF download
 * buttons on the attendance page; the layout mirrors the on-screen Monthly view.
 */
class AttendanceExportService
{
    /**
     * Short code + cell tint per resolved status. `tint` is an ARGB fill (null
     * = no fill); `code` is the abbreviation shown in the cell.
     */
    private const STATUS_STYLE = [
        'present' => ['tint' => 'FFEAF3EC'],   // soft green
        'flag' => ['tint' => 'FFFBF1E0'],      // soft amber (late / left early)
        'absent' => ['tint' => 'FFF8E8E6'],    // soft red
        'untracked' => ['tint' => null],
        'leave' => ['tint' => 'FFE9F0F7'],     // soft blue
        'off' => ['tint' => 'FFF1EEEB'],       // light gray
        'closure' => ['tint' => 'FFF1EEEB'],
        'voided' => ['tint' => 'FFEDE9E6'],
        'upcoming' => ['tint' => null],
    ];

    public function __construct(private readonly Environment $twig) {}

    /**
     * @param list<array<string, mixed>> $grid AttendanceSummaryBuilder::build() output
     */
    public function toXlsx(array $grid, Workspace $workspace, string $from, string $to): string
    {
        ['columns' => $columns, 'rows' => $rows] = $this->buildMatrix($grid, $from, $to);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Attendance');

        $colCount = 1 + count($columns); // employee column + one per day
        $lastCol = Coordinate::stringFromColumnIndex($colCount);

        // Title bar (rows 1-2)
        $sheet->setCellValue('A1', sprintf('%s — Attendance %s to %s', $workspace->getName(), $from, $to));
        $sheet->mergeCells("A1:{$lastCol}1");
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(13);
        $sheet->setCellValue('A2', sprintf('Timezone: %s · Generated %s', $this->timezone($workspace), DateService::now()->format('Y-m-d H:i')));
        $sheet->mergeCells("A2:{$lastCol}2");
        $sheet->getStyle('A2')->getFont()->setItalic(true)->getColor()->setARGB('FF6B6463');

        // Header row (row 3): Employee + day labels
        $headerRow = 3;
        $sheet->setCellValue("A{$headerRow}", 'Employee');
        foreach ($columns as $i => $col) {
            $cell = Coordinate::stringFromColumnIndex($i + 2) . $headerRow;
            $sheet->setCellValue($cell, $col['weekday'] . "\n" . $col['day']);
        }
        $headerStyle = $sheet->getStyle("A{$headerRow}:{$lastCol}{$headerRow}");
        $headerStyle->getFont()->setBold(true)->setSize(9);
        $headerStyle->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFEFEAE3');
        $headerStyle->getBorders()->getBottom()->setBorderStyle(Border::BORDER_MEDIUM)->getColor()->setARGB('FF6B4226');
        $headerStyle->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setWrapText(true);

        // Data rows
        $rowIdx = $headerRow + 1;
        foreach ($rows as $row) {
            $sheet->setCellValue("A{$rowIdx}", $row['name']);
            foreach ($row['cells'] as $i => $cell) {
                $coord = Coordinate::stringFromColumnIndex($i + 2) . $rowIdx;
                if ($cell === null) {
                    continue;
                }
                $text = $cell['time'] !== null ? $cell['code'] . "\n" . $cell['time'] : $cell['code'];
                $sheet->setCellValue($coord, $text);
                $tint = self::STATUS_STYLE[$cell['status']]['tint'] ?? null;
                if ($tint !== null) {
                    $sheet->getStyle($coord)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($tint);
                }
            }
            $rowIdx++;
        }
        $lastRow = $rowIdx - 1;

        // Sizing & alignment
        $sheet->getColumnDimension('A')->setWidth(24);
        for ($i = 2; $i <= $colCount; $i++) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setWidth(7);
        }
        if ($lastRow >= $headerRow + 1) {
            $dataRange = 'B' . ($headerRow + 1) . ":{$lastCol}{$lastRow}";
            $sheet->getStyle($dataRange)->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                ->setVertical(Alignment::VERTICAL_CENTER)
                ->setWrapText(true);
            $sheet->getStyle($dataRange)->getFont()->setSize(9);
        }

        // Freeze the employee column + the title/header band so it stays put
        // while scrolling a wide month.
        $sheet->freezePane('B' . ($headerRow + 1));

        $writer = new Xlsx($spreadsheet);
        $stream = fopen('php://temp', 'r+');
        $writer->save($stream);
        rewind($stream);
        $contents = stream_get_contents($stream);
        fclose($stream);

        return $contents !== false ? $contents : '';
    }

    /**
     * @param list<array<string, mixed>> $grid AttendanceSummaryBuilder::build() output
     */
    public function toPdf(array $grid, Workspace $workspace, string $from, string $to): string
    {
        ['columns' => $columns, 'rows' => $rows] = $this->buildMatrix($grid, $from, $to);

        $html = $this->twig->render('exports/attendance.html.twig', [
            'workspaceName' => $workspace->getName(),
            'from' => $from,
            'to' => $to,
            'timezone' => $this->timezone($workspace),
            'columns' => $columns,
            'rows' => $rows,
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
     * Pivots the per-employee grid into a calendar matrix: one column per day in
     * [from, to], one row per employee, each cell resolved to a code/time/status
     * (or null when the employee wasn't employed that day).
     *
     * @param list<array<string, mixed>> $grid
     *
     * @return array{columns: list<array{date: string, day: string, weekday: string}>, rows: list<array{name: string, cells: list<array{code: string, time: string|null, status: string}|null>}>}
     */
    private function buildMatrix(array $grid, string $from, string $to): array
    {
        $columns = [];
        $cursor = \DateTime::createFromInterface(DateService::parse($from));
        $end = \DateTime::createFromInterface(DateService::parse($to));
        while ($cursor <= $end) {
            $columns[] = [
                'date' => $cursor->format('Y-m-d'),
                'day' => $cursor->format('j'),
                'weekday' => $cursor->format('D'),
            ];
            $cursor->modify('+1 day');
        }

        $rows = [];
        foreach ($grid as $emp) {
            $shiftName = $emp['shiftName'] ?? null;
            $byDate = [];
            foreach ($emp['days'] as $day) {
                $byDate[$day['date']] = $day;
            }

            $cells = [];
            foreach ($columns as $col) {
                $day = $byDate[$col['date']] ?? null;
                $cells[] = $day === null ? null : $this->cell($day, $shiftName);
            }

            $rows[] = ['name' => $emp['employeeName'], 'cells' => $cells];
        }

        return ['columns' => $columns, 'rows' => $rows];
    }

    /**
     * Resolves one grid day into a display cell: short code, optional check-in
     * time, and a style key (drives the cell tint). Mirrors the on-screen gantt
     * glyphs — an absent day with no shift reads as "not tracked" rather than a
     * red "Abs".
     *
     * @param array<string, mixed> $day
     *
     * @return array{code: string, time: string|null, status: string}
     */
    private function cell(array $day, ?string $shiftName): array
    {
        $status = $day['status'] ?? 'absent';

        return match ($status) {
            'present' => [
                'code' => !empty($day['isLate']) ? 'Lt' : (!empty($day['leftEarly']) ? 'LfE' : 'Pre'),
                'time' => $day['checkInAt'] ?? null,
                'status' => (!empty($day['isLate']) || !empty($day['leftEarly'])) ? 'flag' : 'present',
            ],
            'absent' => $shiftName !== null
                ? ['code' => 'Abs', 'time' => null, 'status' => 'absent']
                : ['code' => '—', 'time' => null, 'status' => 'untracked'],
            'leave' => ['code' => 'Lv', 'time' => null, 'status' => 'leave'],
            'off' => ['code' => 'Off', 'time' => null, 'status' => 'off'],
            'closure' => ['code' => 'C', 'time' => null, 'status' => 'closure'],
            'voided' => ['code' => 'Vd', 'time' => $day['checkInAt'] ?? null, 'status' => 'voided'],
            default => ['code' => '', 'time' => null, 'status' => 'upcoming'],
        };
    }

    private function timezone(Workspace $workspace): string
    {
        return $workspace->getSetting()?->getTimezone() ?? 'UTC';
    }
}
