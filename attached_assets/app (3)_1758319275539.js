// app.js (robusto: usa o Registry, lazy DOM, hash routing, guards, e sem /mondial/undefined)

// ===== Proteção simples contra /mondial/undefined (leve) =====
(() => {
  const BAD = /\/mondial\/undefined/i;
  if (BAD.test(location.href)) {
    console.warn('[Guard] Corrigindo URL inválida /mondial/undefined → #dashboard');
    history.replaceState(null, '', location.pathname + '#dashboard');
  }

  // Bloqueia cliques que levariam a /mondial/undefined
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (BAD.test(href)) {
      e.preventDefault();
      console.warn('[Guard] Bloqueada navegação para URL inválida:', href);
    }
  }, true);
})();

// ===== Página padrão =====
const DEFAULT_PAGE = 'dashboard';

// --- App ---
const App = {
  // CORREÇÃO: Usa o registo global preenchido pelo script no index.html.
  // Isto resolve os erros de "módulo não encontrado" causados pelo tempo de carregamento.
  modules: window.Modules || {},

  // (serão preenchidos no init)
  mainContent: null,
  navLinks: null,
  notificationBar: null,
  appLayout: null,
  sidebarToggleBtn: null,

  // Notificações semanais (código original mantido)
  checkNotifications: async () => {
    try {
      if (typeof firebase === 'undefined' || !firebase?.database) return;
      const vendasSnapshot = await firebase.database().ref('erp/vendas').get();
      if (!vendasSnapshot.exists()) return;

      const vendas = vendasSnapshot.val();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Início da semana (segunda) e fim (domingo)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(
        today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)
      );
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      let pedidosDaSemana = 0;
      let checkinsDaSemana = 0;
      let checkoutsDaSemana = 0;

      for (const vendaId in vendas) {
        const venda = vendas[vendaId];

        if (Array.isArray(venda?.pedidos)) {
          venda.pedidos.forEach((pedido) => {
            if (!pedido?.dataExecucao) return;
            const dataPedido = new Date(pedido.dataExecucao + 'T00:00:00');
            if (dataPedido >= startOfWeek && dataPedido <= endOfWeek) {
              pedidosDaSemana++;
            }
          });
        }

        if (Array.isArray(venda?.servicos)) {
          venda.servicos.forEach((servico) => {
            if (servico?.tipo === 'hotel' && servico?.periodo) {
              const [inicio, fim] = String(servico.periodo).split(' a ');
              if (inicio) {
                const [dI, mI, aI] = inicio.split('/');
                const dataCheckin = new Date(`${aI}-${mI}-${dI}T00:00:00`);
                if (dataCheckin >= startOfWeek && dataCheckin <= endOfWeek) {
                  checkinsDaSemana++;
                }
              }
              if (fim) {
                const [dF, mF, aF] = fim.split('/');
                const dataCheckout = new Date(`${aF}-${mF}-${dF}T00:00:00`);
                if (dataCheckout >= startOfWeek && dataCheckout <= endOfWeek) {
                  checkoutsDaSemana++;
                }
              }
            }
          });
        }
      }

      const notifications = [];
      if (pedidosDaSemana > 0)
        notifications.push(`${pedidosDaSemana} pedido(s) especial(is)`);
      if (checkinsDaSemana > 0)
        notifications.push(`${checkinsDaSemana} check-in(s)`);
      if (checkoutsDaSemana > 0)
        notifications.push(`${checkoutsDaSemana} check-out(s)`);

      if (notifications.length > 0 && App.notificationBar) {
        const notificationText = `Lembretes para esta semana: ${notifications.join(', ')}.`;
        const textEl = App.notificationBar.querySelector('#notification-text');
        if (textEl) textEl.textContent = notificationText;
        App.notificationBar.classList.remove('hidden');
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    }
  },

  // Navegação (código original mantido, mas agora usa o Registry)
  navigate: (moduleName = DEFAULT_PAGE, params = null) => {
    moduleName = (moduleName || DEFAULT_PAGE).trim();
    if (!moduleName || /undefined/i.test(moduleName)) moduleName = DEFAULT_PAGE;
    
    if (!App.mainContent) App.mainContent = document.querySelector('.main-content');
    if (!App.appLayout) App.appLayout = document.querySelector('.app-layout');
    if (!App.sidebarToggleBtn) App.sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

    if (!App.mainContent) {
      console.error('[App] .main-content não encontrado. Verifique o HTML.');
      return;
    }

    const module = App.modules[moduleName];
    if (!module) {
      console.warn(`Módulo '${moduleName}' não encontrado. Carregando ${DEFAULT_PAGE}.`);
      if (moduleName !== DEFAULT_PAGE) return App.navigate(DEFAULT_PAGE);
      App.mainContent.innerHTML = `<div class="card"><div class="card-body"><p>Não foi possível carregar o módulo <strong>${moduleName}</strong>.</p></div></div>`;
      return;
    }

    if (location.hash.slice(1) !== moduleName) {
      history.replaceState(null, '', `#${moduleName}`);
    }

    if (moduleName === 'whatsapp') {
      App.appLayout?.classList.add('whatsapp-active');
      App.sidebarToggleBtn?.classList.remove('hidden');
      setTimeout(() => App.sidebarToggleBtn?.classList.add('visible'), 50);
    } else {
      App.appLayout?.classList.remove('whatsapp-active');
      App.sidebarToggleBtn?.classList.remove('visible');
      App.appLayout?.classList.remove('sidebar-collapsed');
    }

    try {
      App.mainContent.innerHTML = module.render();
    } catch (e) {
      console.error(`[App] Erro no render() de ${moduleName}:`, e);
      App.mainContent.innerHTML = `<div class="card"><div class="card-body"><p>Erro ao renderizar <strong>${moduleName}</strong>.</p></div></div>`;
      return;
    }

    try {
      if (typeof module.init === 'function') {
        module.init(params);
      }
    } catch (e) {
      console.error(`[App] Erro no init() de ${moduleName}:`, e);
    }

    App.updateActiveNav(moduleName);
  },

  // MELHORIA: Mantém o menu "Configurações" ativo quando numa das suas sub-páginas.
  updateActiveNav: (moduleName) => {
    if (!App.navLinks) return;

    // Mapeia qual módulo principal deve ser destacado para cada sub-página
    const parentMap = {
        'clientes': 'configuracoes',
        'clientesForm': 'configuracoes',
        'fornecedores': 'configuracoes',
        'fornecedoresForm': 'configuracoes',
        'planoContas': 'configuracoes',
        'contasBancarias': 'configuracoes',
        'contasBancariasForm': 'configuracoes',
        'vendasForm': 'vendas',
        'financeiroForm': 'financeiro',
        'extratoBancario': 'financeiro'
    };

    const highlightModule = parentMap[moduleName] || moduleName;

    App.navLinks.forEach((link) => {
      const linkModule = link.dataset.module || link.dataset.page;
      link.classList.toggle('active', linkModule === highlightModule);
    });
  },

  // Init (código original mantido)
  init: () => {
    App.mainContent = document.querySelector('.main-content');
    App.navLinks = document.querySelectorAll('.nav-item, a[data-page], a[data-module]');
    App.notificationBar = document.getElementById('global-notification-bar');
    App.appLayout = document.querySelector('.app-layout');
    App.sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');

    if (!App.mainContent) {
      console.error('[App] .main-content não encontrado. Verifique se existe <div class="main-content"> no HTML.');
    }

    document
      .getElementById('close-notification-bar')
      ?.addEventListener('click', () => {
        App.notificationBar?.classList.add('hidden');
      });

    App.sidebarToggleBtn?.addEventListener('click', () => {
      App.appLayout?.classList.toggle('sidebar-collapsed');
    });

    App.navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetModule = link.dataset.module || link.dataset.page || DEFAULT_PAGE;
        App.navigate(targetModule);
      });
    });

    const initial = (location.hash ? location.hash.slice(1) : '') || DEFAULT_PAGE;
    App.navigate(initial);

    App.checkNotifications();
  },
};

// Expor API de navegação (código original mantido)
window.App = App;
window.navigate = (page) => App.navigate(page || DEFAULT_PAGE);

// Bootstrap
document.addEventListener('DOMContentLoaded', App.init);

// Captura mudanças de hash externas (código original mantido)
window.addEventListener('hashchange', () => {
  const page = (location.hash ? location.hash.slice(1) : '') || DEFAULT_PAGE;
  App.navigate(page);
});