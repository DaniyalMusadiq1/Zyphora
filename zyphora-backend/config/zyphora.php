<?php

return [
    'max_accounts_per_device' => (int) env('ZYPHORA_MAX_ACCOUNTS_PER_DEVICE', 2),
    'app_token_ttl_days' => (int) env('ZYPHORA_APP_TOKEN_TTL_DAYS', 30),
    'kyc_tier_cap_default' => (int) env('ZYPHORA_KYC_TIER_CAP', 3),
    'api_hmac_secret' => env('API_HMAC_SECRET', ''),
    'polygon_rpc_url' => env('POLYGON_RPC_URL', ''),
    'polygon_private_key' => env('POLYGON_PRIVATE_KEY', ''),
    'score_cache_ttl' => (int) env('ZYPHORA_SCORE_CACHE_TTL', 300),
    'leaderboard_cache_ttl' => (int) env('ZYPHORA_LEADERBOARD_CACHE_TTL', 600),
    'tasks_cache_ttl' => (int) env('ZYPHORA_TASKS_CACHE_TTL', 3600),
];
