<x-filament-panels::page>
    <div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
        <p>Use the actions above to freeze scores, build the Merkle tree, export allocations, or record a Polygon publish.</p>
        @if ($merkleRoot)
            <div class="rounded-lg bg-gray-950/40 p-4 font-mono text-xs text-primary-400">
                Merkle root: {{ $merkleRoot }}
            </div>
        @endif
        @if ($polygonTx)
            <div class="rounded-lg bg-gray-950/40 p-4 font-mono text-xs text-teal-400">
                Last Polygon tx reference: {{ $polygonTx }}
            </div>
        @endif
    </div>
</x-filament-panels::page>
