// ESTADO DA APLICAÇÃO
let rawData = [];
let currentUser = null;
let currentBranch = 'TODOS';

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// EVENTOS DE AUTENTICAÇÃO
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('inputUser').value.trim();
    const password = document.getElementById('inputPass').value.trim();
    const btnSubmit = document.getElementById('btnLoginSubmit');
    const errorDiv = document.getElementById('loginError');

    errorDiv.classList.add('hidden');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Autenticando...`;
    lucide.createIcons();

    try {
        const result = await loginApi(username, password);

        if (result.success) {
            currentUser = result.user;
            rawData = result.sales.map(parseRow);

            document.getElementById('viewLogin').classList.add('hidden');
            document.getElementById('appContent').classList.remove('hidden');
            document.getElementById('headerUserName').textContent = currentUser.username;
            document.getElementById('headerUserRole').textContent = currentUser.perfil;

            renderAll();
        } else {
            errorDiv.textContent = result.message || 'Erro ao realizar login.';
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
        errorDiv.textContent = 'Erro de conexão com o servidor. Verifique a API_URL no arquivo js/api.js.';
        errorDiv.classList.remove('hidden');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Entrar no Painel</span><i data-lucide="arrow-right" class="w-4 h-4"></i>`;
        lucide.createIcons();
    }
}

function logout() {
    currentUser = null;
    rawData = [];
    document.getElementById('loginForm').reset();
    document.getElementById('appContent').classList.add('hidden');
    document.getElementById('viewLogin').classList.remove('hidden');
}

// NAVEGAÇÃO E FILTROS
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

function filterBranch(branch) {
    currentBranch = branch;
    document.querySelectorAll('.pill-btn').forEach(btn => {
        if (btn.textContent.toUpperCase().includes(branch)) {
            btn.classList.add('pill-active');
            btn.classList.remove('bg-slate-100', 'text-slate-600');
        } else {
            btn.classList.remove('pill-active');
            btn.classList.add('bg-slate-100', 'text-slate-600');
        }
    });
    renderAll();
}