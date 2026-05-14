<?php

namespace App\Filament\Resources\FraudQueues;

use App\Filament\Resources\FraudQueues\Pages\ManageFraudQueues;
use App\Models\AdminActionLog;
use App\Models\FraudScore;
use App\Models\User;
use BackedEnum;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

class FraudQueueResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationLabel = 'Fraud queue';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldExclamation;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->maxLength(255),
                TextInput::make('email')->email(),
                Select::make('kyc_tier')->label('Tier')->options([
                    0 => '0',
                    1 => '1',
                    2 => '2',
                    3 => '3',
                ])->native(false),
                Toggle::make('is_banned')->label('Banned'),
                TextInput::make('fraud_score')->numeric()->disabled(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('email')->searchable(),
                TextColumn::make('kyc_tier')->label('Tier')->sortable(),
                TextColumn::make('fraud_score')->sortable(),
                ToggleColumn::make('is_banned'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('mark_clean')
                        ->label('Mark as clean')
                        ->requiresConfirmation()
                        ->form([
                            TextInput::make('reason')->label('Reason')->required(),
                        ])
                        ->action(function (\Illuminate\Support\Collection $records, array $data): void {
                            foreach ($records as $user) {
                                /** @var User $user */
                                $user->fraud_score = 0;
                                $user->save();
                                FraudScore::query()->updateOrCreate(
                                    ['user_id' => $user->id],
                                    [
                                        'user_id' => $user->id,
                                        'sigma_total' => 0,
                                        'status' => 'clean',
                                    ]
                                );
                                AdminActionLog::query()->create([
                                    'admin_id' => Auth::guard('admin')->id(),
                                    'target_user_id' => $user->id,
                                    'action' => 'fraud_mark_clean',
                                    'reason' => $data['reason'] ?? null,
                                ]);
                            }
                        }),
                    BulkAction::make('suspend')
                        ->label('Suspend')
                        ->color('warning')
                        ->requiresConfirmation()
                        ->form([
                            TextInput::make('reason')->label('Reason')->required(),
                        ])
                        ->action(function (\Illuminate\Support\Collection $records, array $data): void {
                            foreach ($records as $user) {
                                /** @var User $user */
                                FraudScore::query()->updateOrCreate(
                                    ['user_id' => $user->id],
                                    [
                                        'user_id' => $user->id,
                                        'status' => 'suspended',
                                    ]
                                );
                                AdminActionLog::query()->create([
                                    'admin_id' => Auth::guard('admin')->id(),
                                    'target_user_id' => $user->id,
                                    'action' => 'fraud_suspend',
                                    'reason' => $data['reason'] ?? null,
                                ]);
                            }
                        }),
                    BulkAction::make('ban')
                        ->label('Ban')
                        ->color('danger')
                        ->requiresConfirmation()
                        ->form([
                            TextInput::make('reason')->label('Reason')->required(),
                        ])
                        ->action(function (\Illuminate\Support\Collection $records, array $data): void {
                            foreach ($records as $user) {
                                /** @var User $user */
                                $user->is_banned = true;
                                $user->save();
                                FraudScore::query()->updateOrCreate(
                                    ['user_id' => $user->id],
                                    [
                                        'user_id' => $user->id,
                                        'status' => 'banned',
                                    ]
                                );
                                AdminActionLog::query()->create([
                                    'admin_id' => Auth::guard('admin')->id(),
                                    'target_user_id' => $user->id,
                                    'action' => 'fraud_ban',
                                    'reason' => $data['reason'] ?? null,
                                ]);
                            }
                        }),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('fraud_score', '>=', 0.20);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageFraudQueues::route('/'),
        ];
    }
}
