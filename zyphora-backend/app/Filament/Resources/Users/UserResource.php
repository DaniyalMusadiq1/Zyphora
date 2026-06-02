<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages\ManageUsers;
use App\Models\User;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Colors\Color;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationLabel = 'Miners';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Full Name')
                    ->maxLength(255)
                    ->required(),
                
                TextInput::make('email')
                    ->label('Email Address')
                    ->email()
                    ->maxLength(255),
                
                TextInput::make('phone_hash')
                    ->label('Phone Hash')
                    ->disabled()
                    ->dehydrated(false),
                
                TextInput::make('device_id')
                    ->label('Device ID')
                    ->maxLength(128)
                    ->disabled()
                    ->dehydrated(false),
                
                Select::make('kyc_tier')
                    ->label('KYC Tier')
                    ->options([
                        0 => '0 — Not Verified',
                        1 => '1 — Basic',
                        2 => '2 — Enhanced',
                        3 => '3 — Premium',
                    ])
                    ->native(false)
                    ->live()
                    ->helperText('Set by admin or automatically when KYC is verified'),
                
                Toggle::make('is_banned')
                    ->label('Account Banned')
                    ->helperText('Banned users cannot access the platform'),
                
                TextInput::make('fraud_score')
                    ->label('Fraud Score')
                    ->numeric()
                    ->disabled()
                    ->helperText('Auto-calculated by fraud detection system'),
                
                TextInput::make('depth_score_d')
                    ->label('Depth Score (D)')
                    ->numeric()
                    ->step(0.01)
                    ->minValue(0)
                    ->maxValue(1),
                
                TextInput::make('early_weight_w')
                    ->label('Early Adopter Weight (W)')
                    ->numeric()
                    ->step(0.01)
                    ->minValue(0),
                
                Textarea::make('admin_notes')
                    ->label('Admin Notes')
                    ->placeholder('Internal notes about this user...')
                    ->rows(3)
                    ->columnSpanFull()
                    ->helperText('These notes are only visible to admins'),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('User')
                    ->searchable()
                    ->sortable()
                    ->formatStateUsing(fn ($state, User $record): string => 
                        $state . ($record->email ? "\n" . $record->email : '')
                    ),
                
                BadgeColumn::make('kyc_tier')
                    ->label('KYC')
                    ->sortable()
                    ->formatStateUsing(fn (int $state): string => match ($state) {
                        0 => 'Not Verified',
                        1 => 'Tier 1',
                        2 => 'Tier 2',
                        3 => 'Tier 3',
                        default => 'Unknown',
                    })
                    ->color(fn (int $state): array => match ($state) {
                        0 => Color::Gray,
                        1 => Color::Blue,
                        2 => Color::Purple,
                        3 => Color::Emerald,
                        default => Color::Gray,
                    }),
                
                TextColumn::make('fraud_score')
                    ->label('Fraud Score')
                    ->numeric(decimals: 4)
                    ->sortable()
                    ->color(fn (float $state): string => 
                        $state >= 0.7 ? 'danger' : ($state >= 0.4 ? 'warning' : 'success')
                    ),
                
                TextColumn::make('score.ps_total')
                    ->label('Total Score')
                    ->numeric(decimals: 4)
                    ->sortable()
                    ->toggleable(),
                
                TextColumn::make('streak.current_streak')
                    ->label('Streak')
                    ->numeric()
                    ->sortable()
                    ->toggleable(),
                
                ToggleColumn::make('is_banned')
                    ->label('Banned')
                    ->sortable(),
                
                TextColumn::make('created_at')
                    ->label('Joined')
                    ->dateTime('M j, Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([])
            ->recordActions([
                EditAction::make()
                    ->label('Edit')
                    ->icon(Heroicon::PencilSquare)
                    ->mutateFormDataUsing(function (array $data, User $record): array {
                        return $data;
                    })
                    ->after(function (User $record, array $data): void {
                        if (isset($data['is_banned']) && $data['is_banned'] !== $record->is_banned) {
                            $action = $data['is_banned'] ? 'user_banned' : 'user_unbanned';
                            $reason = $data['is_banned'] ? 'Account banned by admin' : 'Account unbanned by admin';
                            
                            \App\Models\AdminActionLog::create([
                                'admin_id' => auth()->id(),
                                'target_user_id' => $record->id,
                                'action' => $action,
                                'reason' => $reason,
                            ]);
                            
                            Notification::make()
                                ->title($data['is_banned'] ? 'User Banned' : 'User Unbanned')
                                ->body("{$record->name} has been " . ($data['is_banned'] ? 'banned' : 'unbanned'))
                                ->{$data['is_banned'] ? 'danger' : 'success'}()
                                ->send();
                        }
                        
                        if (isset($data['kyc_tier']) && $data['kyc_tier'] !== $record->kyc_tier) {
                            \App\Models\AdminActionLog::create([
                                'admin_id' => auth()->id(),
                                'target_user_id' => $record->id,
                                'action' => 'kyc_tier_updated',
                                'reason' => "KYC tier manually updated from {$record->kyc_tier} to {$data['kyc_tier']}",
                            ]);
                        }
                    }),
                
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with(['score', 'streak']);
    }

    public static function getPages(): array
    {
        return [
            'index' => ManageUsers::route('/'),
        ];
    }
}
