function renderAll() {
    const data = getFilteredData();

    let virtuaCount = 0, movelCount = 0, tvCount = 0, foneCount = 0;
    let totalReceita = 0, solarCount = 0;
    const sellerCounts = {};

    data.forEach(i => {
        if (i.virtua) virtuaCount++;
        if (i.chip) movelCount++;
        if (i.tv) tvCount++;
        if (i.fone) foneCount++;

        if (i.solar.toUpperCase() === 'SIM') solarCount++;
        totalReceita += i.valor;

        if (i.vendedor) {
            sellerCounts[i.vendedor] = (sellerCounts[i.vendedor] || 0) + 1;
        }
    });

    document.getElementById('valVirtua').textContent = virtuaCount;
    document.getElementById('valMovel').textContent = movelCount;
    document.getElementById('valTV').textContent = tvCount;
    document.getElementById('valFone').textContent = foneCount;

    document.getElementById('valTotalContratos').textContent = data.length;
    document.getElementById('valSolarCount').textContent = solarCount;
    document.getElementById('valReceita').textContent = totalReceita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    renderRanking(sellerCounts);
    renderVendasList();
}

function renderRanking(sellerCounts) {
    const topSellersContainer = document.getElementById('topSellersContainer');
    topSellersContainer.innerHTML = '';

    const sortedSellers = Object.entries(sellerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (sortedSellers.length === 0) {
        topSellersContainer.innerHTML = `<p class="text-xs text-slate-400 font-medium text-center py-2">Nenhum registro encontrado.</p>`;
        return;
    }

    sortedSellers.forEach(([name, count], index) => {
        topSellersContainer.innerHTML += `
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1">
                    <span class="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">${index + 1}</span>
                    <div class="flex-1">
                        <p class="text-xs font-black text-slate-800">${name}</p>
                        <div class="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                            <div class="bg-red-500 h-1.5 rounded-full" style="width: ${Math.min(100, (count / (sortedSellers[0][1] || 1)) * 100)}%"></div>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-black text-slate-900">${count}</span>
                    <p class="text-[8px] font-bold text-slate-400">VENDAS</p>
                </div>
            </div>
        `;
    });
}

function renderVendasList() {
    const data = getFilteredData();
    const search = (document.getElementById('searchVendas')?.value || '').toLowerCase();
    const container = document.getElementById('vendasCardList');
    container.innerHTML = '';

    const filtered = data.filter(i => `${i.cliente} ${i.vendedor} ${i.lider} ${i.cpf} ${i.numSolar} ${i.cidade}`.toLowerCase().includes(search));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-xs font-bold text-slate-400">Nenhuma venda encontrada.</div>`;
        return;
    }

    filtered.forEach(i => {
        let prods = [];
        if (i.virtua) prods.push('VIRTUA');
        if (i.tv) prods.push('TV');
        if (i.chip) prods.push('MÓVEL');
        if (i.fone) prods.push('FONE');

        // Formatação do Timestamp (Data de Cadastro)
        const dataCadastro = i.timestamp ? new Date(i.timestamp).toLocaleString('pt-BR') : 'Data N/I';

        container.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2">
                <div class="flex justify-between items-start gap-2">
                    <div>
                        <h4 class="font-black text-sm text-slate-900 leading-tight">${i.cliente}</h4>
                        <p class="text-[10px] font-bold text-slate-400 mt-0.5">
                            SOLAR: <span class="text-slate-700 font-black">${i.numSolar}</span> 
                            ${i.cpf ? `• CPF: <span class="text-slate-700">${i.cpf}</span>` : ''}
                        </p>
                    </div>
                    <span class="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-lg shrink-0">${prods.join(' + ') || 'VENDA'}</span>
                </div>

                <!-- DATA DE CADASTRO -->
                <p class="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <i data-lucide="calendar" class="w-3 h-3"></i> Cadastrado em: <strong class="text-slate-600">${dataCadastro}</strong>
                </p>

                <div class="flex items-center justify-between text-[11px] font-semibold bg-slate-50 p-2 rounded-xl text-slate-600">
                    <span>Vend: <strong class="text-slate-800">${i.vendedor}</strong> (Líder: ${i.lider})</span>
                    <span class="font-black text-slate-900">${i.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}