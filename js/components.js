/**
 * Renderiza os componentes reutilizáveis nas divs correspondentes.
 * @param {Object} config - Configurações da página atual.
 * @param {boolean} [config.showBranches=true] - Exibe ou oculta os filtros de filial.
 */
function renderSharedComponents(config = { showBranches: true }) {
    renderHeader();
    if (config.showBranches) renderBranchFilter();
    renderTabs();
    if (window.lucide) lucide.createIcons();
}

/**
 * Topo da Aplicação (Logo, Nome do Usuário, Botão Sair)
 */
function renderHeader() {
    const el = document.getElementById('shared-header');
    if (!el) return;

    el.innerHTML = `
        <header class="bg-white border-b border-slate-100 sticky top-0 z-50">
            <div class="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                        V
                    </div>
                    <div>
                        <h1 class="text-xs font-black text-slate-900 tracking-tight leading-none">PAINEL DE VENDAS</h1>
                        <p class="text-[9px] font-bold text-slate-400 leading-none mt-0.5" id="usrName">Carregando...</p>
                    </div>
                </div>
                <button onclick="logout()" class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                </button>
            </div>
        </header>
    `;
}

/**
 * Filtro de Filiais/Empresas (Pills)
 */
function renderBranchFilter() {
    const el = document.getElementById('shared-branch-filter');
    if (!el) return;

    el.innerHTML = `
        <div class="flex gap-2 overflow-x-auto py-1 no-scrollbar text-xs font-black">
            <button onclick="filterBranch('TODOS')" class="pill-btn pill-active shrink-0 px-4 py-2 rounded-xl">TODOS</button>
            <button onclick="filterBranch('VNA')" class="pill-btn bg-slate-100 text-slate-600 shrink-0 px-4 py-2 rounded-xl">VNA</button>
            <button onclick="filterBranch('RDT')" class="pill-btn bg-slate-100 text-slate-600 shrink-0 px-4 py-2 rounded-xl">RDT</button>
        </div>
    `;
}

/**
 * Barra de Navegação Inferior (Tabs)
 */
function renderTabs() {
    const el = document.getElementById('shared-tabs');
    if (!el) return;

    el.innerHTML = `
        <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2 px-4 z-50">
            <div class="max-w-md mx-auto flex justify-around items-center">
                <button id="btnTabDashboard" onclick="switchTab('dashboard')" class="tab-btn active flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400">
                    <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                    <span>Dashboard</span>
                </button>
                <button id="btnTabVendas" onclick="switchTab('vendas')" class="tab-btn flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400">
                    <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                    <span>Vendas</span>
                </button>
                <button id="btnTabMetas" onclick="switchTab('metas')" class="tab-btn flex flex-col items-center gap-1 text-[10px] font-bold text-slate-400">
                    <i data-lucide="target" class="w-5 h-5"></i>
                    <span>Metas</span>
                </button>
            </div>
        </nav>
    `;
}