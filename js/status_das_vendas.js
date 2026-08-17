        lucide.createIcons();

        // Função responsável por agrupar os status da coluna "STATUS"
        function renderStatusCards(vendas) {
            const container = document.getElementById('status-cards-container');
            if (!container || !Array.isArray(vendas) || vendas.length === 0) return;

            // 1. Agrupa e conta os registros dinamicamente por status
            const statusCounts = {};
            vendas.forEach(item => {
                const status = (item.STATUS || item.status || 'OUTROS').toString().trim().toUpperCase();
                statusCounts[status] = (statusCounts[status] || 0) + 1;
            });

            // 2. Mapeamento visual para status conhecidos (Cores e Ícones)
            const mapTema = {
                'COM PENDENCIA': { cor: '#f59e0b', icone: 'alert-circle', sub: 'Aguardando tratativa' },
                'AGUARD. INSTALACAO': { cor: '#3b82f6', icone: 'wrench', sub: 'Fila operacional' },
                'CONCLUIDAS': { cor: '#10b981', icone: 'check-circle-2', sub: 'Vendas concluídas' },
                'CANCELADAS': { cor: '#ef4444', icone: 'x-circle', sub: 'Vendas perdidas' }
            };

            // Paleta de cores para novos status que surgirem na planilha
            const coresExtras = ['#8b5cf6', '#ec4899', '#06b6d4', '#64748b', '#14b8a6'];
            let indexCor = 0;

            // 3. Monta o HTML dinâmico
            container.innerHTML = Object.entries(statusCounts).map(([nomeStatus, total]) => {
                const tema = mapTema[nomeStatus] || {
                    cor: coresExtras[indexCor++ % coresExtras.length],
                    icone: 'bar-chart-2',
                    sub: nomeStatus.toLowerCase()
                };

                return `
                    <div class="status-card" style="border-left-color: ${tema.cor};">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-[10px] font-black uppercase text-slate-500 tracking-wider">${nomeStatus}</span>
                            <div class="w-6 h-6 rounded-lg flex items-center justify-center" style="background-color: ${tema.cor}20; color: ${tema.cor};">
                                <i data-lucide="${tema.icone}" class="w-3.5 h-3.5"></i>
                            </div>
                        </div>
                        <div class="text-2xl font-black text-slate-900 my-1">${total}</div>
                        <div class="border-t border-slate-100 pt-2 mt-2 text-[10px] font-semibold text-slate-400">
                            ${tema.sub}
                        </div>
                    </div>
                `;
            }).join('');

            // Recria os ícones do Lucide nos novos cards gerados
            if (window.lucide) lucide.createIcons();
        }

        // Executa automaticamente ao carregar a página lendo as vendas salvas na sessão
        document.addEventListener('DOMContentLoaded', () => {
            const session = JSON.parse(sessionStorage.getItem('userData') || '{}');
            const listaVendas = session.sales || window.rawSales || [];
            
            if (listaVendas.length > 0) {
                renderStatusCards(listaVendas);
            }
        });
  