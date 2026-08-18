let session = JSON.parse(sessionStorage.getItem('userData'));
let currentBranch = 'TODOS';
let rawSales = [];

function renderStatusCards(vendasData) {
  const container = document.getElementById('status-cards-container');
  if (!container || !Array.isArray(vendasData)) return;

  // 1. Agrupamento e contagem dinâmica dos valores da coluna STATUS
  const statusCounts = {};

  vendasData.forEach(row => {
    const statusRaw = row.STATUS || row.status;
    if (!statusRaw) return;

    const statusName = statusRaw.toString().trim().toUpperCase();
    statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
  });

  // 2. Mapeamento visual para status conhecidos (cores e ícones)
  const themeMap = {
    'COM PENDENCIA': { color: '#f59e0b', icon: '⚠️', sub: 'Aguardando tratativa' },
    'AGUARD. INSTALACAO': { color: '#3b82f6', icon: '🔧', sub: 'Fila operacional' },
    'CONCLUIDAS': { color: '#10b981', icon: '✓', sub: 'Vendas concluídas' },
    'CANCELADAS': { color: '#ef4444', icon: '✕', sub: 'Vendas perdidas' }
  };

  // Paleta fallback para atribuir cores automaticamente a novos status
  const defaultColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
  let colorIndex = 0;

  // 3. Geração dinâmica dos Cards
  container.innerHTML = Object.entries(statusCounts).map(([status, count]) => {
    const theme = themeMap[status] || {
      color: defaultColors[colorIndex++ % defaultColors.length],
      icon: '📊',
      sub: status.toLowerCase()
    };

    return `
      <div class="status-card" style="border-left-color: ${theme.color};">
        <div class="status-card-header">
          <div class="status-icon-badge" style="background-color: ${theme.color}20; color: ${theme.color};">
            ${theme.icon}
          </div>
          <span class="status-title">${status}</span>
        </div>
        <div class="status-count">${count}</div>
        <div class="status-divider"></div>
        <div class="status-subtext">${theme.sub}</div>
      </div>
    `;
  }).join('');
}











/**
 * Inicializa a página validando a sessão e o perfil necessário.
 */
function initPage(requiredProfile, options = { showBranches: true }) {
    if (!session || (requiredProfile && session.user?.perfil !== requiredProfile)) {
        window.location.href = 'index.html';
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        // 1. Injeta o HTML compartilhado (Header, Filtros, Tabs)
        if (typeof renderSharedComponents === 'function') {
            renderSharedComponents(options);
        }

        // 2. Preenche os dados do usuário e carrega as vendas
        const usrEl = document.getElementById('usrName');
        if (usrEl) usrEl.textContent = session.user.username;
        
        rawSales = (session.sales || []).map(parseRow);
        renderAll();
    });
}

function getFilteredData() {
    return rawSales.filter(i => {
        if (currentBranch === 'TODOS') return true;
        return String(i.empresa || '').includes(currentBranch);
    });
}

function renderAll() {
    const data = getFilteredData();
    let virtua = 0, movel = 0, tv = 0, fone = 0, solar = 0, receita = 0;
    const sellerCounts = {};

    data.forEach(i => {
        if (i.virtua && i.virtua !== 'NÃO POSSUI' && i.virtua !== 'N/A' && i.virtua !== '0') virtua++;
        if (i.chip && i.chip !== 'NÃO POSSUI' && i.chip !== 'N/A' && i.chip !== '0') movel++;
        if (i.tv && i.tv !== 'NÃO POSSUI' && i.tv !== 'N/A' && i.tv !== '0') tv++;
        if (i.fone && i.fone !== 'NÃO POSSUI' && i.fone !== 'N/A' && i.fone !== '0') fone++;
        
        const valorSolar = String(i.solar || '').trim().toUpperCase();
        if (valorSolar === 'SIM' || valorSolar === 'S' || i.solar === true) {
            solar++;
        }

        receita += (Number(i.valor) || 0);

        if (i.vendedor) {
            const nomeVendedor = String(i.vendedor).trim().toUpperCase();
            sellerCounts[nomeVendedor] = (sellerCounts[nomeVendedor] || 0) + 1;
        }
    });

    // Atualização dos Cards
    if (document.getElementById('valVirtua')) document.getElementById('valVirtua').textContent = virtua;
    if (document.getElementById('valMovel')) document.getElementById('valMovel').textContent = movel;
    if (document.getElementById('valTV')) document.getElementById('valTV').textContent = tv;
    if (document.getElementById('valFone')) document.getElementById('valFone').textContent = fone;
    if (document.getElementById('valTotalContratos')) document.getElementById('valTotalContratos').textContent = data.length;
    if (document.getElementById('valSolarCount')) document.getElementById('valSolarCount').textContent = solar;
    if (document.getElementById('valReceita')) {
        document.getElementById('valReceita').textContent = receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // =========================================================
    // >>> ADICIONE APENAS ESTA LINHA AQUI DAQUI EM DIANTE <<<
    // =========================================================
    renderStatusCards(data); 

    if (typeof renderMetas === 'function') renderMetas();
    if (typeof renderRanking === 'function') renderRanking(sellerCounts, data.length);
    if (typeof renderVendasList === 'function') renderVendasList();

    if (window.lucide) lucide.createIcons();
}

function renderRanking(sellerCounts, totalVendas) {
    const container = document.getElementById('rankingContainer');
    if (!container) return;
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
    if (!container) return;
    container.innerHTML = '';

    const filtered = data.filter(i => `${i.cliente} ${i.vendedor} ${i.lider} ${i.cpf} ${i.numSolar} ${i.cidade}`.toLowerCase().includes(search));

    if (filtered.length === 0) {
        container.innerHTML = `<div class="bg-white p-6 rounded-2xl text-center text-xs font-bold text-slate-400">Nenhuma venda encontrada.</div>`;
        return;
    }

    filtered.forEach(i => {
        // 1. Monta apenas os PRODUTOS (sem o status misturado aqui)
        let prods = [];
        if (i.virtua && i.virtua !== "NÃO POSSUI" && i.virtua !== "N/A" && i.virtua !== "0") prods.push('VIRTUA');
        if (i.tv && i.tv !== "NÃO POSSUI" && i.tv !== "N/A" && i.tv !== "0") prods.push('TV');
        if (i.chip && i.chip !== "NÃO POSSUI" && i.chip !== "N/A" && i.chip !== "0") prods.push('MÓVEL');
        if (i.fone && i.fone !== "NÃO POSSUI" && i.fone !== "N/A" && i.fone !== "0") prods.push('FONE');

        // 2. Trata o STATUS separadamente para a Badge
        const rawStatus = i.status || i.STATUS || i.situação || i.SITUACAO || 'AGUARD. INSTALACAO';
        const statusText = rawStatus.toString().trim().toUpperCase();
        const badgeClass = getStatusBadgeClass(statusText);

        const dataCadastro = i.timestamp ? new Date(i.timestamp).toLocaleString('pt-BR') : 'Data N/I';
        const valorFormatado = (Number(i.valor) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        container.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2">
                <div class="flex justify-between items-start gap-2">
                    <div>
                        <h4 class="font-black text-sm text-slate-900 leading-tight">${i.cliente || 'Cliente não informado'}</h4>
                        <p class="text-[10px] font-bold text-slate-400 mt-0.5">
                            SOLAR: <span class="text-slate-700 font-black">${i.numSolar || '-'}</span> 
                            ${i.cpf ? `• CPF: <span class="text-slate-700">${i.cpf}</span>` : ''}
                        </p>
                    </div>

                    <!-- Badges no topo direito do card -->
                    <div class="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                        <!-- Tag do Produto -->
                        <span class="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-lg">${prods.join(' + ') || 'VENDA'}</span>
                        
                        <!-- Badge do Status separado -->
                        ${statusText ? `<span class="${badgeClass} text-[9px] font-black px-2 py-1 rounded-lg">${statusText}</span>` : ''}
                    </div>
                </div>

                <p class="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <i data-lucide="calendar" class="w-3 h-3"></i> Cadastrado em: <strong class="text-slate-600">${dataCadastro}</strong>
                </p>

                <div class="flex items-center justify-between text-[11px] font-semibold bg-slate-50 p-2 rounded-xl text-slate-600">
                    <span>Vend: <strong class="text-slate-800">${i.vendedor || 'N/A'}</strong> (Líder: ${i.lider || 'N/A'})</span>
                    <span class="font-black text-slate-900">${valorFormatado}</span>
                </div>
            </div>
        `;
    });

    if (window.lucide) lucide.createIcons();
}

function renderMetas() {
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

    const metasConfig = session?.metas || {
        diariaVendedor: 5, mensalVendedor: 100,
        diariaSupervisor: 20, mensalSupervisor: 200,
        diariaGeral: 50, mensalGeral: 600
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

    const pctDia = targetDia > 0 ? Math.min(Math.round((realizadoDia / targetDia) * 100), 100) : 0;
    const pctMes = targetMes > 0 ? Math.min(Math.round((realizadoMes / targetMes) * 100), 100) : 0;

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
    document.querySelectorAll('.pill-btn').forEach(btn => {
        if (btn.textContent.trim() === branch) {
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
    const metas = document.getElementById('viewMetas');

    const btnDash = document.getElementById('btnTabDashboard');
    const btnVend = document.getElementById('btnTabVendas');
    const btnMetas = document.getElementById('btnTabMetas');

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
        renderMetas();
    }
    if (window.lucide) lucide.createIcons();
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}

// Função/Trecho para formatar as cores da badge conforme o status
function getStatusBadgeClass(status) {
    const st = (status || '').toString().trim().toUpperCase();
    if (st === 'CONCLUIDAS') return 'bg-emerald-100 text-emerald-700';
    if (st === 'COM PENDENCIA') return 'bg-amber-100 text-amber-700';
    if (st === 'AGUARD. INSTALACAO') return 'bg-blue-100 text-blue-700';
    if (st === 'CANCELADAS') return 'bg-red-100 text-red-700';
    return 'bg-slate-100 text-slate-700'; // Padrão para outros status
}