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

    public function testToXlsxRendersGanttMatrix(): void
    {
        $grid = [
            $this->employee('Alice Anderson', 'Morning', [
                $this->day('2026-05-10', 'present', ['checkInAt' => '09:00', 'isLate' => false, 'leftEarly' => false]),
                $this->day('2026-05-11', 'present', ['checkInAt' => '09:15', 'isLate' => true, 'leftEarly' => false]),
            ]),
            $this->employee('Bob Brown', 'Evening', [
                $this->day('2026-05-10', 'absent'),
                $this->day('2026-05-11', 'leave', ['leaveType' => 'paid']),
            ]),
            // No shift → absent reads as "not tracked" (—); only employed day 10.
            $this->employee('Cleo Helper', null, [
                $this->day('2026-05-10', 'absent'),
            ]),
        ];

        $bytes = $this->service->toXlsx($grid, $this->workspace(), '2026-05-10', '2026-05-11');

        // XLSX is a ZIP archive starting with the local-file header signature "PK\x03\x04".
        $this->assertNotEmpty($bytes);
        $this->assertSame("PK\x03\x04", substr($bytes, 0, 4));

        $tmp = tempnam(sys_get_temp_dir(), 'att') . '.xlsx';
        file_put_contents($tmp, $bytes);
        $sheet = IOFactory::load($tmp)->getActiveSheet();
        unlink($tmp);

        // Row 3 = header: A = "Employee", B/C = day columns for the two dates.
        $this->assertSame('Employee', $sheet->getCell('A3')->getValue());
        $this->assertStringContainsString('10', (string) $sheet->getCell('B3')->getValue());
        $this->assertStringContainsString('11', (string) $sheet->getCell('C3')->getValue());

        // Alice: on-time present then late, with check-in times stacked under the code.
        $this->assertSame('Alice Anderson', $sheet->getCell('A4')->getValue());
        $this->assertSame("Pre\n09:00", $sheet->getCell('B4')->getValue());
        $this->assertSame("Lt\n09:15", $sheet->getCell('C4')->getValue());

        // Bob: absent (has a shift) then on paid leave.
        $this->assertSame("Abs", $sheet->getCell('B5')->getValue());
        $this->assertSame("Lv", $sheet->getCell('C5')->getValue());

        // Cleo: absent with no shift → "—"; not employed on the 11th → blank cell.
        $this->assertSame("\u{2014}", $sheet->getCell('B6')->getValue());
        $this->assertNull($sheet->getCell('C6')->getValue());
    }

    public function testToPdfReturnsValidPdfBlob(): void
    {
        $grid = [
            $this->employee('Alice', 'Morning', [
                $this->day('2026-05-10', 'present', ['checkInAt' => '09:00']),
            ]),
        ];

        $bytes = $this->service->toPdf($grid, $this->workspace(), '2026-05-10', '2026-05-10');

        $this->assertNotEmpty($bytes);
        $this->assertStringStartsWith('%PDF-', $bytes);
    }

    public function testEmptyGridStillProducesValidXlsx(): void
    {
        $bytes = $this->service->toXlsx([], $this->workspace(), '2026-05-10', '2026-05-10');

        $this->assertNotEmpty($bytes);
        $this->assertSame("PK\x03\x04", substr($bytes, 0, 4));
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
     * @param list<array<string, mixed>> $days
     *
     * @return array<string, mixed>
     */
    private function employee(string $name, ?string $shiftName, array $days): array
    {
        return [
            'employeePublicId' => 'emp-' . $name,
            'employeeName' => $name,
            'shiftName' => $shiftName,
            'days' => $days,
        ];
    }

    /**
     * @param array<string, mixed> $extra
     *
     * @return array<string, mixed>
     */
    private function day(string $date, string $status, array $extra = []): array
    {
        return array_merge(['date' => $date, 'status' => $status], $extra);
    }
}
