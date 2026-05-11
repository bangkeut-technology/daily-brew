<?php

declare(strict_types=1);

namespace App\Tests\Unit\Entity;

use App\Entity\Employee;
use App\Entity\WorkspaceQrCode;
use Doctrine\Common\Collections\Collection;
use PHPUnit\Framework\TestCase;

class WorkspaceQrCodeTest extends TestCase
{
    public function testConstructorGeneratesUniqueQrTokenAndEmptyAssignments(): void
    {
        $qr = new WorkspaceQrCode();

        $this->assertNotEmpty($qr->getQrToken());
        $this->assertInstanceOf(Collection::class, $qr->getAssignedEmployees());
        $this->assertCount(0, $qr->getAssignedEmployees());
    }

    public function testInheritFlagsDefaultToTrueAndOverrideValuesToOff(): void
    {
        // Sub-QRs default to "Same as workspace" — the inherit flags are all true and the
        // override values are all off so they're clearly not in use.
        $qr = new WorkspaceQrCode();

        $this->assertTrue($qr->isInheritIpSettings());
        $this->assertTrue($qr->isInheritGeofencing());
        $this->assertTrue($qr->isInheritDeviceVerification());

        $this->assertFalse($qr->isIpRestrictionEnabled());
        $this->assertFalse($qr->isGeofencingEnabled());
        $this->assertFalse($qr->isDeviceVerificationEnabled());

        // Default geofence radius is 100m to be safely above the 50m floor enforced
        // by WorkspaceQrCodeService.
        $this->assertSame(100, $qr->getGeofencingRadiusMeters());
    }

    public function testAddAssignedEmployeeIsIdempotent(): void
    {
        $qr = new WorkspaceQrCode();
        $emp = new Employee();

        $qr->addAssignedEmployee($emp);
        $qr->addAssignedEmployee($emp); // dup
        $qr->addAssignedEmployee($emp);

        $this->assertCount(1, $qr->getAssignedEmployees());
        $this->assertTrue($qr->hasAssignedEmployee($emp));
    }

    public function testRemoveAssignedEmployeeCompactsCollection(): void
    {
        $qr = new WorkspaceQrCode();
        $a = new Employee();
        $b = new Employee();
        $qr->addAssignedEmployee($a);
        $qr->addAssignedEmployee($b);

        $qr->removeAssignedEmployee($a);

        $this->assertCount(1, $qr->getAssignedEmployees());
        $this->assertFalse($qr->hasAssignedEmployee($a));
        $this->assertTrue($qr->hasAssignedEmployee($b));
    }

    public function testRemoveUnassignedEmployeeIsANoOp(): void
    {
        $qr = new WorkspaceQrCode();
        $a = new Employee();
        $b = new Employee();
        $qr->addAssignedEmployee($a);

        $qr->removeAssignedEmployee($b);

        $this->assertCount(1, $qr->getAssignedEmployees());
        $this->assertTrue($qr->hasAssignedEmployee($a));
    }

    public function testManagerNullableRoundTrip(): void
    {
        $qr = new WorkspaceQrCode();
        $manager = new Employee();

        $this->assertNull($qr->getManager());

        $qr->setManager($manager);
        $this->assertSame($manager, $qr->getManager());

        $qr->setManager(null);
        $this->assertNull($qr->getManager());
    }

    public function testOverrideValuesPersistEvenWhileInheritFlagOn(): void
    {
        // The service layer reads override values only when inherit is false, but the
        // entity should still store them faithfully so flipping inherit off later
        // doesn't surprise the user with stale data.
        $qr = (new WorkspaceQrCode())
            ->setInheritIpSettings(true)
            ->setIpRestrictionEnabled(true)
            ->setAllowedIps(['10.0.0.1'])
            ->setInheritGeofencing(true)
            ->setGeofencingEnabled(true)
            ->setGeofencingLatitude(11.55)
            ->setGeofencingLongitude(104.9)
            ->setGeofencingRadiusMeters(75)
            ->setInheritDeviceVerification(true)
            ->setDeviceVerificationEnabled(true);

        $this->assertTrue($qr->isInheritIpSettings());
        $this->assertTrue($qr->isIpRestrictionEnabled());
        $this->assertSame(['10.0.0.1'], $qr->getAllowedIps());
        $this->assertSame(75, $qr->getGeofencingRadiusMeters());
        $this->assertTrue($qr->isDeviceVerificationEnabled());
    }

    public function testEachInstanceGetsAUniqueQrToken(): void
    {
        $tokens = [];
        for ($i = 0; $i < 5; $i++) {
            $tokens[] = (new WorkspaceQrCode())->getQrToken();
        }

        $this->assertCount(5, array_unique($tokens), 'Each sub-QR should mint a unique token');
    }
}
