<?php

use App\Services\TokenAllocatorService;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth:admin'])->group(function () {
    Route::get('/exports/allocations', function (TokenAllocatorService $allocator) {
        $csv = $allocator->exportAllocationsCsv();

        return response()->streamDownload(function () use ($csv) {
            echo $csv;
        }, 'zyphora-allocations.csv', [
            'Content-Type' => 'text/csv',
        ]);
    })->name('zyphora.allocations.export');
});
