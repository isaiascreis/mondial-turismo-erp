// modules/dashboard.js (versão robusta com guards de DOM e dados)
// Fonte original para correção: :contentReference[oaicite:0]{index=0}

const DashboardModule = {
  render: () => {
    return `
      <div class="header">
        <div class="header-body">
          <h1>Dashboard</h1>
        </div>
      </div>
      <div class="content-body">
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-plane-departure"></i> Operações da Semana</h3></div>
            <div class="card-body">
              <ul class="dashboard-list">
                <li><strong>Clientes viajando hoje:</strong> <span id="viajando-hoje" class="count">0</span><div id="viajando-hoje-nomes" class="names-list"></div></li>
                <li><strong>Clientes viajando em 2 dias:</strong> <span id="viajando-2dias" class="count">0</span><div id="viajando-2dias-nomes" class="names-list"></div></li>
                <li><strong>Clientes retornando hoje:</strong> <span id="retornando-hoje" class="count">0</span><div id="retornando-hoje-nomes" class="names-list"></div></li>
                <li><strong>Clientes retornando em 2 dias:</strong> <span id="retornando-2dias" class="count">0</span><div id="retornando-2dias-nomes" class="names-list"></div></li>
              </ul>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3><i class="fa-solid fa-ranking-star"></i> Ranking de Vendedores (Mês)</h3></div>
            <div class="card-body">
              <ol id="ranking-vendedores-list" class="dashboard-list ranking"></ol>
            </div>
          </div>
        </div>

        <div class="summary-cards-grid" style="margin-top: 2rem;">
          <div class="summary-card">
            <i class="fa-solid fa-calendar-day card-icon" style="color: #5e72e4;"></i>
            <span class="card-label">Vendas de Hoje</span>
            <span class="card-value" id="vendas-hoje-valor">R$ 0,00</span>
            <span class="card-detail"><span id="vendas-hoje-qtd">0</span> venda(s)</span>
          </div>
          <div class="summary-card">
            <i class="fa-solid fa-calendar-week card-icon" style="color: #2dce89;"></i>
            <span class="card-label">Vendas da Semana</span>
            <span class="card-value" id="vendas-semana-valor">R$ 0,00</span>
            <span class="card-detail"><span id="vendas-semana-qtd">0</span> venda(s)</span>
          </div>
          <div class="summary-card">
            <i class="fa-solid fa-calendar-alt card-icon" style="color: #11cdef;"></i>
            <span class="card-label">Vendas do Mês</span>
            <span class="card-value" id="vendas-mes-valor">R$ 0,00</span>
            <span class="card-detail"><span id="vendas-mes-qtd">0</span> venda(s)</span>
          </div>
        </div>
      </div>
    `;
  },

  init: async () => {
    // Helpers seguros de DOM
    const byId = (id) => document.getElementById(id);
    const safeText = (id, text) => {
      const el = byId(id);
      if (el) el.textContent = text;
      else console.debug(`[Dashboard] Ignorado: #${id} inexistente`);
    };
    const safeHTML = (id, html) => {
      const el = byId(id);
      if (el) el.innerHTML = html;
      else console.debug(`[Dashboard] Ignorado: #${id} inexistente`);
    };

    const formatCurrency = (value) =>
      Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    try {
      if (typeof firebase === 'undefined' || !firebase?.database) {
        console.warn('[Dashboard] Firebase indisponível.');
        return;
      }

      const vendasSnapshot = await firebase.database().ref('erp/vendas').get();
      if (!vendasSnapshot.exists()) {
        console.debug('[Dashboard] Nenhuma venda encontrada.');
        // Zera UI de forma segura
        [
          'viajando-hoje','viajando-2dias','retornando-hoje','retornando-2dias',
          'vendas-hoje-qtd','vendas-semana-qtd','vendas-mes-qtd'
        ].forEach(id => safeText(id, '0'));
        [
          'viajando-hoje-nomes','viajando-2dias-nomes','retornando-hoje-nomes','retornando-2dias-nomes'
        ].forEach(id => safeHTML(id, ''));
        safeText('vendas-hoje-valor', formatCurrency(0));
        safeText('vendas-semana-valor', formatCurrency(0));
        safeText('vendas-mes-valor', formatCurrency(0));
        const rankingList = byId('ranking-vendedores-list');
        if (rankingList) rankingList.innerHTML = '';
        return;
      }

      const vendas = vendasSnapshot.val() || {};

      // --- Datas base ---
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const twoDaysFromNow = new Date(today);
      twoDaysFromNow.setDate(today.getDate() + 2);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // --- Acumuladores ---
      let viajandoHojeNomes = [], viajando2DiasNomes = [], retornandoHojeNomes = [], retornando2DiasNomes = [];
      let vendasHojeQtd = 0, vendasHojeValor = 0;
      let vendasSemanaQtd = 0, vendasSemanaValor = 0;
      let vendasMesQtd = 0, vendasMesValor = 0;
      const ranking = {};

      // --- Processamento ---
      for (const vendaId in vendas) {
        const venda = vendas[vendaId] || {};

        // 1) Operações de viagem
        const periodo = venda.periodoViagem && String(venda.periodoViagem);
        if (periodo && periodo.includes(' a ')) {
          const [inicioStr, fimStr] = periodo.split(' a ');
          if (inicioStr) {
            const [dI, mI, aI] = String(inicioStr).split('/');
            const dataInicio = new Date(`${aI}-${mI}-${dI}T00:00:00`);
            if (!isNaN(dataInicio)) {
              if (dataInicio.getTime() === today.getTime()) viajandoHojeNomes.push(venda.clienteNome || 'Cliente');
              if (dataInicio.getTime() === twoDaysFromNow.getTime()) viajando2DiasNomes.push(venda.clienteNome || 'Cliente');
            }
          }
          if (fimStr) {
            const [dF, mF, aF] = String(fimStr).split('/');
            const dataFim = new Date(`${aF}-${mF}-${dF}T00:00:00`);
            if (!isNaN(dataFim)) {
              if (dataFim.getTime() === today.getTime()) retornandoHojeNomes.push(venda.clienteNome || 'Cliente');
              if (dataFim.getTime() === twoDaysFromNow.getTime()) retornando2DiasNomes.push(venda.clienteNome || 'Cliente');
            }
          }
        }

        // 2) Métricas de vendas (tolerante a dados ausentes)
        const valor = Number(venda.valorTotal || 0);
        const dataVendaStr = venda.dataVenda ? `${venda.dataVenda}T00:00:00` : null;
        const dataVenda = dataVendaStr ? new Date(dataVendaStr) : null;

        if (dataVenda && !isNaN(dataVenda)) {
          if (dataVenda >= startOfMonth) {
            vendasMesQtd++;
            vendasMesValor += valor;

            const vendedor = venda.vendedorPrincipalNome || 'Não atribuído';
            ranking[vendedor] = (ranking[vendedor] || 0) + valor;
          }
          if (dataVenda >= startOfWeek) {
            vendasSemanaQtd++;
            vendasSemanaValor += valor;
          }
          if (dataVenda.getTime() === today.getTime()) {
            vendasHojeQtd++;
            vendasHojeValor += valor;
          }
        }
      }

      // --- Atualização do DOM (segura) ---
      safeText('viajando-hoje', String(viajandoHojeNomes.length));
      safeHTML('viajando-hoje-nomes', viajandoHojeNomes.join(', '));
      safeText('viajando-2dias', String(viajando2DiasNomes.length));
      safeHTML('viajando-2dias-nomes', viajando2DiasNomes.join(', '));
      safeText('retornando-hoje', String(retornandoHojeNomes.length));
      safeHTML('retornando-hoje-nomes', retornandoHojeNomes.join(', '));
      safeText('retornando-2dias', String(retornando2DiasNomes.length));
      safeHTML('retornando-2dias-nomes', retornando2DiasNomes.join(', '));

      safeText('vendas-hoje-qtd', String(vendasHojeQtd));
      safeText('vendas-hoje-valor', formatCurrency(vendasHojeValor));
      safeText('vendas-semana-qtd', String(vendasSemanaQtd));
      safeText('vendas-semana-valor', formatCurrency(vendasSemanaValor));
      safeText('vendas-mes-qtd', String(vendasMesQtd));
      safeText('vendas-mes-valor', formatCurrency(vendasMesValor));

      const rankingList = byId('ranking-vendedores-list');
      if (rankingList) {
        rankingList.innerHTML = '';
        Object.entries(ranking)
          .sort(([, a], [, b]) => b - a)
          .forEach(([nome, valor]) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${nome}</span> <strong>${formatCurrency(valor)}</strong>`;
            rankingList.appendChild(li);
          });
      } else {
        console.debug('[Dashboard] Ignorado: #ranking-vendedores-list inexistente');
      }

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }
};
