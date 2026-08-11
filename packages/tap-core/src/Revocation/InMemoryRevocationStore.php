<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Revocation;

/**
 * A revocation list held in memory — what a terminal uses at a door with no network.
 *
 * The list stays small on its own: a revocation only matters while the pass it names is still
 * inside its validity window, so an event's list is bounded by the event, not by history. A door
 * syncs it whenever it has connectivity and keeps admitting people when it doesn't.
 *
 * The server side wants a real query against its own tables instead — implement
 * {@see RevocationStore} there rather than loading every revocation into a request.
 */
final class InMemoryRevocationStore implements RevocationStore
{
    /** @var array<string, array<string, true>> audienceId => passId => true */
    private array $revoked = [];

    /** @param iterable<string> $passIds */
    public function __construct(string $audienceId = '', iterable $passIds = [])
    {
        if ($audienceId !== '') {
            $this->revokeAll($audienceId, $passIds);
        }
    }

    public function revoke(string $audienceId, string $passId): void
    {
        $this->revoked[$audienceId][$passId] = true;
    }

    /** @param iterable<string> $passIds */
    public function revokeAll(string $audienceId, iterable $passIds): void
    {
        foreach ($passIds as $passId) {
            $this->revoke($audienceId, $passId);
        }
    }

    /**
     * Replaces the list for one event, which is what a sync does: a pass un-revoked upstream (a
     * refund reversed, a badge found) has to become admissible again, and merging can't express
     * that.
     *
     * @param iterable<string> $passIds
     */
    public function replace(string $audienceId, iterable $passIds): void
    {
        unset($this->revoked[$audienceId]);
        $this->revokeAll($audienceId, $passIds);
    }

    public function isRevoked(string $passId, string $audienceId): bool
    {
        return isset($this->revoked[$audienceId][$passId]);
    }

    public function count(string $audienceId): int
    {
        return count($this->revoked[$audienceId] ?? []);
    }
}
