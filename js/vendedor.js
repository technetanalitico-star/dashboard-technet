let session = JSON.parse(sessionStorage.getItem('userData'));
let currentBranch = 'TODOS';
let rawSales = [];

if (!session || session.user.perfil !== 'VENDEDOR') {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('usrName').textContent = session.user.username;
    rawSales = session.sales.map(parseRow);
    renderAll();
});

function getFilteredData() {
    return rawSales.filter(i => {
        if (currentBranch === 'TODOS') return true;
        return i.empresa.includes(currentBranch);
    });
}

function renderAll() {
    const data = getFilteredData();
    let virtua = 0, movel = 0, tv = 0, fone = 0, solar = 0, receita = 0;

    data.forEach(i => {
        if (i.virtua) virtua++;
        if (i.chip) movel++;
        if (i.tv) tv++;
        if (i.fone) fone++;
        if (i.solar.toUpperCase() === 'SIM') solar++;
        receita += i.valor;
    });

    document.getElementById('valVirtua').textContent = virtua;
    document.getElementById('valMovel').textContent = movel;
    document.getElementById('valTV').textContent = tv;
    document.getElementById('valFone').textContent = fone;
    document.getElementById('valTotalContratos').textContent = data.length;
    document.getElementById('valSolarCount').textContent = solar;
    document.getElementById('valReceita').textContent = receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    renderRanking(data.length);
    renderVendasList();
    lucide.createIcons();
}

function renderRanking(totalVendas) {
    const container = document.getElementById('rankingContainer');
    const name = session.user.username;
    
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

function renderVendasList() {
    const data = getFilteredData();
    const search = (document.getElementById('searchVendas')?.value || '').toLowerCase();
    const container = document.getElementById('vendasCardList');
    container.innerHTML = '';

    const filtered = data.filter(i => `${i.cliente} ${i.cpf} ${i.numSolar} ${i.cidade}`.toLowerCase().includes(search));

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
                <div class="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600">
                    <span>Empresa: <strong class="text-slate-800">${i.empresa}</strong></span>
                    <span class="font-black text-slate-900">${i.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
            </div>
        `;
    });
}

function filterBranch(branch) {
    currentBranch = branch;
    document.querySelectorAll('.pill-btn').forEach(btn => {
        if (btn.textContent.includes(branch)) {
            btn.classList.add('pill-active');
            btn.classList.remove('bg-slate-100', 'text-slate-600');
        } else {
            btn.classList.remove('pill-active');
            btn.classList.add('bg-slate-100', 'text-slate-600');
        }
    });
    renderAll();
}

function switchTab(tab) {
    const dash = document.getElementById('viewDashboard');
    const vend = document.getElementById('viewVendas');
    const btnDash = document.getElementById('btnTabDashboard');
    const btnVend = document.getElementById('btnTabVendas');

    if (tab === 'dashboard') {
        dash.classList.remove('hidden');
        vend.classList.add('hidden');
        btnDash.classList.add('active');
        btnVend.classList.remove('active');
    } else {
        dash.classList.add('hidden');
        vend.classList.remove('hidden');
        btnDash.classList.remove('active');
        btnVend.classList.add('active');
    }
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}