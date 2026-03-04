<?php

declare(strict_types=1);

namespace App\DTO;

use App\DTO\Trait\HasEntityMapper;
use App\Entity\PayslipItem;
use App\Enum\PayslipItemTypeEnum;
use DateTimeImmutable;

/**
 * Class PayslipItemDTO
 *
 * @package App\DTO
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class PayslipItemDTO
{
    use HasEntityMapper;

    public function __construct(
        public int                 $id,
        public string              $publicId,
        public PayslipItemTypeEnum $type,
        public string              $label,
        public string              $amount,
        public DateTimeImmutable   $createdAt,
        public DateTimeImmutable   $updatedAt,
    )
    {
    }

    public static function fromEntity(PayslipItem $item): self
    {
        return new self(
            id: $item->id,
            publicId: $item->publicId,
            type: $item->getType(),
            label: $item->getLabel(),
            amount: $item->getAmount(),
            createdAt: $item->getCreatedAt(),
            updatedAt: $item->getUpdatedAt(),
        );
    }
}
