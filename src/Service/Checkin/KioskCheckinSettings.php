<?php

declare(strict_types=1);

namespace App\Service\Checkin;

use App\Entity\Workspace;

/**
 * The check-in settings a kiosk tap runs under.
 *
 * Two of the workspace's controls cannot mean what they normally mean when the
 * reader is a fixed box rather than the employee's own phone:
 *
 * - **Device verification is off.** The rule is "within a day, one device per
 *   employee, and the check-out must come from the same device as the
 *   check-in". A kiosk is one device shared by the whole crew, so the first tap
 *   of the morning would bind it to that employee and reject everyone after.
 * - **Geofencing is off.** A kiosk has no GPS to offer, and the pipeline
 *   refuses a check-in outright when geofencing is on and coordinates are
 *   missing. Where the terminal is standing is a property of the terminal, not
 *   something the employee proves per tap.
 *
 * **IP restriction stays on**, and is the control that carries the weight here:
 * the kiosk sits on the restaurant's network, which is exactly what that
 * feature was built to check.
 *
 * @see docs/card-checkin.md
 */
final class KioskCheckinSettings
{
    public static function forWorkspace(Workspace $workspace): EffectiveCheckinSettings
    {
        $base = EffectiveCheckinSettings::fromWorkspace($workspace);

        return new EffectiveCheckinSettings(
            timezone: $base->timezone,
            ipRestrictionEnabled: $base->ipRestrictionEnabled,
            allowedIps: $base->allowedIps,
            geofencingEnabled: false,
            geofencingLatitude: null,
            geofencingLongitude: null,
            geofencingRadiusMeters: null,
            deviceVerificationEnabled: false,
        );
    }
}
