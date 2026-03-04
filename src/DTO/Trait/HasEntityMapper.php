<?php

declare(strict_types=1);

namespace App\DTO\Trait;

/**
 * Provides a static fromEntities() collection mapper for any DTO that
 * implements a static fromEntity() factory method.
 *
 * Usage: add `use HasEntityMapper;` to a DTO class.
 *
 * @template T of object
 */
trait HasEntityMapper
{
    /**
     * Map a collection of entities to an array of DTOs.
     *
     * @param iterable<T> $entities
     *
     * @return static[]
     */
    public static function fromEntities(iterable $entities, mixed ...$args): array
    {
        $result = [];
        foreach ($entities as $entity) {
            $result[] = static::fromEntity($entity, ...$args);
        }

        return $result;
    }
}
