<?php

namespace App\Enum;

enum SubscriptionSourceEnum: string
{
    case Paddle = 'paddle';
    case RevenueCat = 'revenuecat';
}
