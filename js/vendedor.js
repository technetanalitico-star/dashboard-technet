initPage('VENDEDOR');

// Sobrescreve a renderização do Ranking para exibir a métrica individual do vendedor
function renderRanking(sellerCounts, totalVendas) {
    const container = document.getElementById('rankingContainer');
    if (!container) return;

    const name = session?.user?.username || 'VENDEDOR';
    
    container.innerHTML = `
        <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1">
                <span class="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">1</span>
                <div class="flex-1">
                    <p class="text-xs font-black text-slate-800">${name}</p>
                    <div class="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                        <div class="bg-red-500 h-1.5 rounded-full" style="width: 100%"></div>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <span class="text-xs font-black text-slate-900">${totalVendas}</span>
                <p class="text-[8px] font-bold text-slate-400">VENDAS</p>
            </div>
        </div>
    `;
}