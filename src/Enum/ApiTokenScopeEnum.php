<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * What an API token is allowed to do. Scopes are stored on the token as a JSON
 * list and checked by the controller behind the integrations firewall.
 *
 * Tokens minted before scopes existed were back-filled to read-only: a
 * migration must never hand an existing key a capability its owner didn't ask
 * for, and write access to attendance is the capability payroll is reconciled
 * against.
 */
enum ApiTokenScopeEnum: string
{
    /** Pull attendance (the BasilBook feed). */
    case ReadAttendance = 'attendance:read';

    /** Record attendance from outside — requires a signed request. */
    case WriteAttendance = 'attendance:write';

    /** Submit card taps from a kiosk terminal — requires a signed request. */
    case TapCheckin = 'checkin:tap';

    public function label(): string
    {
        return match ($this) {
            self::ReadAttendance => 'Read attendance',
            self::WriteAttendance => 'Write attendance',
            self::TapCheckin => 'Card check-in',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::ReadAttendance => 'Pull attendance records for this workspace.',
            self::WriteAttendance => 'Record attendance from an external system. Requires request signing.',
            self::TapCheckin => 'Submit card taps from a kiosk terminal. Requires request signing.',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(static fn (self $c) => $c->value, self::cases());
    }

    /**
     * Parse a caller-supplied list, dropping anything unrecognised.
     *
     * @param  mixed $raw
     * @return array<int, self>
     */
    public static function fromList(mixed $raw): array
    {
        if (!is_array($raw)) {
            return [];
        }

        $scopes = [];
        foreach ($raw as $value) {
            if (!is_string($value)) {
                continue;
            }
            $scope = self::tryFrom($value);
            if ($scope !== null && !in_array($scope, $scopes, true)) {
                $scopes[] = $scope;
            }
        }

        return $scopes;
    }
}
