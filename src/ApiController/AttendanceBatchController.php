<?php
declare(strict_types=1);

namespace App\ApiController;

use App\Controller\AbstractController;
use App\Repository\AttendanceBatchRepository;
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
        AttendanceBatchRepository $attendanceBatchRepository,
    )
    {
        parent::__construct($translator);
    }

    public function post()
    {
        
    }
}
