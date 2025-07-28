<?php

declare(strict_types=1);

namespace App\Hydrator;

use DateTime;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Internal\Hydration\AbstractHydrator as BaseAbstractHydrator;
use Exception;
use JsonException;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Symfony\Component\PropertyInfo\Extractor\PhpDocExtractor;
use Symfony\Component\PropertyInfo\Extractor\ReflectionExtractor;
use Symfony\Component\PropertyInfo\PropertyInfoExtractor;
use Symfony\Component\TypeInfo\TypeIdentifier;

/**
 * Class AbstractHydrator.
 *
 * @author Vandeth THO <thovandeth@gmail.com>
 */
abstract class AbstractHydrator extends BaseAbstractHydrator
{
    protected PropertyAccessor $propertyAccessor;

    protected PropertyInfoExtractor $propertyInfo;

    protected ?string $dtoClass;

    /**
     * AbstractHydrator constructor.
     */
    public function __construct(EntityManagerInterface $em, ?string $dtoClass = null)
    {
        parent::__construct($em);
        $this->propertyAccessor = PropertyAccess::createPropertyAccessorBuilder()
            ->enableMagicMethods()
            ->getPropertyAccessor();
        $phpDocExtractor = new PhpDocExtractor();
        $reflectionExtractor = new ReflectionExtractor();
        $listExtractors = [$reflectionExtractor];
        $typeExtractors = [$phpDocExtractor, $reflectionExtractor];
        $descriptionExtractors = [$phpDocExtractor];
        $accessExtractors = [$reflectionExtractor];
        $propertyInitializableExtractors = [$reflectionExtractor];
        $this->propertyInfo = new PropertyInfoExtractor(
            $listExtractors,
            $typeExtractors,
            $descriptionExtractors,
            $accessExtractors,
            $propertyInitializableExtractors
        );
        $this->dtoClass = $dtoClass;
    }

    /**
     * Find an object in an array.
     *
     * @return false|int|string
     */
    protected function findById(array $haystack, ?int $id): bool|int|string
    {
        foreach ($haystack as $key => $value) {
            if ($value->getId() === $id) {
                return $key;
            }
        }

        return false;
    }

    /**
     * @throws JsonException
     * @throws Exception
     */
    protected function getValue(string $key, mixed $value, ?string $dtoClass = null): mixed
    {
        if (null === $type = $this->propertyInfo->getType($dtoClass, $key)) {
            if ($type->isIdentifiedBy(DateTimeImmutable::class)) {
                return new DateTimeImmutable($value);
            }

            if ($type->isIdentifiedBy(DateTime::class)) {
                return new DateTime($value);
            }

            if ($type->isIdentifiedBy(TypeIdentifier::ARRAY)) {
                return json_decode($value, true, 512, JSON_THROW_ON_ERROR);
            }
        }

        return $value;
    }

    /**
     * @throws \Doctrine\DBAL\Exception
     * @throws Exception
     */
    protected function hydrateAllData(): array
    {
        $results = [];
        foreach ($this->stmt->fetchAllAssociative() as $row) {
            $this->hydrateRowData($row, $results);
        }

        return $results;
    }

    /**
     * @throws Exception
     */
    protected function hydrateRowData(array $row, array &$result): void
    {
        $dto = new $this->dtoClass();
        $class = null;
        foreach ($row as $key => $value) {
            if (null !== $finalValue = $value) {
                $properties = explode('_', $this->rsm->getScalarAlias($key));
                if (count($properties) > 0) {
                    if (1 === count($properties)) {
                        $property = $properties[0];
                        if ($this->propertyAccessor->isWritable($dto, $property)) {
                            $finalValue = $this->getValue($property, $finalValue, $this->dtoClass);
                            $this->propertyAccessor->setValue($dto, $property, $finalValue);
                        }
                        continue;
                    }
                    $alias = [];
                    $count = count($properties) - 1;
                    foreach ($properties as $property) {
                        $alias[] = $property;
                        $path = implode('.', $alias);
                        if (null === $type = $this->propertyInfo->getType($this->dtoClass, $path)) {
                            $previous = $alias;
                            unset($previous[count($alias) - 1]);
                            if (null !== $previousType = $this->propertyInfo->getType($this->dtoClass, implode('.', $previous))) {
                                $type = $this->propertyInfo->getType($previousType[0]->getClassName(), $property);
                            }
                        }
                        if (null !== $type && null === $this->propertyAccessor->getValue($dto, $path) && $type->isIdentifiedBy(TypeIdentifier::OBJECT)) {
                            if (!$type->isIdentifiedBy(DateTimeImmutable::class)
                                || !$type->isIdentifiedBy(DateTime::class)
                                || !$type->isIdentifiedBy(DateTimeInterface::class)) {
                                $class = $type[0]->getClassName();
                                $this->propertyAccessor->setValue($dto, $path, new $class());
                            }
                        }
                        $finalValue = $this->getValue($properties[$count], $finalValue, $class);
                        $this->propertyAccessor->setValue($dto, $path, $finalValue);
                    }
                }
            }
            $result[] = $dto;
        }
    }
}
