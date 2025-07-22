<?php

declare(strict_types=1);

namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as BaseAbstractController;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\PropertyAccess\PropertyAccess;
use Symfony\Component\PropertyAccess\PropertyAccessor;
use Symfony\Component\PropertyAccess\PropertyPathInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Abstract class AbstractController.
 *
 * This class serves as a base for all controllers in the application.
 * It extends the BaseAbstractController class provided by Symfony.
 *
 * @author  Vandeth THO <thovandeth@gmail.com>
 *
 * @method User|null getUser()
 */
abstract class AbstractController extends BaseAbstractController
{
    protected PropertyAccessor $propertyAccessor;

    /**
     * Class constructor.
     *
     * Initializes the propertyAccessor object.
     *
     * @var TranslatorInterface translator service used for translating messages and texts in the application
     */
    public function __construct(
        protected readonly TranslatorInterface $translator,
    ) {
        $this->propertyAccessor = PropertyAccess::createPropertyAccessor();
    }

    /**
     * Sets the value of a property on an object or array.
     *
     * @param object|array &               $object   The object or array to set the property on
     * @param string|PropertyPathInterface $property the property name or PropertyPathInterface object
     * @param mixed                        $value    the value to set
     *
     * @return bool true if the property was set successfully, false otherwise
     */
    protected function setProperty(object|array &$object, string|PropertyPathInterface $property, mixed $value): bool
    {
        try {
            if ($this->propertyAccessor->isWritable($object, $property)) {
                $this->propertyAccessor->setValue($object, $property, $value);

                return true;
            }

            return false;
        } catch (\InvalidArgumentException) {
            throw $this->createBadRequestException(sprintf('The property "%s" is not writable.', $property));
        }
    }

    /**
     * Creates a new BadRequestHttpException.
     *
     * This method is used to generate a BadRequestHttpException with a custom message and an optional previous exception.
     *
     * @param string          $message  Custom error message for the BadRequestHttpException. Defaults to 'Invalid Data'.
     * @param \Throwable|null $previous Optional previous exception for exception chaining. Defaults to null.
     *
     * @return BadRequestHttpException the created BadRequestHttpException instance
     */
    protected function createBadRequestException(string $message = 'Invalid Data', ?\Throwable $previous = null): BadRequestHttpException
    {
        return new BadRequestHttpException($message, $previous);
    }

    /**
     * Creates a JSON response with a bad request status.
     *
     * This method is used to generate a JSON response with a 400 Bad Request status code and a custom message.
     *
     * @param string $message Custom error message for the response. Defaults to 'Invalid Data'.
     *
     * @return JsonResponse the created JSON response
     */
    protected function createBadRequestResponse(string $message = 'Invalid Data'): JsonResponse
    {
        return $this->json([
            'message' => $message,
        ],
            Response::HTTP_BAD_REQUEST,
        );
    }

    /**
     * Creates a new UnauthorizedHttpException.
     *
     * This method is used to generate an UnauthorizedHttpException with a custom message and an optional previous exception.
     *
     * @param string          $message  Custom error message for the UnauthorizedHttpException. Defaults to 'Unauthorized'.
     * @param \Throwable|null $previous Optional previous exception for exception chaining. Defaults to null.
     *
     * @return UnauthorizedHttpException the created UnauthorizedHttpException instance
     */
    protected function createUnauthorizedException(string $message = 'Unauthorized', ?\Throwable $previous = null): UnauthorizedHttpException
    {
        return new UnauthorizedHttpException('', $message, $previous);
    }

    /**
     * Returns an array of form errors.
     *
     * This method is used to extract form errors from a FormInterface object and return them as an array.
     *
     * @param FormInterface $form the form object to extract errors from
     *
     * @return array an array of form errors
     */
    protected function getFormErrors(FormInterface $form): array
    {
        $errors = [];
        foreach ($form->getErrors() as $error) {
            $errors[] = $error->getMessage();
        }
        foreach ($form->all() as $childForm) {
            if ($childForm instanceof FormInterface) {
                if ($childErrors = $this->getFormErrors($childForm)) {
                    $errors[$childForm->getName()] = $childErrors;
                }
            }
        }

        return $errors;
    }

    /**
     * Creates a JSON response with form errors.
     *
     * This method is used to generate a JSON response containing form errors with a 400 Bad Request status code.
     *
     * @param FormInterface $form the form object containing validation errors
     *
     * @return JsonResponse the created JSON response with form errors
     */
    protected function createFormErrorsResponse(FormInterface $form): JsonResponse
    {
        return $this->json($this->getFormErrors($form), Response::HTTP_BAD_REQUEST);
    }
}
