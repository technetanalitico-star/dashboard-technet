
// js/footer.js

function renderFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) return;

    footerContainer.innerHTML = `
        <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 z-50">
            <div class="max-w-md mx-auto flex justify-between items-center relative">
                <button onclick="switchTab('dashboard')" id="btnTabDashboard" class="tab-btn active flex flex-col items-center gap-1 text-slate-400">
                    <i data-lucide="layout-grid" class="w-5 h-5"></i>
                    <span class="text-[10px]">Dashboard</span>
                </button>
                
                <button onclick="switchTab('vendas')" id="btnTabVendas" class="tab-btn flex flex-col items-center gap-1 text-slate-400">
                    <i data-lucide="file-text" class="w-5 h-5"></i>
                    <span class="text-[10px]">Vendas</span>
                </button>
                
                <button class="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/40 -mt-6 active:scale-95 transition-transform">
                    <i data-lucide="plus" class="w-6 h-6"></i>
                </button>

                <button onclick="switchTab('metas')" id="btnTabMetas" class="tab-btn flex flex-col items-center gap-1 text-slate-400">
                    <i data-lucide="trophy" class="w-5 h-5"></i>
                    <span class="text-[10px]">Metas</span>
                </button>

                <button onclick="logout()" class="tab-btn flex flex-col items-center gap-1 text-slate-400">
                    <i data-lucide="log-out" class="w-5 h-5"></i>
                    <span class="text-[10px]">Sair</span>
                </button>
            </div>
        </nav>
    `;

    // Renderiza os ícones do Lucide
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Executa assim que a página carregar
document.addEventListener('DOMContentLoaded', renderFooter);