<x-filament-widgets::widget>
    <x-filament::section heading="Referral network (D3)">
        <div wire:ignore id="zyphora-referral-graph" style="height: 420px;" class="w-full rounded-lg bg-gray-950/30"></div>
        <script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
        <script>
            document.addEventListener('DOMContentLoaded', () => {
                const data = @json($graph);
                const el = document.getElementById('zyphora-referral-graph');
                if (!el || typeof d3 === 'undefined') return;
                if (!data.nodes || data.nodes.length === 0) {
                    el.innerHTML = '<p class="p-4 text-sm text-gray-400">No referral edges yet.</p>';
                    return;
                }

                const width = el.clientWidth || 600;
                const height = el.clientHeight || 420;

                const svg = d3.select(el).append('svg').attr('width', width).attr('height', height);
                const simulation = d3.forceSimulation(data.nodes)
                    .force('link', d3.forceLink(data.links).id(d => d.id).distance(90))
                    .force('charge', d3.forceManyBody().strength(-240))
                    .force('center', d3.forceCenter(width / 2, height / 2));

                const link = svg.append('g')
                    .attr('stroke', '#6b7280')
                    .selectAll('line')
                    .data(data.links)
                    .join('line')
                    .attr('stroke-width', d => (d.gamma > 1.2 ? 3 : 1))
                    .attr('stroke', d => (d.gamma > 1.2 ? '#FF9040' : '#6b7280'));

                const node = svg.append('g')
                    .selectAll('circle')
                    .data(data.nodes)
                    .join('circle')
                    .attr('r', 12)
                    .attr('fill', d => (d.gamma > 1.2 ? '#FF9040' : '#6C63FF'))
                    .call(d3.drag()
                        .on('start', dragstarted)
                        .on('drag', dragged)
                        .on('end', dragended));

                const label = svg.append('g')
                    .selectAll('text')
                    .data(data.nodes)
                    .join('text')
                    .text(d => d.label)
                    .attr('font-size', 10)
                    .attr('fill', '#e5e7eb')
                    .attr('dx', 14)
                    .attr('dy', 4);

                simulation.on('tick', () => {
                    link
                        .attr('x1', d => d.source.x)
                        .attr('y1', d => d.source.y)
                        .attr('x2', d => d.target.x)
                        .attr('y2', d => d.target.y);

                    node
                        .attr('cx', d => d.x)
                        .attr('cy', d => d.y);

                    label
                        .attr('x', d => d.x)
                        .attr('y', d => d.y);
                });

                function dragstarted(event) {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    event.subject.fx = event.subject.x;
                    event.subject.fy = event.subject.y;
                }

                function dragged(event) {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                }

                function dragended(event) {
                    if (!event.active) simulation.alphaTarget(0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                }
            });
        </script>
    </x-filament::section>
</x-filament-widgets::widget>
