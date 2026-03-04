<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceBatchTrait;
use App\Controller\AbstractController;
use App\DTO\AttendanceBatchDTO;
use App\Enum\AttendanceTypeEnum;
use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Event\AttendanceBatch\AttendanceBatchDeletedEvent;
use App\Event\AttendanceBatch\AttendanceBatchUpdatedEvent;
use App\Form\AttendanceBatchFormType;
use App\Repository\AttendanceBatchRepository;
use DateMalformedStringException;
use DateTimeImmutable;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class AttendanceBatchController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
#[Route('/attendance-batches', name: 'attendance_batches_')]
class AttendanceBatchController extends AbstractController
{
    use AttendanceBatchTrait;

    public function __construct(
        TranslatorInterface                        $translator,
        private readonly AttendanceBatchRepository $attendanceBatchRepository,
        private readonly EventDispatcherInterface  $dispatcher,
    )
    {
        parent::__construct($translator);
    }

    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(): JsonResponse
    {
        $criteria = ['user' => $this->getUser(), 'label' => null];
        $attendanceBatches = $this->attendanceBatchRepository->findByCriteria($criteria);

        return $this->createAttendanceBatchResponse(AttendanceBatchDTO::fromEntities($attendanceBatches));
    }

    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $attendanceBatch = $this->attendanceBatchRepository->create();
        $form = $this->createForm(AttendanceBatchFormType::class, $attendanceBatch);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $user = $this->getUser();
            if (null !== $this->attendanceBatchRepository->findByLabelAndUser($attendanceBatch->getLabel(), $user)) {
                return $this->createBadRequestResponse($this->translator->trans('existed.attendance_batch', ['%label%' => $attendanceBatch->getLabel()], domain: 'errors'));
            }
            $attendanceBatch->setWorkspace($user->getCurrentWorkspace());
            $attendanceBatch->setUser($user);
            $this->attendanceBatchRepository->update($attendanceBatch);

            $this->dispatcher->dispatch(new AttendanceBatchCreatedEvent($attendanceBatch, $user));

            return $this->createAttendanceBatchResponse([
                'message'          => $this->translator->trans('created.attendance_batch', ['%label%' => $attendanceBatch]),
                'attendance_batch' => AttendanceBatchDTO::fromEntity($attendanceBatch),
            ]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance_batch', domain: 'errors'));
    }

    /**
     * @throws DateMalformedStringException
     */
    #[Route('/upcoming', name: 'upcoming', methods: ['GET'])]
    public function upcoming(Request $request): JsonResponse
    {
        $type = $request->query->get('type');

        $from = new DateTimeImmutable('today 00:00:00');
        $to = $from->modify('+14 days')->setTime(23, 59, 59);

        $attendances = $this->attendanceBatchRepository->findUpcomingByType(
            user: $this->getUser(),
            from: $from,
            to: $to,
            type: $type ? AttendanceTypeEnum::from($type) : null,
        );

        return $this->createAttendanceBatchResponse(AttendanceBatchDTO::fromEntities($attendances));
    }

    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $batch = $this->getAttendanceBatchByPublicId($publicId);

        return $this->createAttendanceBatchResponse(AttendanceBatchDTO::fromEntity($batch));
    }

    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(string $publicId, Request $request): JsonResponse
    {
        $batch = $this->getAttendanceBatchByPublicId($publicId);
        $form = $this->createForm(AttendanceBatchFormType::class, $batch);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $found = $this->attendanceBatchRepository->findByLabelAndUser($batch->getLabel(), $this->getUser());
            if (null !== $found && $batch->getLabel() !== $found->getLabel()) {
                return $this->createBadRequestResponse($this->translator->trans('existed.attendance_batch', ['%label%' => $batch->getLabel()], domain: 'errors'));
            }

            $this->dispatcher->dispatch(new AttendanceBatchUpdatedEvent($batch, $this->getUser()));
            $this->attendanceBatchRepository->update($batch);

            return $this->createAttendanceBatchResponse([
                'message'          => $this->translator->trans('updated.attendance_batch', ['%label%' => $batch]),
                'attendance_batch' => AttendanceBatchDTO::fromEntity($batch),
            ]);
        }

        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance_batch', domain: 'errors'));
    }

    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $batch = $this->getAttendanceBatchByPublicId($publicId);

        $this->dispatcher->dispatch(new AttendanceBatchDeletedEvent($batch, $this->getUser()));
        $this->attendanceBatchRepository->delete($batch);

        return $this->createAttendanceBatchResponse([
            'message'          => $this->translator->trans('deleted.attendance_batch', ['%label%' => $batch]),
            'attendance_batch' => AttendanceBatchDTO::fromEntity($batch),
        ]);
    }
}
