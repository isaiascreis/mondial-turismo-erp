// modules/financeiro.js (Versão Unificada: Filtros + Valor em Aberto + Liquidação + Proteção Duplo Clique)

const FinanceiroModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body">
                    <h1>Contas a Pagar e Receber</h1>
                    <div>
                        <button id="contas-bancarias-btn" class="secondary-button" style="margin-right: 1rem;">
                            <i class="fa-solid fa-building-columns"></i> Contas Bancárias
                        </button>
                        <button id="plano-contas-btn" class="secondary-button" style="margin-right: 1rem;">
                            <i class="fa-solid fa-sitemap"></i> Plano de Contas
                        </button>
                        <button id="nova-transacao-btn" class="primary-button">
                            <i class="fa-solid fa-plus"></i> Novo Lançamento
                        </button>
                    </div>
                </div>
            </div>

            <div class="content-body">
                <!-- Card de Filtros (layout preservado; lógica opcional) -->
                <div class="card">
                    <div class="card-header"><h3>Filtros</h3></div>
                    <div class="card-body">
                        <div class="filters-container">
                            <input id="filtro-descricao" type="text" placeholder="Filtrar por descrição...">
                            <select id="filtro-tipo">
                                <option value="">Todos os Tipos</option>
                                <option value="pagar">A Pagar</option>
                                <option value="receber">A Receber</option>
                            </select>
                            <select id="filtro-status">
                                <option value="">Todos os Status</option>
                                <option value="Pendente">Pendente</option>
                                <option value="Parcial">Parcial</option>
                                <option value="Liquidado">Liquidado</option>
                            </select>
                            <button id="filtro-limpar-btn">Limpar</button>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card-header"><h3>Lançamentos</h3></div>
                    <div class="card-body table-responsive">
                        <table class="sales-table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Valor em Aberto</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="financeiro-list-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        // Botões topo
        const novaTransacaoButton   = document.getElementById('nova-transacao-btn');
        const planoContasButton     = document.getElementById('plano-contas-btn');
        const contasBancariasButton = document.getElementById('contas-bancarias-btn');

        // Tabela
        const listBody = document.getElementById('financeiro-list-body');

        // Modal de Liquidação (deve existir no index.html)
        const liquidacaoModal = document.getElementById('liquidacao-modal');

        // Formatação
        const formatCurrency = (value) =>
            (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Estado local
        let allLancamentos = {};
        let allContasBancarias = {};

        // Filtros (sem lógica complexa — opcional adicionar)
        const filtroDescricao = document.getElementById('filtro-descricao');
        const filtroTipo      = document.getElementById('filtro-tipo');
        const filtroStatus    = document.getElementById('filtro-status');
        const filtroLimparBtn = document.getElementById('filtro-limpar-btn');

        const passaNosFiltros = (l) => {
            const descOK  = !filtroDescricao.value || (l.descricao || '').toLowerCase().includes(filtroDescricao.value.toLowerCase());
            const tipoOK  = !filtroTipo.value   || (l.tipo === filtroTipo.value);
            const statOK  = !filtroStatus.value || (l.status === filtroStatus.value);
            return descOK && tipoOK && statOK;
        };

        const renderList = (lancamentos) => {
            allLancamentos = lancamentos || {};
            listBody.innerHTML = '';

            const ids = Object.keys(allLancamentos);
            if (ids.length === 0) {
                listBody.innerHTML = '<tr><td colspan="5">Nenhum lançamento encontrado.</td></tr>';
                return;
            }

            ids.forEach((id) => {
                const data = allLancamentos[id] || {};
                if (!passaNosFiltros(data)) return;

                const status = data.status || '';
                const baseAberto = (data.valorAberto ?? data.valor) || 0;
                const valorExibir = status === 'Liquidado' ? 0 : baseAberto;
                const dataFormatada = data.vencimento
                    ? new Date(data.vencimento + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '';
                const isPendente = status === 'Pendente' || status === 'Parcial';

                const row = `
                    <tr>
                        <td>${data.descricao || ''}</td>
                        <td>${formatCurrency(valorExibir)}</td>
                        <td>${dataFormatada}</td>
                        <td><span class="status ${String(status).toLowerCase()}">${status}</span></td>
                        <td>
                            ${isPendente ? `
                                <button class="action-button liquidar-btn" data-id="${id}" title="Liquidar Lançamento">
                                    <i class="fa-solid fa-check-double"></i>
                                </button>` : ''
                            }
                            <button class="action-button edit-lancamento-btn" data-id="${id}" title="Editar">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="action-button delete-lancamento-btn" data-id="${id}" title="Excluir">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                listBody.insertAdjacentHTML('beforeend', row);
            });

            // Caso todos tenham sido filtrados
            if (!listBody.children.length) {
                listBody.innerHTML = '<tr><td colspan="5">Nenhum lançamento corresponde aos filtros.</td></tr>';
            }
        };

        // Navegação topo
        novaTransacaoButton.addEventListener('click', () => App.navigate('financeiroForm'));
        planoContasButton.addEventListener('click', () => App.navigate('planoContas'));
        contasBancariasButton.addEventListener('click', () => App.navigate('contasBancarias'));

        // Ações de filtro (re-render local)
        const reRender = () => renderList(allLancamentos);
        if (filtroDescricao) filtroDescricao.addEventListener('input', reRender);
        if (filtroTipo)      filtroTipo.addEventListener('change', reRender);
        if (filtroStatus)    filtroStatus.addEventListener('change', reRender);
        if (filtroLimparBtn) filtroLimparBtn.addEventListener('click', () => {
            if (filtroDescricao) filtroDescricao.value = '';
            if (filtroTipo) filtroTipo.value = '';
            if (filtroStatus) filtroStatus.value = '';
            reRender();
        });

        // Delegação de eventos da tabela
        listBody.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.action-button');
            if (!targetButton) return;

            const id = targetButton.dataset.id;

            // Editar
            if (targetButton.classList.contains('edit-lancamento-btn')) {
                App.navigate('financeiroForm', id);
                return;
            }

            // Excluir
            if (targetButton.classList.contains('delete-lancamento-btn')) {
                if (confirm('Tem certeza que deseja excluir este lançamento?')) {
                    FirebaseService.excluirLancamento(id).catch(() => alert('Erro ao excluir.'));
                }
                return;
            }

            // Liquidar (abrir modal)
            if (targetButton.classList.contains('liquidar-btn')) {
                if (!liquidacaoModal) {
                    alert('Modal de liquidação não encontrado no HTML.');
                    return;
                }
                const lancamento = allLancamentos[id];
                if (!lancamento) return;

                const valorAberto = (lancamento.valorAberto ?? lancamento.valor) || 0;

                liquidacaoModal.querySelector('#liquidacao-descricao').textContent = lancamento.descricao || '';
                liquidacaoModal.querySelector('#liquidacao-valor-aberto').textContent = formatCurrency(valorAberto);

                const valorInput = liquidacaoModal.querySelector('#liquidacao-valor');
                valorInput.value = valorAberto.toFixed(2);
                valorInput.max   = valorAberto.toFixed(2); // evita pagar acima do devido

                liquidacaoModal.querySelector('#liquidacao-data').value = new Date().toISOString().split('T')[0];

                const contaSelect = liquidacaoModal.querySelector('#liquidacao-conta');
                contaSelect.innerHTML = '<option value="">Selecione uma conta...</option>';
                Object.keys(allContasBancarias).forEach((contaId) => {
                    const conta = allContasBancarias[contaId] || {};
                    contaSelect.innerHTML += `<option value="${contaId}">${conta.nome || '(sem nome)'}</option>`;
                });

                liquidacaoModal.dataset.lancamentoId = id;
                liquidacaoModal.classList.remove('hidden');
            }
        });

        // Controles do modal de liquidação (com proteção contra clique duplo)
        if (liquidacaoModal) {
            const closeBtn   = liquidacaoModal.querySelector('#close-liquidacao-modal-btn');
            const confirmBtn = liquidacaoModal.querySelector('#confirmar-liquidacao-btn');

            closeBtn.addEventListener('click', () => liquidacaoModal.classList.add('hidden'));

            confirmBtn.addEventListener('click', async () => {
                const lancamentoId    = liquidacaoModal.dataset.lancamentoId;
                const valorInput      = liquidacaoModal.querySelector('#liquidacao-valor');
                const contaSelect     = liquidacaoModal.querySelector('#liquidacao-conta');
                const dataInput       = liquidacaoModal.querySelector('#liquidacao-data');

                const valorLiquidado  = parseFloat(valorInput.value);
                const contaBancariaId = contaSelect.value;
                const dataLiquidacao  = dataInput.value;

                if (!valorLiquidado || valorLiquidado <= 0) {
                    alert('Informe um valor válido para liquidar.');
                    return;
                }
                if (!contaBancariaId) {
                    alert('Selecione uma conta bancária.');
                    return;
                }
                if (!dataLiquidacao) {
                    alert('Informe a data da liquidação.');
                    return;
                }

                // Proteção contra clique duplo
                const originalContent = confirmBtn.innerHTML;
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Processando...';

                try {
                    await FirebaseService.liquidarLancamento(lancamentoId, {
                        valorLiquidado,
                        contaBancariaId,
                        dataLiquidacao
                    });
                    alert('Lançamento liquidado com sucesso!');
                    liquidacaoModal.classList.add('hidden');
                } catch (error) {
                    console.error('Erro ao liquidar:', error);
                    alert('Ocorreu um erro ao processar a liquidação.');
                } finally {
                    confirmBtn.disabled = false;
                    confirmBtn.innerHTML = originalContent;
                }
            });
        }

        // Cargas iniciais (listeners em tempo real)
        FirebaseService.listarLancamentos(renderList);
        FirebaseService.listarContasBancarias((contas) => { allContasBancarias = contas || {}; });
    }
};
