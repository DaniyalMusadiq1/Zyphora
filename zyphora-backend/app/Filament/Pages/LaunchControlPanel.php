<?php

namespace App\Filament\Pages;

use App\Services\ScoreEngineService;
use App\Services\TokenAllocatorService;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Log;
use UnitEnum;

class LaunchControlPanel extends Page
{
    protected static string|UnitEnum|null $navigationGroup = 'Operations';

    protected static ?string $navigationLabel = 'Launch control';

    protected static ?string $title = 'Launch control';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRocketLaunch;

    protected static ?int $navigationSort = 99;

    protected string $view = 'filament.pages.launch-control-panel';

    public ?string $merkleRoot = null;

    public ?string $polygonTx = null;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('freeze')
                ->label('Freeze scores')
                ->action(fn () => $this->freezeScores()),
            Action::make('merkle')
                ->label('Build Merkle tree')
                ->action(fn () => $this->buildMerkle()),
            Action::make('export')
                ->label('Export allocations CSV')
                ->url(fn () => route('zyphora.allocations.export'))
                ->openUrlInNewTab(),
            Action::make('polygon')
                ->label('Publish to Polygon')
                ->action(fn () => $this->publishPolygon()),
        ];
    }

    public function freezeScores(): void
    {
        app(ScoreEngineService::class)->freezeAll();

        Notification::make()
            ->title('Scores frozen')
            ->success()
            ->send();
    }

    public function buildMerkle(): void
    {
        $result = app(TokenAllocatorService::class)->buildMerkleTree();
        $this->merkleRoot = $result['root'];

        Notification::make()
            ->title('Merkle tree built')
            ->body($this->merkleRoot)
            ->success()
            ->send();
    }

    public function publishPolygon(): void
    {
        $rpc = (string) config('zyphora.polygon_rpc_url');
        if ($rpc === '') {
            Notification::make()
                ->title('POLYGON_RPC_URL is not configured')
                ->danger()
                ->send();

            return;
        }

        Log::info('zyphora.polygon.publish', [
            'rpc' => $rpc,
            'merkle_root' => $this->merkleRoot,
        ]);

        $this->polygonTx = 'stub-'.uniqid('', true);

        Notification::make()
            ->title('Polygon publish recorded (stub)')
            ->body($this->polygonTx)
            ->success()
            ->send();
    }
}
