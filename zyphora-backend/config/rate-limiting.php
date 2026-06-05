<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Rate Limiter Configurations
    |--------------------------------------------------------------------------
    |
    | Here you may define all of the rate limiters for your application.
    | These limiters will be registered with the RateLimiter factory.
    |
    */

    'limiters' => [
        'auth' => [
            'max_attempts' => 5,
            'decay_minutes' => 1,
            'by' => 'ip',
        ],

        'api' => [
            'max_attempts' => 60,
            'decay_minutes' => 1,
            'by' => 'user_or_ip',
        ],

        'kyc' => [
            'max_attempts' => 10,
            'decay_minutes' => 60,
            'by' => 'user_or_ip',
        ],
    ],
];
