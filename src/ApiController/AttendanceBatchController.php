<?php
declare(strict_types=1);

namespace App\ApiController;

use App\ApiController\Trait\AttendanceBatchTrait;
use App\Controller\AbstractController;
use App\Entity\AttendanceBatch;
use App\Event\AttendanceBatch\AttendanceBatchCreatedEvent;
use App\Form\AttendanceBatchFormType;
use App\Repository\AttendanceBatchRepository;
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
        $criteria = ['user' => $this->getUser()];
        $attendanceBatches = $this->attendanceBatchRepository->findByCriteria($criteria);

        return $this->json($attendanceBatches);
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

            $this->dispatcher->dispatch(new AttendanceBatchCreatedEvent($attendanceBatch, $this->getUser(), $form->get('employees')->getData()));

            return $this->json(['message' => $this->translator->trans('created.attendance_batch', ['%label%' => $attendanceBatch])]);
        }
        return $this->createBadRequestResponse($this->translator->trans('invalid.attendance_batch', domain: 'errors'));
    }
}
