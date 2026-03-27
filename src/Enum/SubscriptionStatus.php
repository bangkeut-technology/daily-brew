<?php

namespace App\Enum;

enum SubscriptionStatus: string
{
    case Active = 'active';
    case PastDue = 'past_due';
    case Canceled = 'canceled';
    case Paused = 'paused';
    case Trialing = 'trialing';
}
