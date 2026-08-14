function getFilteredData() {
    return rawSales.filter(i => {
        if (currentBranch === 'TODOS') return true;
        return i.empresa.includes(currentBranch);
    });
}

function renderAll() {
    // Puxa as vendas já filtradas pela filial ativa (TODOS, VNA ou RDT)
    const data = getFilteredData();
    
    let virtua = 0, movel = 0, tv = 0, fone = 0, solar = 0, receita = 0;
    const sellerCounts = {};

    data.forEach(i => {
        if (i.virtua) virtua++;
        if (i.chip) movel++;
        if (i.tv) tv++;
        if (i.fone) fone++;
        
        // Checagem segura do Solar (evita erro de toUpperCase em valores nulos/undefined)
        const valorSolar = String(i.solar || '').trim().toUpperCase();
        if (valorSolar === 'SIM' || valorSolar === 'S' || i.solar === true) {
            solar++;
        }

        // Soma da receita tratando conversão de números
        receita += (Number(i.valor) || 0);

        // Agrupamento por Vendedor para o Ranking
        if (i.vendedor) {
            const nomeVendedor = String(i.vendedor).trim().toUpperCase();
            sellerCounts[nomeVendedor] = (sellerCounts[nomeVendedor] || 0) + 1;
        }
    });

    // Atualização dos Cards da Dashboard
    if (document.getElementById('valVirtua')) document.getElementById('valVirtua').textContent = virtua;
    if (document.getElementById('valMovel')) document.getElementById('valMovel').textContent = movel;
    if (document.getElementById('valTV')) document.getElementById('valTV').textContent = tv;
    if (document.getElementById('valFone')) document.getElementById('valFone').textContent = fone;
    if (document.getElementById('valTotalContratos')) document.getElementById('valTotalContratos').textContent = data.length;
    if (document.getElementById('valSolarCount')) document.getElementById('valSolarCount').textContent = solar;
    if (document.getElementById('valReceita')) {
        document.getElementById('valReceita').textContent = receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Renderiza as outras seções com base na filial selecionada
    if (typeof renderMetas === 'function') renderMetas();
    if (typeof renderRanking === 'function') renderRanking(sellerCounts);
    if (typeof renderVendasList === 'function') renderVendasList();

    // Atualiza os ícones do Lucide
    if (window.lucide) lucide.createIcons();
}
function renderRanking(sellerCounts) {
    const container = document.getElementById('rankingContainer');
    container.innerHTML = '';

    const sorted = Object.entries(sellerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxVal = sorted[0]?.[1] || 1;

    if (sorted.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-2">Sem vendas no período.</p>`;
        return;
    }

    sorted.forEach(([vendedor, count], idx) => {
        container.innerHTML += `
            <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1">
                    <span class="w-6 h-6 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center">${idx + 1}</span>
                    <div class="flex-1">
                        <p class="text-xs font-black text-slate-800">${vendedor}</p>
                        <div class="w-full bg-slate-100 h-1.5 rounded-full mt-1">
                            <div class="bg-red-500 h-1.5 rounded-full" style="width: ${(count / maxVal) * 100}%"></div>
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
function renderMetas() {
    // IMPORTANTE: Usa apenas as vendas da filial filtrada!
    const data = getFilteredData(); 

    const hoje = new Date();
    const diaHoje = hoje.getDate();
    const mesHoje = hoje.getMonth();
    const anoHoje = hoje.getFullYear();

    let realizadoDia = 0;
    let realizadoMes = 0;

    data.forEach(i => {
        if (!i.timestamp) return;

        let dt = new Date(i.timestamp);
        if (isNaN(dt.getTime()) && typeof i.timestamp === 'string') {
            const partes = i.timestamp.split(' ')[0].split('/');
            if (partes.length === 3) {
                dt = new Date(partes[2], partes[1] - 1, partes[0]);
            }
        }

        if (!isNaN(dt.getTime())) {
            if (dt.getMonth() === mesHoje && dt.getFullYear() === anoHoje) {
                realizadoMes++;
                if (dt.getDate() === diaHoje) {
                    realizadoDia++;
                }
            }
        }
    });

    // Busca das metas do perfil
    const metasConfig = session?.metas || {
        diariaVendedor: 5, mensalVendedor: 100,
        diariaSupervisor: 20, mensalSupervisor: 400,
        diariaGeral: 50, mensalGeral: 1000
    };

    let targetDia = metasConfig.diariaGeral;
    let targetMes = metasConfig.mensalGeral;

    if (session?.user?.perfil === 'VENDEDOR') {
        targetDia = metasConfig.diariaVendedor;
        targetMes = metasConfig.mensalVendedor;
    } else if (session?.user?.perfil === 'SUPERVISOR') {
        targetDia = metasConfig.diariaSupervisor;
        targetMes = metasConfig.mensalSupervisor;
    }

    // Porcentagens
    const pctDia = targetDia > 0 ? Math.min(Math.round((realizadoDia / targetDia) * 100), 100) : 0;
    const pctMes = targetMes > 0 ? Math.min(Math.round((realizadoMes / targetMes) * 100), 100) : 0;

    // Atualiza os textos na tela
    const elTxtDia = document.getElementById('txtMetaDia');
    const elBarDia = document.getElementById('barMetaDia');
    const elPctDia = document.getElementById('pctMetaDia');

    const elTxtMes = document.getElementById('txtMetaMes');
    const elBarMes = document.getElementById('barMetaMes');
    const elPctMes = document.getElementById('pctMetaMes');

    if (elTxtDia) elTxtDia.textContent = `${realizadoDia} / ${targetDia}`;
    if (elBarDia) elBarDia.style.width = `${pctDia}%`;
    if (elPctDia) elPctDia.textContent = `${pctDia}% atingido`;

    if (elTxtMes) elTxtMes.textContent = `${realizadoMes} / ${targetMes}`;
    if (elBarMes) elBarMes.style.width = `${pctMes}%`;
    if (elPctMes) elPctMes.textContent = `${pctMes}% atingido`;
}
 function filterBranch(branch) {
    currentBranch = branch;

    // Estiliza o botão ativo
    document.querySelectorAll('.pill-btn').forEach(btn => {
        if (btn.textContent.trim() === branch) {
            btn.classList.add('pill-active');
            btn.classList.remove('bg-slate-100', 'text-slate-600');
        } else {
            btn.classList.remove('pill-active');
            btn.classList.add('bg-slate-100', 'text-slate-600');
        }
    });

    // Recalcula tudo (Dashboard, Lista de Vendas e Metas) com base na nova filial
    renderAll();
}
 function switchTab(tab) {
    const dash = document.getElementById('viewDashboard');
    const vend = document.getElementById('viewVendas');
    const metas = document.getElementById('viewMetas');

    const btnDash = document.getElementById('btnTabDashboard');
    const btnVend = document.getElementById('btnTabVendas');
    const btnMetas = document.getElementById('btnTabMetas');

    // Oculta todas
    dash?.classList.add('hidden');
    vend?.classList.add('hidden');
    metas?.classList.add('hidden');

    btnDash?.classList.remove('active');
    btnVend?.classList.remove('active');
    btnMetas?.classList.remove('active');

    if (tab === 'dashboard') {
        dash?.classList.remove('hidden');
        btnDash?.classList.add('active');
    } else if (tab === 'vendas') {
        vend?.classList.remove('hidden');
        btnVend?.classList.add('active');
    } else if (tab === 'metas') {
        metas?.classList.remove('hidden');
        btnMetas?.classList.add('active');
        renderMetas(); // Carrega os cálculos das metas
    }
    lucide.createIcons();
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}