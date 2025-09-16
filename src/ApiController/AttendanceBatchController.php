<?php
declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Form\AttendanceBatchFormType;
use App\Repository\AttendanceBatchRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Class AttendanceBatchController
 *
 * @package App\ApiController
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
class AttendanceBatchController extends AbstractController
{
    public function __construct(
        TranslatorInterface $translator,
        private readonly AttendanceBatchRepository $attendanceBatchRepository,
    )
    {
        parent::__construct($translator);
    }

    /**
     * Handles the creation of a new attendance batch by processing the submitted form data.
     *
     * @param Request $request The HTTP request containing the form data payload.
     *
     * @return JsonResponse A JSON response indicating the success of the operation.
     */
    public function post(Request $request)
    {
        $attendanceBatch = $this->attendanceBatchRepository->create();
        $form = $this->createForm(AttendanceBatchFormType::class, $attendanceBatch);
        $form->submit($request->getPayload()->all());
        if ($form->isSubmitted() && $form->isValid()) {
            $attendanceBatch->setUser($this->getUser());
            $this->attendanceBatchRepository->update($attendanceBatch);
            return $this->json(['message' => 'ok']);
        }
    }
}
