<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Attendance;

use App\Entity\Workspace;
use App\Entity\WorkspaceSetting;
use App\Service\Attendance\AttendanceExportService;
use App\Service\DateService;
use DateTimeZone;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

class AttendanceExportServiceTest extends TestCase
{
    private AttendanceExportService $service;

    protected function setUp(): void
    {
        DateService::setClock(new MockClock('2026-06-08 10:00:00', new DateTimeZone('UTC')));

        $loader = new FilesystemLoader();
        $loader->addPath(realpath(__DIR__ . '/../../../../templates') ?: __DIR__ . '/../../../../templates');
        $twig = new Environment($loader, ['cache' => false]);

        $this->service = new AttendanceExportService($twig);
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testToXlsxReturnsValidSpreadsheetWithDecoratedRows(): void
    {
        $rows = [
            $this->row('Alice Anderson', '2026-05-10', 'Morning', '09:00', '17:30', 'present', false, false),
            $this->row('Bob Brown', '2026-05-10', 'Evening', null, null, 'absent', false, false),
            $this->row('Charlie Cole', '2026-05-11', 'Morning', '08:55', '16:30', 'present', false, true),
        ];

        $bytes = $this->service->toXlsx($rows, $this->workspace(), '2026-05-10', '2026-05-11');

        // XLSX is a ZIP archive starting with the local-file header signature "PK\x03\x04".
        $this->assertNotEmpty($bytes);
        $this->assertSame("PK\x03\x04", substr($bytes, 0, 4));

        // Round-trip: write to a temp file, load with PhpSpreadsheet, inspect data.
        $tmp = tempnam(sys_get_temp_dir(), 'att') . '.xlsx';
        file_put_contents($tmp, $bytes);
        $spreadsheet = IOFactory::load($tmp);
        unlink($tmp);

        $sheet = $spreadsheet->getActiveSheet();
        // Header rows: row 1 = workspace banner, row 2 = generated meta, row 3 = column headers
        $this->assertSame('Date', $sheet->getCell('B3')->getValue());
        $this->assertSame('Alice Anderson', $sheet->getCell('A4')->getValue());
        $this->assertSame('2026-05-10', $sheet->getCell('B4')->getValue());
        $this->assertSame('Present', $sheet->getCell('F4')->getValue());
        $this->assertSame('8:30', $sheet->getCell('I4')->getValue());
    }

    public function testToPdfReturnsValidPdfBlob(): void
    {
        $rows = [
            $this->row('Alice', '2026-05-10', 'Morning', '09:00', '17:30', 'present', false, false),
        ];

        $bytes = $this->service->toPdf($rows, $this->workspace(), '2026-05-10', '2026-05-10');

        $this->assertNotEmpty($bytes);
        $this->assertStringStartsWith('%PDF-', $bytes);
    }

    public function testEmptyRowsStillProducesValidXlsx(): void
    {
        $bytes = $this->service->toXlsx([], $this->workspace(), '2026-05-10', '2026-05-10');

        $this->assertNotEmpty($bytes);
        $this->assertSame("PK\x03\x04", substr($bytes, 0, 4));
    }

    public function testHoursWorkedHandlesCrossMidnightShift(): void
    {
        // Bartender works 21:00 → 04:00 — 7 hours.
        $rows = [
            $this->row('Night', '2026-05-10', null, '21:00', '04:00', 'present', false, false),
        ];
        $bytes = $this->service->toXlsx($rows, $this->workspace(), '2026-05-10', '2026-05-10');
        $tmp = tempnam(sys_get_temp_dir(), 'att') . '.xlsx';
        file_put_contents($tmp, $bytes);
        $sheet = IOFactory::load($tmp)->getActiveSheet();
        unlink($tmp);

        $this->assertSame('7:00', $sheet->getCell('I4')->getValue());
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private function workspace(): Workspace
    {
        $ws = new Workspace();
        $ws->setName('Café Roastery');
        $setting = new WorkspaceSetting();
        $setting->setTimezone('Asia/Phnom_Penh');
        $ws->setSetting($setting);
        return $ws;
    }

    /**
     * @return array<string, mixed>
     */
    private function row(
        string $employeeName,
        string $date,
        ?string $shiftName,
        ?string $checkInAt,
        ?string $checkOutAt,
        string $status,
        bool $isLate,
        bool $leftEarly,
    ): array {
        return [
            'publicId' => 'pub-' . $employeeName,
            'employeePublicId' => 'emp-' . $employeeName,
            'employeeName' => $employeeName,
            'shiftName' => $shiftName,
            'date' => $date,
            'checkInAt' => $checkInAt,
            'checkOutAt' => $checkOutAt,
            'isLate' => $isLate,
            'leftEarly' => $leftEarly,
            'status' => $status,
        ];
    }
}
