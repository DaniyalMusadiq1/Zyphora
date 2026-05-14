<?php

namespace App\Filament\Widgets;

use App\Services\ReferralGraphService;
use Filament\Widgets\Widget;

class ReferralNetworkWidget extends Widget
{
    protected string $view = 'filament.widgets.referral-network-widget';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    protected function getViewData(): array
    {
        return [
            'graph' => app(ReferralGraphService::class)->graphDataset(),
        ];
    }
}
