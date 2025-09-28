<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceBatchTrait;
use App\Controller\AbstractController;
use App\Entity\Attendance;
use App\Entity\AttendanceBatch;
use App\Enum\AttendanceTypeEnum;
use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Event\AttendanceBatch\AttendanceBatchDeletedEvent;
use App\Event\AttendanceBatch\AttendanceBatchUpdatedEvent;
use App\Form\AttendanceBatchFormType;
use App\Repository\AttendanceBatchRepository;
use App\Repository\AttendanceRepository;
use DateMalformedStringException;
use DateTimeImmutable;
use Nelmio\ApiDocBundle\Attribute\Model;
use OpenApi\Attributes as OA;
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
#[OA\Tag(name: 'Attendance Batch')]
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

    /**
     * Get attendance batches by the current user.
     *
     * @return JsonResponse
     */
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of attendance batches for the current user',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: AttendanceBatch::class, groups: ['attendance_batch:read']))
        )
    )]
    #[Route(name: 'gets', methods: ['GET'])]
    public function gets(): JsonResponse
    {
        $criteria = ['user' => $this->getUser(), 'label' => null];
        $attendanceBatches = $this->attendanceBatchRepository->findByCriteria($criteria);

        return $this->createAttendanceBatchResponse($attendanceBatches);
    }

    /**
     * Handles the creation of a new attendance batch by processing the submitted form data.
     *
     * @param Request $request The HTTP request containing the form data payload.
     *
     * @return JsonResponse A JSON response indicating the success of the operation.
     */
    #[OA\RequestBody(
        description: 'Attendance Batch data',
        content: new OA\JsonContent(
            ref: new Model(type: AttendanceBatchFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_CREATED,
        description: 'Returns the created attendance batch.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Confirmation message after creation', type: 'string'),
                new OA\Property(property: 'attendance_batch', ref: new Model(type: AttendanceBatch::class, groups: ['attendance_batch:read'])),
            ], type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid attendance batch data.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'error', description: 'Error message', type: 'string'),
            ], type: 'object'
        )
    )]
    #[Route(name: 'post', methods: ['POST'])]
    public function post(Request $request): JsonResponse
    {
        $attendanceBatch = $this->attendanceBatchRepository->create();
        $form = $this->createForm(AttendanceBatchFormType::class, $attendanceBatch);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            if (null !== $this->attendanceBatchRepository->findByLabelAndUser($attendanceBatch->getLabel(), $this->getUser())) {
                return $this->createBadRequestResponse($this->translator->trans('existed.attendance_batch', ['%label%' => $attendanceBatch->getLabel()], domain: 'errors'));
            }
            $attendanceBatch->setUser($this->getUser());
            $this->attendanceBatchRepository->update($attendanceBatch);

            $this->dispatcher->dispatch(new AttendanceBatchCreatedEvent($attendanceBatch, $this->getUser()));

            return $this->createAttendanceBatchResponse([
                'message' => $this->translator->trans('created.attendance_batch', ['%label%' => $attendanceBatch]),
                'attendance_batch' => $attendanceBatch,
            ]);
        }
        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance_batch', domain: 'errors'));
    }


    /**
     * Retrieves a list of upcoming leaves for the specified date range and filters, if provided.
     *
     * @param Request $request The HTTP request containing optional query parameters:
     *                         - 'type': Type of attendance to filter (e.g., LEAVE, SICK_LEAVE).
     *
     * @return JsonResponse The JSON response containing a list of filtered upcoming leaves.
     *
     * @throws DateMalformedStringException
     */
    #[OA\Parameter(
        name: 'type',
        description: 'Type of attendance to filter (e.g., LEAVE, SICK_LEAVE)',
        in: 'query',
        required: false,
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns a list of upcoming leaves within the specified date range.',
        content: new OA\JsonContent(
            type: 'array',
            items: new OA\Items(ref: new Model(type: AttendanceBatch::class, groups: ['attendance_batch:read']))
        )
    )]
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

        return $this->createAttendanceBatchResponse($attendances);
    }

    /**
     * Retrieves an attendance batch by its publicId.
     *
     * @param string $publicId The public ID of the attendance batch to retrieve.
     *
     * @return JsonResponse The JSON response containing the attendance batch data.
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The public ID of the attendance batch to retrieve.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the attendance batch data for the specified public ID.',
        content: new OA\JsonContent(ref: new Model(type: AttendanceBatch::class, groups: ['attendance_batch:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Attendance batch not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ], type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'get', methods: ['GET'])]
    public function get(string $publicId): JsonResponse
    {
        $batch = $this->getAttendanceBatchByPublicId($publicId);

        return $this->createAttendanceBatchResponse($batch);
    }

    /**
     * Updates an attendance batch by its publicId with the provided data.
     *
     * @param string  $publicId The public ID of the attendance batch to update.
     * @param Request $request  The HTTP request containing the data to update the attendance batch.
     *
     * @return JsonResponse The JSON response containing the updated attendance batch data or an error message.
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The public ID of the attendance batch to update.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\RequestBody(
        description: 'Attendance Batch data',
        content: new OA\JsonContent(
            ref: new Model(type: AttendanceBatchFormType::class),
        )
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Returns the updated attendance batch.',
        content: new OA\JsonContent(ref: new Model(type: AttendanceBatch::class, groups: ['attendance_batch:read']))
    )]
    #[OA\Response(
        response: Response::HTTP_BAD_REQUEST,
        description: 'Invalid attendance batch data.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'error', description: 'Error message', type: 'string'),
            ], type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Attendance batch not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ]
        )
    )]
    #[Route('/{publicId}', name: 'put', methods: ['PUT'])]
    public function put(string $publicId, Request $request): JsonResponse
    {
        $batch = $this->getAttendanceBatchByPublicId($publicId);
        $form = $this->createForm(AttendanceBatchFormType::class, $batch);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            if (null !== $this->attendanceBatchRepository->findByLabelAndUser($batch->getLabel(), $this->getUser())) {
                return $this->createBadRequestResponse($this->translator->trans('existed.attendance_batch', ['%label%' => $batch->getLabel()], domain: 'errors'));
            }

            $this->attendanceBatchRepository->update($batch);

            $this->dispatcher->dispatch(new AttendanceBatchUpdatedEvent($batch, $this->getUser()));

            return $this->createAttendanceBatchResponse([
                'message' => $this->translator->trans('updated.attendance_batch', ['%label%' => $batch]),
                'attendance_batch' => $batch,
            ]);
        }
        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance_batch', domain: 'errors'));
    }

    /**
     * Deletes an attendance batch by its publicId.
     *
     * @param string $publicId The public ID of the attendance batch to delete.
     *
     * @return JsonResponse The JSON response indicating the result of the deletion operation.
     */
    #[OA\Parameter(
        name: 'publicId',
        description: 'The public ID of the attendance batch to delete.',
        in: 'path',
        required: true,
        schema: new OA\Schema(type: 'string')
    )]
    #[OA\Response(
        response: Response::HTTP_OK,
        description: 'Attendance batch deleted successfully.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', type: 'string'),
                new OA\Property(property: 'attendance_batch', type: 'object'),
            ],
            type: 'object'
        )
    )]
    #[OA\Response(
        response: Response::HTTP_NOT_FOUND,
        description: 'Attendance batch not found.',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'message', description: 'Error message', type: 'string'),
            ], type: 'object'
        )
    )]
    #[Route('/{publicId}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $publicId): JsonResponse
    {
        $batch = $this->getAttendanceBatchByPublicId($publicId);

        $this->dispatcher->dispatch(new AttendanceBatchDeletedEvent($batch, $this->getUser()));

        $this->attendanceBatchRepository->delete($batch);

        return $this->createAttendanceBatchResponse([
            'message' => $this->translator->trans('deleted.attendance_batch', ['%label%' => $batch]),
            'attendance_batch' => $batch,
        ]);
    }
}
