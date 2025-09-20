// modules/vendasForm.js
// (Versão Unificada + Painel Financeiro Avançado + Plano de Pagamentos Reestruturado
//  + Novas Regras de Negócio + Custo do Fornecedor + Fornecedores Integrados
//  + Detalhamento de Serviços e Passageiros Inteligentes
//  + Calendário, Pedidos & Anexos)

const VendasFormModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body"><h1 id="venda-form-title">Nova Venda</h1></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <form id="form-venda">
                        <div class="card-body">

                            <div class="tabs-nav">
                                <button type="button" class="tab-link active" data-tab="geral">
                                    <i class="fa-solid fa-user-pen"></i> Clientes & Serviços
                                </button>
                                <button type="button" class="tab-link" data-tab="financeiro">
                                    <i class="fa-solid fa-dollar-sign"></i> Financeiro
                                </button>
                                <button type="button" class="tab-link" data-tab="comissoes">
                                    <i class="fa-solid fa-percent"></i> Comissões
                                </button>
                                <button type="button" class="tab-link" data-tab="pedidos">
                                    <i class="fa-solid fa-clipboard-list"></i> Pedidos & Obs.
                                </button>
                                <button type="button" class="tab-link" data-tab="anexos">
                                    <i class="fa-solid fa-paperclip"></i> Anexos
                                </button>
                            </div>

                            <div class="tabs-content">
                                <div class="tab-pane active" id="tab-geral">
                                    <fieldset>
                                        <legend>Datas da Viagem</legend>
                                        <div class="form-row">
                                            <div class="form-group" style="width:100%;">
                                                <label>Período do Serviço</label>
                                                <input type="text" id="servico-periodo" class="datepicker-range" placeholder="Selecione o início e fim da viagem">
                                            </div>
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <legend>Dados da Venda</legend>
                                        <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr;">
                                            <div class="form-group">
                                                <label for="ref">Referência</label>
                                                <input type="text" id="ref" name="ref" readonly>
                                            </div>
                                            <div class="form-group">
                                                <label for="data-venda">Data da Venda</label>
                                                <input type="date" id="data-venda" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="vendedor-principal">Vendedor Principal</label>
                                                <input type="text" id="vendedor-principal" required placeholder="Nome do vendedor">
                                            </div>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group autocomplete-container with-button">
                                                <label for="clienteNome">Cliente</label>
                                                <div class="input-with-button">
                                                    <input type="text" id="clienteNome" name="clienteNome" placeholder="Digite para buscar..." autocomplete="off" required>
                                                    <button type="button" id="quick-add-client-btn" class="add-new-button" title="Cadastrar Novo Cliente">+</button>
                                                </div>
                                                <input type="hidden" id="clienteId" name="clienteId">
                                                <div id="cliente-search-results" class="autocomplete-results"></div>
                                            </div>
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <legend>Serviços</legend>
                                        <div id="servicos-container">
                                            <p class="empty-state">Nenhum serviço adicionado.</p>
                                        </div>
                                        <button id="add-servico" type="button" class="add-button">
                                            <i class="fa-solid fa-plus"></i> Adicionar Serviço
                                        </button>
                                    </fieldset>
                                </div>

                                <div class="tab-pane" id="tab-financeiro">
                                    <fieldset>
                                        <legend>Resumo Financeiro</legend>
                                        <div class="summary-cards-grid">
                                            <div class="summary-card">
                                                <i class="fa-solid fa-file-invoice-dollar card-icon" style="color:#5e72e4;"></i>
                                                <span class="card-label">Valor Total da Venda</span>
                                                <span class="card-value" id="summary-valor-total">R$ 0,00</span>
                                            </div>
                                            <div class="summary-card">
                                                <i class="fa-solid fa-sack-dollar card-icon" style="color:#2dce89;"></i>
                                                <span class="card-label">Lucro Bruto</span>
                                                <span class="card-value" id="summary-lucro-bruto">R$ 0,00</span>
                                                <span class="profit-tag" id="summary-percentual-lucro">0,00%</span>
                                            </div>
                                            <div class="summary-card">
                                                <i class="fa-solid fa-hand-holding-dollar card-icon" style="color:#11cdef;"></i>
                                                <span class="card-label">Lucro Líquido (-Comissões)</span>
                                                <span class="card-value" id="summary-lucro-liquido">R$ 0,00</span>
                                            </div>
                                            <div class="summary-card">
                                                <i class="fa-solid fa-comments-dollar card-icon" style="color:#fb6340;"></i>
                                                <span class="card-label">Total Comissões</span>
                                                <span class="card-value" id="summary-comissoes">R$ 0,00</span>
                                            </div>
                                            <div class="summary-card">
                                                <i class="fa-solid fa-user-clock card-icon" style="color:#f5365c;"></i>
                                                <span class="card-label">Saldo Devedor (Cliente)</span>
                                                <span class="card-value" id="summary-saldo-devedor">R$ 0,00</span>
                                            </div>
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <legend>Plano de Pagamentos</legend>

                                        <div class="add-payment-form">
                                            <div class="form-group">
                                                <label>Quem Recebe</label>
                                                <select id="new-payment-receiver">
                                                    <option value="AGENCIA">Agência</option>
                                                    <option value="FORNECEDOR">Fornecedor</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label>Forma</label>
                                                <select id="new-payment-method">
                                                    <option value="PIX">PIX</option>
                                                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                                                    <option value="Boleto">Boleto</option>
                                                    <option value="Dinheiro">Dinheiro</option>
                                                </select>
                                            </div>
                                            <div class="form-group">
                                                <label>Valor</label>
                                                <input type="number" id="new-payment-value" placeholder="0,00" step="0.01">
                                            </div>
                                            <div class="form-group">
                                                <label>Vencimento</label>
                                                <input type="date" id="new-payment-due-date">
                                            </div>
                                            <button id="add-pagamento-btn" type="button" class="primary-button">
                                                <i class="fa-solid fa-plus"></i> Adicionar
                                            </button>
                                        </div>

                                        <div id="pagamentos-container" class="table-responsive">
                                            <table class="payment-table">
                                                <thead>
                                                    <tr>
                                                        <th>Quem Recebe</th>
                                                        <th>Forma</th>
                                                        <th>Valor</th>
                                                        <th>Vencimento</th>
                                                        <th>Status</th>
                                                        <th>Liquidado em</th>
                                                        <th>Ações</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="payment-list-body">
                                                    <tr class="empty-row">
                                                        <td colspan="7" class="empty-state">Nenhum pagamento adicionado.</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </fieldset>
                                </div>

                                <div class="tab-pane" id="tab-comissoes">
                                     <fieldset>
                                        <legend>Comissões (% do Lucro)</legend>
                                        <div id="comissoes-container">
                                            <p class="empty-state">Nenhuma comissão adicionada.</p>
                                        </div>
                                        <button id="add-comissao" type="button" class="add-button">
                                            <i class="fa-solid fa-plus"></i> Adicionar Comissão
                                        </button>
                                    </fieldset>
                                </div>

                                <div class="tab-pane" id="tab-pedidos">
                                    <fieldset>
                                        <legend>Observações Gerais</legend>
                                        <textarea id="observacoes-gerais" rows="4" placeholder="Detalhes importantes, restrições, etc."></textarea>
                                    </fieldset>
                                    <fieldset>
                                        <legend>Pedidos Especiais</legend>
                                        <div id="pedidos-list"></div>
                                        <div class="add-pedido-form" style="display:grid; gap:.5rem; grid-template-columns: 1fr 1fr auto auto;">
                                            <input type="text" id="new-pedido-desc" placeholder="Descrição do pedido (Ex: Lua de Mel)">
                                            <input type="text" id="new-pedido-resp" placeholder="Responsável">
                                            <input type="date" id="new-pedido-data">
                                            <button type="button" id="add-pedido-btn" class="secondary-button">Adicionar</button>
                                        </div>
                                    </fieldset>
                                </div>

                                <div class="tab-pane" id="tab-anexos">
                                    <fieldset>
                                        <legend>Documentos da Venda</legend>
                                        <div class="anexos-upload-area">
                                            <input type="file" id="anexo-input" multiple>
                                            <label for="anexo-input"><i class="fa-solid fa-cloud-arrow-up"></i> Clique para selecionar ou arraste os arquivos aqui</label>
                                            <div id="anexos-feedback"></div>
                                        </div>
                                        <div id="anexos-list"></div>
                                    </fieldset>
                                </div>
                            </div>
                        </div>

                        <div class="card-footer">
                            <button id="voltar-lista-btn" type="button" class="secondary-button">Voltar</button>
                            
                            <button id="gerar-voucher-btn" type="button" class="secondary-button" style="margin-right: auto;">
                                <i class="fa-solid fa-file-pdf"></i> Gerar Voucher (PDF)
                            </button>
                            <button id="gerar-contrato-btn" type="button" class="secondary-button">
                                <i class="fa-solid fa-file-signature"></i> Gerar Contrato (PDF)
                            </button>

                            <button id="salvar-venda" class="primary-button" type="button">
                                <i class="fa-solid fa-floppy-disk"></i> Salvar Venda
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    init: (vendaIdParaEditar = null) => {
        // Abas
        const tabsNav = document.querySelector('.tabs-nav');
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabsNav.addEventListener('click', (event) => {
            const tabLink = event.target.closest('.tab-link');
            if (!tabLink) return;
            tabsNav.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabLink.classList.add('active');
            const tabId = tabLink.dataset.tab;
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });

        // Estado
        let currentEditingVendaId = vendaIdParaEditar;
        let allClients = {};
        let allLancamentos = {};
        let allFornecedores = {};
        let servicoCounter = 0;
        let servicoCardParaAdicionarPassageiro = null;

        // Passageiros “inteligentes” + voos
        let masterPassengerList = [];
        let currentAereoServiceCardId = null;

        // Elementos
        const formTitle = document.getElementById('venda-form-title');
        const form = document.getElementById('form-venda');
        const clienteNomeInput = document.getElementById('clienteNome');
        const clienteIdInput = document.getElementById('clienteId');
        const clienteSearchResults = document.getElementById('cliente-search-results');
        const quickAddClientBtn = document.getElementById('quick-add-client-btn');
        const addButton = document.getElementById('add-servico');
        const servicosContainer = document.getElementById('servicos-container');
        const saveButton = document.getElementById('salvar-venda');
        const backButton = document.getElementById('voltar-lista-btn');
        const comissoesContainer = document.getElementById('comissoes-container');
        const addComissaoButton = document.getElementById('add-comissao');

        // Novos campos
        const refInput = document.getElementById('ref');
        const dataVendaInput = document.getElementById('data-venda');
        const vendedorPrincipalInput = document.getElementById('vendedor-principal');

        // Pedidos
        const pedidosList = document.getElementById('pedidos-list');
        const addPedidoBtn = document.getElementById('add-pedido-btn');
        const newPedidoDesc = document.getElementById('new-pedido-desc');
        const newPedidoResp = document.getElementById('new-pedido-resp');
        const newPedidoData = document.getElementById('new-pedido-data');

        // Anexos
        const anexoInput = document.getElementById('anexo-input');
        const anexosFeedback = document.getElementById('anexos-feedback');
        const anexosList = document.getElementById('anexos-list');

        // Pagamentos
        const addPagamentoBtn = document.getElementById('add-pagamento-btn');
        const paymentListBody = document.getElementById('payment-list-body');

        // Modais
        const servicoModal = document.getElementById('servico-modal');
        const quickClientModal = document.getElementById('quick-add-client-modal');
        const passageiroModal = document.getElementById('passageiro-modal');
        const vooModal = document.getElementById('voo-modal');

        // Helpers
        const openModal  = (modal) => modal && modal.classList.remove('hidden');
        const closeModal = (modal) => modal && modal.classList.add('hidden');
        const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Data listeners
        FirebaseService.listarFornecedores(data => { allFornecedores = data || {}; });
        FirebaseService.listarLancamentos(l => { allLancamentos = l || {}; });
        FirebaseService.listarClientes(clients => { allClients = clients || {}; });

        // ===== Calendário principal da viagem (flatpickr) =====
        const setupDateRange = () => {
            const el = document.querySelector('#servico-periodo');
            if (!el || !window.flatpickr) return;

            const localePT = (window.flatpickr.l10ns && window.flatpickr.l10ns.pt) ? window.flatpickr.l10ns.pt : null;

            window.flatpickr(el, {
                mode: "range",
                dateFormat: "d/m/Y",
                ariaDateFormat: "d/m/Y",
                allowInput: true,
                locale: localePT || undefined,
                onReady: () => {
                    el.setAttribute('placeholder', 'Selecione o início e fim da viagem');
                }
            });
        };
        setupDateRange();
        if (!window.flatpickr) window.addEventListener('load', setupDateRange);

        // ===== Gerar referência + data, quando criando =====
        if (!currentEditingVendaId) {
            dataVendaInput.value = new Date().toISOString().split('T')[0];
            try {
                firebase.database().ref('erp/vendas')
                    .orderByChild('referencia')
                    .limitToLast(1)
                    .get()
                    .then(snapshot => {
                        let newRef = 9001;
                        if (snapshot.exists()) {
                            try {
                                const lastVenda = Object.values(snapshot.val())[0];
                                const lastRefNumber = parseInt(String(lastVenda.referencia || '').replace('#',''));
                                if (!isNaN(lastRefNumber) && lastRefNumber >= 9000) newRef = lastRefNumber + 1;
                            } catch {}
                        }
                        refInput.value = `#${newRef}`;
                    });
            } catch {
                refInput.value = refInput.value || '#9001';
            }
        }

        // ---------------------------
        // Cálculo central (KPIs + soma por serviço)
        // ---------------------------
        const computeAndUpdateKPIs = () => {
            let totalVenda = 0, totalCusto = 0;

            servicosContainer.querySelectorAll('.servico-card').forEach(card => {
                let venda = 0, custo = 0;
                card.querySelectorAll('.passageiro-row').forEach(pax => {
                    const checked = pax.querySelector('.passageiro-selecionado')
                        ? pax.querySelector('.passageiro-selecionado').checked
                        : true;
                    if (checked) {
                        venda += parseFloat(pax.querySelector('.passageiro-valor-venda')?.value) || 0;
                        custo += parseFloat(pax.querySelector('.passageiro-valor-custo')?.value) || 0;
                    }
                });
                const vendaEl = card.querySelector('.valor-venda');  if (vendaEl) vendaEl.value = venda.toFixed(2);
                const custoEl = card.querySelector('.valor-custo');  if (custoEl) custoEl.value = custo.toFixed(2);
                totalVenda += venda; totalCusto += custo;
            });

            const lucroBruto = totalVenda - totalCusto;

            let totalComissoes = 0;
            comissoesContainer.querySelectorAll('.comissao-row').forEach(row => {
                const perc = parseFloat(row.querySelector('.comissao-percentual')?.value) || 0;
                if (perc > 0) totalComissoes += (lucroBruto * (perc / 100));
            });

            const lucroLiquido = Math.max(0, lucroBruto - totalComissoes);
            const margem = totalVenda > 0 ? (lucroBruto / totalVenda) * 100 : 0;

            let aReceber = 0;
            if (currentEditingVendaId && Object.keys(allLancamentos).length) {
                Object.values(allLancamentos).forEach(l => {
                    if (l.vendaRelacionada === currentEditingVendaId &&
                        l.tipo === 'receber' &&
                        (l.status === 'Pendente' || l.status === 'Parcial')) {
                        aReceber += Number(l.valorAberto ?? l.valor ?? 0);
                    }
                });
            }
            if (aReceber === 0) {
                paymentListBody.querySelectorAll('.payment-row').forEach(row => {
                    const quem = row.dataset.receiver;
                    const val  = parseFloat(row.dataset.value) || 0;
                    if (quem === 'AGENCIA') aReceber += val;
                });
            }
            const saldoDevedor = Math.max(0, totalVenda - aReceber);

            document.getElementById('summary-valor-total').textContent   = formatCurrency(totalVenda);
            document.getElementById('summary-lucro-bruto').textContent   = formatCurrency(lucroBruto);
            document.getElementById('summary-comissoes').textContent     = formatCurrency(totalComissoes);
            document.getElementById('summary-lucro-liquido').textContent = formatCurrency(lucroLiquido);
            document.getElementById('summary-saldo-devedor').textContent = formatCurrency(saldoDevedor);

            const tag = document.getElementById('summary-percentual-lucro');
            tag.textContent = `${margem.toFixed(2)}%`;
            tag.classList.remove('good', 'bad');
            if (margem >= 25) tag.classList.add('good'); else tag.classList.add('bad');
        };

        // ---------------------------
        // UI: Passageiros / Serviços
        // ---------------------------
        const addPassengerToService = (serviceCard, paxData = {}, isPreAssigned = false) => {
            const passageirosContainer = serviceCard.querySelector('.passageiros-container');
            const paxId = `pax-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const passageiroHTML = `
                <div class="passageiro-row" id="${paxId}" data-pax-id="${paxData.id || ''}" data-pax-name="${paxData.nome || ''}">
                    <div class="passageiro-select">
                        <input type="checkbox" class="passageiro-selecionado" ${isPreAssigned || !masterPassengerList.length ? 'checked' : ''}>
                        <span class="passageiro-nome">${paxData.nome || ''}</span>
                    </div>
                    <div class="passageiro-inputs">
                        <input type="number" class="passageiro-valor-venda" value="${paxData.valorVenda || ''}" placeholder="Venda" step="0.01">
                        <input type="number" class="passageiro-valor-custo" value="${paxData.valorCusto || ''}" placeholder="Custo" step="0.01">
                        <button type="button" class="remove-passageiro" data-remove-id="${paxId}">&times;</button>
                    </div>
                </div>`;
            passageirosContainer.insertAdjacentHTML('beforeend', passageiroHTML);
        };

        // Criação do card de serviço com campos extras e fornecedores
        const addServiceCard = (type, data = {}) => {
            const emptyState = servicosContainer.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            servicoCounter++;
            const servicoId = `servico-${servicoCounter}`;

            let field1Label = 'Localizador';
            if (type === 'hotel')    { field1Label = 'Hotel'; }
            if (type === 'transfer') { field1Label = 'Descrição'; }

            let fornecedoresOptions = '<option value="">Selecione...</option>';
            for (const id in allFornecedores) {
                const fornecedor = allFornecedores[id] || {};
                const isSelected = (id === data.fornecedorId) ? 'selected' : '';
                fornecedoresOptions += `<option value="${id}" ${isSelected}>${fornecedor.nome || '(sem nome)'}</option>`;
            }

            let extraFieldsHTML = '';
            if (type === 'hotel') {
                extraFieldsHTML = `
                    <div class="form-row hotel-times">
                        <div class="form-group"><label>Horário Check-in</label><input type="time" class="servico-checkin" value="${data.checkin || '15:00'}"></div>
                        <div class="form-group"><label>Horário Check-out</label><input type="time" class="servico-checkout" value="${data.checkout || '11:00'}"></div>
                    </div>
                    <div class="form-group">
                        <label>Regime de Alimentação</label>
                        <select class="servico-regime">
                            <option value="Café da Manhã" ${data.regime === 'Café da Manhã' ? 'selected' : ''}>Café da Manhã</option>
                            <option value="Meia Pensão" ${data.regime === 'Meia Pensão' ? 'selected' : ''}>Meia Pensão</option>
                            <option value="Pensão Completa" ${data.regime === 'Pensão Completa' ? 'selected' : ''}>Pensão Completa</option>
                            <option value="All Inclusive" ${data.regime === 'All Inclusive' ? 'selected' : ''}>All Inclusive</option>
                            <option value="Sem Refeições" ${data.regime === 'Sem Refeições' ? 'selected' : ''}>Sem Refeições</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Quarto</label>
                        <select class="servico-tipo-quarto">
                            <option value="Duplo" ${data.tipoQuarto === 'Duplo' ? 'selected' : ''}>Duplo</option>
                            <option value="Triplo" ${data.tipoQuarto === 'Triplo' ? 'selected' : ''}>Triplo</option>
                            <option value="Quádruplo" ${data.tipoQuarto === 'Quádruplo' ? 'selected' : ''}>Quádruplo</option>
                            <option value="Família" ${data.tipoQuarto === 'Família' ? 'selected' : ''}>Família</option>
                        </select>
                    </div>
                `;
            } else if (type === 'aereo') {
                extraFieldsHTML = `
                    <div class="voos-section">
                        <h4>Voos</h4>
                        <div class="voos-list"></div>
                        <button type="button" class="add-voo-btn secondary-button">Adicionar Voo</button>
                    </div>
                `;
            }

            const icon = type === 'aereo' ? 'plane-up' : type;

            const html = `
                <div class="servico-card" data-service-type="${type}" id="${servicoId}">
                    <div class="servico-header">
                        <strong><i class="fa-solid fa-${icon}"></i> Serviço ${type.charAt(0).toUpperCase() + type.slice(1)} #${servicoCounter}</strong>
                        <button class="remove-servico" data-remove-id="${servicoId}" type="button">&times;</button>
                    </div>
                    <div class="servico-body">
                        <div><label>${field1Label}</label><input type="text" class="servico-field1" value="${(data.localizador || data.hotel || data.descricao || '')}"></div>
                        <div>
                            <label>Fornecedor</label>
                            <select class="servico-fornecedor">${fornecedoresOptions}</select>
                        </div>
                        ${extraFieldsHTML}
                        <div><label>Valor Venda</label><input type="number" class="valor-venda" value="${data.valorVenda || '0.00'}" step="0.01" readonly></div>
                        <div><label>Valor Custo</label><input type="number" class="valor-custo" value="${data.valorCusto || '0.00'}" step="0.01" readonly></div>
                    </div>
                    <div class="passageiros-section">
                        <div class="passageiros-header">
                            <span>Passageiros</span>
                            <button type="button" class="add-passenger-btn"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        <div class="passageiros-container"></div>
                    </div>
                </div>`;
            servicosContainer.insertAdjacentHTML('beforeend', html);

            const newCard = document.getElementById(servicoId);
            if (masterPassengerList.length > 0) masterPassengerList.forEach(pax => addPassengerToService(newCard, pax, true));
            if (data.passageiros && data.passageiros.length > 0) data.passageiros.forEach(p => addPassengerToService(newCard, p, true));
        };

        // ---------------------------
        // Plano de Pagamentos Reestruturado
        // ---------------------------
        const addPagamentoRow = (data = {}) => {
            const emptyRow = paymentListBody.querySelector('.empty-row');
            if (emptyRow) emptyRow.remove();

            const status = data.status || 'Pendente';
            const dataLiquidacao = data.data_liquidacao || '';

            const rowId = `payment-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const toBR = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '---';

            const html = `
                <tr class="payment-row" id="${rowId}"
                    data-receiver="${data.quem_recebe || ''}"
                    data-method="${data.forma_pagamento || ''}"
                    data-value="${Number(data.valor || 0)}"
                    data-due-date="${data.data_vencimento || ''}"
                    data-status="${status}"
                    data-paid-date="${dataLiquidacao}">
                    <td>${data.quem_recebe || ''}</td>
                    <td>${data.forma_pagamento || ''}</td>
                    <td>${formatCurrency(Number(data.valor || 0))}</td>
                    <td>${toBR(data.data_vencimento)}</td>
                    <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                    <td>${toBR(dataLiquidacao)}</td>
                    <td><button type="button" class="action-button remove-pagamento" data-remove-id="${rowId}">
                        <i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            paymentListBody.insertAdjacentHTML('beforeend', html);
            computeAndUpdateKPIs();
        };

        addPagamentoBtn.addEventListener('click', () => {
            const receiverInput = document.getElementById('new-payment-receiver');
            const methodInput   = document.getElementById('new-payment-method');
            const valueInput    = document.getElementById('new-payment-value');
            const dueDateInput  = document.getElementById('new-payment-due-date');

            const newPayment = {
                quem_recebe: receiverInput.value,
                forma_pagamento: methodInput.value,
                valor: parseFloat(valueInput.value) || 0,
                data_vencimento: dueDateInput.value,
                status: 'Pendente',
                data_liquidacao: null
            };

            if (!newPayment.valor || !newPayment.data_vencimento) {
                alert('Por favor, informe o Valor e a Data de Vencimento do pagamento.');
                return;
            }

            addPagamentoRow(newPayment);
            valueInput.value = '';
            dueDateInput.value = '';
        });

        paymentListBody.addEventListener('click', (event) => {
            const removeButton = event.target.closest('.remove-pagamento');
            if (removeButton) {
                document.getElementById(removeButton.dataset.removeId)?.remove();
                if (!paymentListBody.querySelector('.payment-row')) {
                    paymentListBody.innerHTML = '<tr class="empty-row"><td colspan="7" class="empty-state">Nenhum pagamento adicionado.</td></tr>';
                }
                computeAndUpdateKPIs();
            }
        });

        // ---------------------------
        // Reset / Carregar Venda
        // ---------------------------
        const resetForm = () => {
            currentEditingVendaId = null;
            form.reset();
            servicosContainer.innerHTML = '<p class="empty-state">Nenhum serviço adicionado.</p>';
            paymentListBody.innerHTML = '<tr class="empty-row"><td colspan="7" class="empty-state">Nenhum pagamento adicionado.</td></tr>';
            comissoesContainer.innerHTML = '<p class="empty-state">Nenhuma comissão adicionada.</p>';
            document.getElementById('observacoes-gerais').value = '';
            pedidosList.innerHTML = '';
            anexosList.innerHTML = '';
            if (anexosFeedback) anexosFeedback.textContent = '';
            masterPassengerList = [];
            computeAndUpdateKPIs();
            formTitle.textContent = 'Nova Venda';
        };

        const addComissaoRow = (data = {}, status = 'Pendente') => {
            const emptyState = comissoesContainer.querySelector('.empty-state');
            if (emptyState) emptyState.remove();

            const comissaoId = `comissao-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const isLocked = status === 'Liquidado' || status === 'Parcial';
            const statusClass = (status || 'Pendente').toLowerCase();

            const html = `
                <div class="comissao-row" id="${comissaoId}">
                    <input type="text" class="comissao-nome" placeholder="Nome do Vendedor/Intermediário" value="${data.nome || ''}" ${isLocked ? 'readonly' : ''}>
                    <input type="number" class="comissao-percentual" placeholder="% do Lucro" step="0.01" value="${data.comissaoPerc || ''}" ${isLocked ? 'readonly' : ''}>
                    <span class="status ${statusClass}">${status}</span>
                    <button type="button" class="action-button remove-comissao" data-remove-id="${comissaoId}" ${isLocked ? 'disabled' : ''}>
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>`;
            comissoesContainer.insertAdjacentHTML('beforeend', html);
        };

        const addPedidoItem = (pedido) => {
            const id = `pedido-${Date.now()}-${Math.floor(Math.random()*1000)}`;
            const html = `
                <div class="pedido-item" id="${id}" data-desc="${pedido.descricao || ''}" data-resp="${pedido.responsavel || ''}" data-data="${pedido.data || ''}">
                    <div class="pedido-line">
                        <strong>${pedido.descricao || '(sem descrição)'}</strong>
                        <span>${pedido.responsavel ? ' • ' + pedido.responsavel : ''}</span>
                        <span>${pedido.data ? ' • ' + new Date(pedido.data + 'T00:00:00').toLocaleDateString('pt-BR') : ''}</span>
                        <button type="button" class="action-button remove-pedido" data-remove-id="${id}" title="Remover"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
            pedidosList.insertAdjacentHTML('beforeend', html);
        };

        // Lógica de Pedidos
        addPedidoBtn?.addEventListener('click', () => {
            const descricao = (newPedidoDesc.value || '').trim();
            const responsavel = (newPedidoResp.value || '').trim();
            const data = newPedidoData.value || '';
            if (!descricao) {
                alert('Descreva o pedido antes de adicionar.');
                return;
            }
            addPedidoItem({ descricao, responsavel, data });
            newPedidoDesc.value = '';
            newPedidoResp.value = '';
            newPedidoData.value = '';
        });

        pedidosList.addEventListener('click', (e) => {
            const rm = e.target.closest('.remove-pedido');
            if (rm) document.getElementById(rm.dataset.removeId)?.remove();
        });

        const loadVendaIntoForm = async (vendaId) => {
            try {
                const vendaData = await FirebaseService.getVenda(vendaId);
                resetForm();
                currentEditingVendaId = vendaId;

                refInput.value = vendaData.referencia || '';
                dataVendaInput.value = vendaData.dataVenda || '';
                vendedorPrincipalInput.value = vendaData.vendedorPrincipalNome || '';

                clienteNomeInput.value = vendaData.clienteNome || '';
                clienteIdInput.value   = vendaData.clienteId || '';

                // Datas / pedidos / observações
                document.getElementById('servico-periodo').value = vendaData.periodoViagem || '';
                document.getElementById('observacoes-gerais').value = vendaData.observacoes || '';
                (vendaData.pedidos || []).forEach(addPedidoItem);

                // Popular lista mestre (únicos)
                const setUniq = new Map();

                // Serviços
                if (vendaData.servicos && vendaData.servicos.length > 0) {
                    vendaData.servicos.forEach(servico => {
                        const data = { ...servico };
                        data.fornecedorId = servico.fornecedorId || '';
                        if (servico.tipo === 'aereo')      { data.localizador = servico.localizador; }
                        else if (servico.tipo === 'hotel') { data.hotel       = servico.hotel; }
                        else if (servico.tipo === 'transfer'){ data.descricao = servico.descricao; }
                        addServiceCard(servico.tipo, data);
                        (servico.passageiros || []).forEach(p => {
                            const key = `${p.id || ''}|${p.nome || ''}`;
                            if (!setUniq.has(key)) setUniq.set(key, { id: p.id, nome: p.nome });
                        });
                    });
                }
                masterPassengerList = Array.from(setUniq.values());

                // Pagamentos
                (vendaData.planoPagamentos || []).forEach(addPagamentoRow);

                // Comissões com status
                if (vendaData.vendedores && vendaData.vendedores.length > 0) {
                    const comissoesLanc = Object.values(allLancamentos).filter(
                        l => l.vendaRelacionada === vendaId && l.categoriaNome === "Comissões Vendedores"
                    );
                    vendaData.vendedores.forEach(vendedor => {
                        const lanc = comissoesLanc.find(l => l.favorecidoDevedor === vendedor.nome);
                        const status = lanc ? (lanc.status || 'Pendente') : 'Pendente';
                        addComissaoRow(vendedor, status);
                    });
                }

                computeAndUpdateKPIs();
                formTitle.textContent = `Editando Venda #${vendaData.referencia || ''}`;
            } catch (error) {
                console.error("Erro ao carregar venda para edição:", error);
                alert("Não foi possível carregar os dados da venda.");
            }
        };

        // ---------- Autocomplete cliente ----------
        clienteNomeInput.addEventListener('input', () => {
            const searchTerm = clienteNomeInput.value.toLowerCase();
            clienteSearchResults.innerHTML = '';
            clienteIdInput.value = '';
            if (searchTerm.length < 2) { clienteSearchResults.style.display = 'none'; return; }
            const clientIds = Object.keys(allClients || {});
            const filtered = clientIds.filter(id => (allClients[id].nome || '').toLowerCase().includes(searchTerm));
            if (filtered.length > 0) {
                filtered.forEach(clientId => {
                    const client = allClients[clientId];
                    const idade = VendasCalculos.calcularIdade(client.nascimento);
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerHTML = `
                        <div class="client-info">
                            <span class="client-name">${client.nome}</span>
                            <span class="client-details">CPF: ${client.cpf || 'N/A'} | Idade: ${idade || 'N/A'}</span>
                        </div>`;
                    item.dataset.id = clientId;
                    item.dataset.name = client.nome;
                    clienteSearchResults.appendChild(item);
                });
                clienteSearchResults.style.display = 'block';
            } else {
                clienteSearchResults.style.display = 'none';
            }
        });

        clienteSearchResults.addEventListener('click', (event) => {
            const item = event.target.closest('.autocomplete-item');
            if (item) {
                clienteNomeInput.value = item.dataset.name;
                clienteIdInput.value = item.dataset.id;
                clienteSearchResults.innerHTML = '';
                clienteSearchResults.style.display = 'none';
            }
        });

        document.addEventListener('click', (event) => {
            if (clienteSearchResults && !clienteSearchResults.contains(event.target) && event.target !== clienteNomeInput) {
                clienteSearchResults.style.display = 'none';
            }
        });

        // ---------- Modal Serviço ----------
        if (servicoModal) {
            const closeModalBtn  = servicoModal.querySelector('.close-button');
            const serviceOptions = servicoModal.querySelector('#servico-options');
            addButton.addEventListener('click', () => openModal(servicoModal));
            closeModalBtn.addEventListener('click', () => closeModal(servicoModal));
            servicoModal.addEventListener('click', (e) => { if (e.target === servicoModal) closeModal(servicoModal); });
            serviceOptions.addEventListener('click', (e) => {
                const opt = e.target.closest('.service-option');
                if (opt) {
                    addServiceCard(opt.dataset.type);
                    closeModal(servicoModal);
                    computeAndUpdateKPIs();
                }
            });
        }

        // ---------- Modal Cliente Rápido ----------
        if (quickClientModal) {
            const closeBtn = quickClientModal.querySelector('#close-quick-add-modal-btn');
            const saveBtn  = quickClientModal.querySelector('#save-quick-add-client-btn');
            const quickForm= quickClientModal.querySelector('#quick-add-client-form');

            quickAddClientBtn.addEventListener('click', () => openModal(quickClientModal));
            closeBtn.addEventListener('click', () => closeModal(quickClientModal));
            quickClientModal.addEventListener('click', (e) => { if (e.target === quickClientModal) closeModal(quickClientModal); });

            saveBtn.addEventListener('click', async () => {
                const novoCliente = {
                    nome: quickClientModal.querySelector('#quick-client-nome').value,
                    cpf: quickClientModal.querySelector('#quick-client-cpf').value,
                    nascimento: quickClientModal.querySelector('#quick-client-nascimento').value,
                    telefone: quickClientModal.querySelector('#quick-client-telefone').value,
                    email: quickClientModal.querySelector('#quick-client-email').value,
                };
                if (!novoCliente.nome) { alert('O nome é obrigatório.'); return; }
                try {
                    const novoId = await FirebaseService.salvarCliente(null, novoCliente);
                    clienteNomeInput.value = novoCliente.nome;
                    clienteIdInput.value   = novoId;
                    closeModal(quickClientModal);
                    quickForm.reset();
                } catch (err) {
                    console.error("Erro ao salvar cliente rápido:", err);
                    alert("Não foi possível salvar o novo cliente.");
                }
            });
        }

        // ---------- Modal Passageiro ----------
        if (passageiroModal) {
            const closeBtn = passageiroModal.querySelector('#close-passageiro-modal-btn');
            const searchInput = passageiroModal.querySelector('#search-passageiro-input');
            const resultsList = passageiroModal.querySelector('#passageiro-search-results');

            closeBtn.addEventListener('click', () => closeModal(passageiroModal));
            passageiroModal.addEventListener('click', (e) => { if (e.target === passageiroModal) closeModal(passageiroModal); });

            searchInput.addEventListener('input', () => {
                const term = searchInput.value.toLowerCase();
                resultsList.innerHTML = '';
                const ids = Object.keys(allClients || {});
                const filtered = ids.filter(id => (allClients[id].nome || '').toLowerCase().includes(term));
                filtered.forEach(id => {
                    const c = allClients[id];
                    const idade = VendasCalculos.calcularIdade(c.nascimento);
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.innerHTML = `
                        <div class="client-info">
                            <span class="client-name">${c.nome}</span>
                            <span class="client-details">CPF: ${c.cpf || 'N/A'} | Idade: ${idade || 'N/A'}</span>
                        </div>`;
                    item.dataset.id = id;
                    item.dataset.name = c.nome;
                    resultsList.appendChild(item);
                });
            });

            resultsList.addEventListener('click', (e) => {
                const item = e.target.closest('.autocomplete-item');
                if (item && servicoCardParaAdicionarPassageiro) {
                    const paxData = { id: item.dataset.id, nome: item.dataset.name };
                    addPassengerToService(servicoCardParaAdicionarPassageiro, paxData);
                    if (masterPassengerList.length === 0) masterPassengerList.push(paxData);
                    closeModal(passageiroModal);
                    computeAndUpdateKPIs();
                }
            });
        }

        // ---------- Modal de Voos ----------
        if (vooModal) {
            const closeVooBtn = vooModal.querySelector('#close-voo-modal-btn');
            const salvarVooBtn = vooModal.querySelector('#salvar-voo-btn');

            closeVooBtn.addEventListener('click', () => closeModal(vooModal));
            vooModal.addEventListener('click', (e) => { if (e.target === vooModal) closeModal(vooModal); });

            salvarVooBtn.addEventListener('click', () => {
                const vooData = {
                    data: document.getElementById('voo-data').value,
                    cia: document.getElementById('voo-cia').value,
                    numero: document.getElementById('voo-numero').value,
                    origem: document.getElementById('voo-origem').value,
                    destino: document.getElementById('voo-destino').value,
                    partida: document.getElementById('voo-partida').value,
                    chegada: document.getElementById('voo-chegada').value,
                    categoria: document.getElementById('voo-categoria').value,
                    bagagem: document.getElementById('voo-bagagem').checked,
                };
                if (!currentAereoServiceCardId) { closeModal(vooModal); return; }
                const aereoCard = document.getElementById(currentAereoServiceCardId);
                if (!aereoCard) { closeModal(vooModal); return; }
                const voosList = aereoCard.querySelector('.voos-list');
                const itemHTML = `
                    <div class="voo-item"
                         data-data="${vooData.data}"
                         data-cia="${vooData.cia}"
                         data-numero="${vooData.numero}"
                         data-origem="${vooData.origem}"
                         data-destino="${vooData.destino}"
                         data-partida="${vooData.partida}"
                         data-chegada="${vooData.chegada}"
                         data-categoria="${vooData.categoria}"
                         data-bagagem="${vooData.bagagem ? '1' : '0'}">
                        ${vooData.data} - ${vooData.cia} ${vooData.numero} (${vooData.origem}-${vooData.destino}) ${vooData.partida ? '• ' + vooData.partida : ''} ${vooData.chegada ? '→ ' + vooData.chegada : ''}
                    </div>`;
                voosList.insertAdjacentHTML('beforeend', itemHTML);
                closeModal(vooModal);
            });
        }

        // Abrir modal de voos a partir do card
        servicosContainer.addEventListener('click', event => {
            if (event.target.classList.contains('add-voo-btn')) {
                currentAereoServiceCardId = event.target.closest('.servico-card').id;
                const formVoo = document.getElementById('form-voo');
                if (formVoo) formVoo.reset();
                openModal(vooModal);
            }
        });

        // ---------- Anexos ----------
        anexoInput?.addEventListener('change', async (event) => {
            if (!currentEditingVendaId) {
                alert("Você precisa salvar a venda uma vez antes de poder adicionar anexos.");
                event.target.value = '';
                return;
            }
            const files = event.target.files || [];
            for (const file of files) {
                try {
                    anexosFeedback.textContent = `Enviando ${file.name}...`;
                    const url = await FirebaseService.uploadAnexoVenda(currentEditingVendaId, file);
                    const item = document.createElement('div');
                    item.className = 'anexo-item';
                    item.innerHTML = `<a href="${url}" target="_blank" rel="noopener">${file.name}</a>`;
                    anexosList.appendChild(item);
                    anexosFeedback.textContent = `Anexo "${file.name}" enviado com sucesso.`;
                } catch (err) {
                    console.error('Erro ao enviar anexo:', err);
                    anexosFeedback.textContent = `Falha ao enviar "${file.name}".`;
                }
            }
            event.target.value = '';
        });

        // ---------- Eventos gerais ----------
        backButton.addEventListener('click', () => App.navigate('vendas'));

        servicosContainer.addEventListener('input', (e) => {
            if (e.target.matches('.passageiro-valor-venda, .passageiro-valor-custo, .comissao-percentual')) {
                computeAndUpdateKPIs();
            }
        });

        servicosContainer.addEventListener('click', (e) => {
            const rmServico = e.target.closest('.remove-servico');
            const rmPax     = e.target.closest('.remove-passageiro');
            const addPaxBtn = e.target.closest('.add-passenger-btn');

            if (rmServico) {
                document.getElementById(rmServico.dataset.removeId)?.remove();
                if (!servicosContainer.querySelector('.servico-card')) {
                    servicosContainer.innerHTML = '<p class="empty-state">Nenhum serviço adicionado.</p>';
                }
                computeAndUpdateKPIs();
            }
            if (rmPax) {
                document.getElementById(rmPax.dataset.removeId)?.remove();
                computeAndUpdateKPIs();
            }
            if (addPaxBtn) {
                servicoCardParaAdicionarPassageiro = addPaxBtn.closest('.servico-card');
                if (passageiroModal) {
                    passageiroModal.querySelector('#search-passageiro-input').value = '';
                    passageiroModal.querySelector('#passageiro-search-results').innerHTML = '';
                    openModal(passageiroModal);
                }
            }
        });

        addComissaoButton.addEventListener('click', () => { addComissaoRow(); computeAndUpdateKPIs(); });

        comissoesContainer.addEventListener('input', (e) => {
            if (e.target.matches('.comissao-percentual')) computeAndUpdateKPIs();
        });

        comissoesContainer.addEventListener('click', (e) => {
            const rm = e.target.closest('.remove-comissao');
            if (rm) {
                document.getElementById(rm.dataset.removeId)?.remove();
                if (!comissoesContainer.querySelector('.comissao-row')) {
                    comissoesContainer.innerHTML = '<p class="empty-state">Nenhuma comissão adicionada.</p>';
                }
                computeAndUpdateKPIs();
            }
        });

        // ============ NOVO: Geração de Voucher (PDF) ============ //
        const gerarVoucherBtn = document.getElementById('gerar-voucher-btn');

        const gerarVoucherPDF = (vendaData) => {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert('Biblioteca jsPDF não carregada. Verifique a inclusão do script.');
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            let y = 15;

            // --- LOGO (substitua pelo seu base64 real) ---
            const logoBase64 = 'data:image/png;base64,COLE_AQUI_SEU_BASE64_DA_LOGO';
            if (typeof logoBase64 === 'string' && logoBase64.startsWith('data:image')) {
                try { doc.addImage(logoBase64, 'PNG', 15, y, 60, 15); } catch {}
            }
            y += 25;

            // --- Título ---
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Voucher de Viagem", 105, y, { align: "center" });
            y += 15;

            // --- Dados da Venda ---
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Dados da Reserva", 15, y);
            y += 7;
            doc.setFont("helvetica", "normal");
            doc.text(`Referência: ${vendaData.referencia || ''}`, 15, y);
            if (vendaData.dataVenda) doc.text(`Data: ${new Date(vendaData.dataVenda + 'T00:00:00').toLocaleDateString('pt-BR')}`, 80, y);
            doc.text(`Consultor(a): ${vendaData.vendedorPrincipalNome || ''}`, 130, y);
            y += 10;

            // --- Cliente ---
            doc.setFont("helvetica", "bold");
            doc.text("Cliente Principal", 15, y);
            y += 7;
            doc.setFont("helvetica", "normal");
            doc.text(vendaData.clienteNome || '', 15, y);
            y += 15;

            // --- Serviços ---
            doc.setFont("helvetica", "bold");
            doc.text("Serviços Contratados", 15, y);
            y += 7;

            (vendaData.servicos || []).forEach(servico => {
                doc.setLineWidth(0.5);
                doc.line(15, y - 2, 195, y - 2);
                
                let icon = '';
                if(servico.tipo === 'aereo') icon = '✈️';
                if(servico.tipo === 'hotel') icon = '🏨';
                if(servico.tipo === 'transfer') icon = '🚐';

                doc.setFont("helvetica", "bold");
                doc.text(`${icon} ${String(servico.tipo || '').toUpperCase()}`, 15, y + 5);
                y += 12;

                doc.setFont("helvetica", "normal");

                if (servico.tipo === 'hotel') {
                    if (servico.hotel) doc.text(`Hotel: ${servico.hotel}`, 20, y);
                    const periodo = servico.periodo || vendaData.periodoViagem || '';
                    if (periodo) doc.text(`Período: ${periodo}`, 20, y + 5);
                    const checkLine = [];
                    if (servico.checkin)  checkLine.push(`Check-in: ${servico.checkin}`);
                    if (servico.checkout) checkLine.push(`Check-out: ${servico.checkout}`);
                    if (checkLine.length) doc.text(checkLine.join(' | '), 20, y + 10);
                    const quartoLine = [];
                    if (servico.tipoQuarto) quartoLine.push(`Quarto: ${servico.tipoQuarto}`);
                    if (servico.regime)    quartoLine.push(`Regime: ${servico.regime}`);
                    if (quartoLine.length) doc.text(quartoLine.join(' | '), 20, y + 15);
                    y += 25;
                }

                if (servico.tipo === 'aereo') {
                    if (servico.localizador) {
                        doc.text(`Localizador: ${servico.localizador}`, 20, y);
                        y += 7;
                    }
                    if (Array.isArray(servico.voos)) {
                        servico.voos.forEach(voo => {
                            const d = voo.data ? new Date(voo.data + 'T00:00:00').toLocaleDateString('pt-BR') : '';
                            const linha = `Voo ${voo.numero || ''} (${voo.origem || ''}-${voo.destino || ''})` +
                                          (d ? ` - Data: ${d}` : '') +
                                          (voo.partida ? ` - Partida: ${voo.partida}` : '');
                            doc.text(linha, 25, y);
                            y += 5;
                        });
                        y += 5;
                    }
                }

                if (servico.tipo === 'transfer') {
                    if (servico.descricao) doc.text(`Descrição: ${servico.descricao}`, 20, y);
                    y += 10;
                }
                
                // Passageiros (sem valores)
                doc.setFont("helvetica", "italic");
                doc.text("Passageiros neste serviço:", 20, y);
                y += 5;
                doc.setFont("helvetica", "normal");
                (servico.passageiros || []).forEach(pax => {
                    if (pax?.nome) {
                        doc.text(`- ${pax.nome}`, 25, y);
                        y += 5;
                    }
                });

                y += 5;
            });

            // --- Observações ---
            if (vendaData.observacoes) {
                doc.setLineWidth(0.5);
                doc.line(15, y - 2, 195, y - 2);
                doc.setFont("helvetica", "bold");
                doc.text("Observações Importantes", 15, y + 5);
                y += 12;
                doc.setFont("helvetica", "normal");
                const obsLines = doc.splitTextToSize(vendaData.observacoes, 180);
                doc.text(obsLines, 15, y);
                y += obsLines.length * 5;
            }
            
            // --- Rodapé ---
            doc.line(15, y, 195, y);
            y += 5;
            doc.setFontSize(10);
            doc.text("Mondial Turismo - Desejamos a você uma excelente viagem!", 105, y, { align: "center" });

            // --- Salvar o PDF ---
            const refClean = (vendaData.referencia || '').replace('#','');
            const cliente   = (vendaData.clienteNome || '').replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'_');
            doc.save(`Voucher-${refClean}-${cliente || 'Cliente'}.pdf`);
        };

        gerarVoucherBtn?.addEventListener('click', () => {
            // Monta objeto vendaData a partir do formulário (sem valores financeiros)
            const vendaData = {
                referencia: document.getElementById('ref').value || '',
                dataVenda: document.getElementById('data-venda').value || '',
                vendedorPrincipalNome: document.getElementById('vendedor-principal').value || '',
                clienteNome: document.getElementById('clienteNome').value || '',
                observacoes: document.getElementById('observacoes-gerais').value || '',
                periodoViagem: document.getElementById('servico-periodo').value || '',
                servicos: []
            };

            // Percorre serviços e coleta infos relevantes para o voucher
            servicosContainer.querySelectorAll('.servico-card').forEach(card => {
                const tipo = card.dataset.serviceType;
                const servico = { tipo, passageiros: [] };

                if (tipo === 'aereo') {
                    servico.localizador = card.querySelector('.servico-field1')?.value || '';
                    const voos = [];
                    card.querySelectorAll('.voos-list .voo-item').forEach(v => {
                        voos.push({
                            data: v.dataset.data,
                            cia: v.dataset.cia,
                            numero: v.dataset.numero,
                            origem: v.dataset.origem,
                            destino: v.dataset.destino,
                            partida: v.dataset.partida,
                            chegada: v.dataset.chegada,
                            categoria: v.dataset.categoria,
                            bagagem: v.dataset.bagagem === '1'
                        });
                    });
                    if (voos.length) servico.voos = voos;
                } else if (tipo === 'hotel') {
                    servico.hotel = card.querySelector('.servico-field1')?.value || '';
                    servico.regime = card.querySelector('.servico-regime')?.value || '';
                    servico.tipoQuarto = card.querySelector('.servico-tipo-quarto')?.value || '';
                    servico.checkin = card.querySelector('.servico-checkin')?.value || '';
                    servico.checkout = card.querySelector('.servico-checkout')?.value || '';
                    // usa período geral se não houver por-serviço
                    servico.periodo = document.getElementById('servico-periodo').value || '';
                } else if (tipo === 'transfer') {
                    servico.descricao = card.querySelector('.servico-field1')?.value || '';
                }

                // Passageiros selecionados (somente nome)
                card.querySelectorAll('.passageiro-row').forEach(paxRow => {
                    const chk = paxRow.querySelector('.passageiro-selecionado');
                    if (!chk || chk.checked) {
                        servico.passageiros.push({
                            nome: paxRow.dataset.paxName || ''
                        });
                    }
                });

                vendaData.servicos.push(servico);
            });

            gerarVoucherPDF(vendaData);
        });
        // ========== FIM: Geração de Voucher ========== //

        // ========================================================== //
        // >>> INÍCIO DA NOVA FUNCIONALIDADE: GERAR CONTRATO (PDF) <<< //
        // ========================================================== //
        const gerarContratoBtn = document.getElementById('gerar-contrato-btn');

        // Função auxiliar simples para valor por extenso (placeholder)
        const numeroPorExtenso = (n) => {
            if (typeof n !== 'number') n = parseFloat(String(n).replace(',', '.')) || 0;
            if (!n) return "ZERO REAIS";
            return n.toFixed(2).replace('.', ',') + " REAIS";
        };

        const gerarContratoPDF = async (vendaData, clienteData) => { // Tornada async
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert('Biblioteca jsPDF não carregada.');
                return;
            }

            // >>> MODIFICAÇÃO: Busca as cláusulas do Firebase <<<
            const clausulasDb = await FirebaseService.getClausulas();
            const clausulasDoContrato = clausulasDb.contrato.split('\n'); // Separa por linha

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'pt', 'a4');
            let y = 0;

            // --- Logo (substitua pelo seu base64 real) ---
            const logoBase64 = 'data:image/png;base64,COLE_AQUI_SEU_BASE64_DA_LOGO';

            const drawHeader = (pageNumber) => {
                if (typeof logoBase64 === 'string' && logoBase64.startsWith('data:image')) {
                    try { doc.addImage(logoBase64, 'PNG', 40, 40, 150, 45); } catch {}
                }
                doc.setFontSize(8);
                doc.text("Mondial Hotéis e Transportes LTDA - CNPJ: 31.191.812/0001-95", 555, 50, { align: 'right' });
                doc.text("Avenida Coronel Bento de Godoy, 8 Centro - Caldas Novas - GO", 555, 60, { align: 'right' });
                doc.text("Telefone: (64) 3430-2333 - E-mail: contato@mondialturismo.com.br", 555, 70, { align: 'right' });
                if (pageNumber) {
                    doc.text(`Página ${pageNumber}`, 555, 810, { align: 'right' });
                }
            };

            // --- Página 1: Recibo ---
            drawHeader();
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(`RECIBO - VENDA ${vendaData.referencia || ''} - ${(new Date((vendaData.dataVenda || '') + 'T00:00:00')).toLocaleDateString('pt-BR')}`, 40, 150);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const valorTotal = parseFloat(vendaData.valorTotal || 0) || 0;
            const valorTotalExtenso = numeroPorExtenso(valorTotal);
            const textoRecibo = `A Mondial Hotéis e Transportes LTDA declara que os serviços contratados pelo(a) Sr.(a) ${vendaData.clienteNome || ''} totalizam a importância de R$ ${valorTotal.toFixed(2)} (${valorTotalExtenso}).`;
            const splitText = doc.splitTextToSize(textoRecibo, 515);
            doc.text(splitText, 40, 250);

            // --- Página 2+: Contrato (exemplo de cláusulas) ---
            doc.addPage();
            drawHeader(2);
            doc.setFont('helvetica', 'bold');
            doc.text(`VENDA N°: ${vendaData.referencia || ''}`, 40, 120);
            doc.text(`CONTRATADA: Mondial Hotéis e Transportes LTDA`, 40, 135);
            doc.text(`CONTRATANTE: ${vendaData.clienteNome || ''}`, 40, 150);
            doc.text(`CNPJ: 31.191.812/0001-95`, 555, 135, { align: 'right' });
            doc.text(`CPF/CNPJ: ${(clienteData && (clienteData.cpf || clienteData.cnpj)) || ''}`, 555, 150, { align: 'right' });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            y = 180;

            clausulasDoContrato.forEach(clausula => {
                 const lines = doc.splitTextToSize(clausula, 515);
                 if (y + (lines.length * 12) > 800) {
                     doc.addPage();
                     drawHeader(doc.internal.getNumberOfPages());
                     y = 120;
                 }
                 doc.text(lines, 40, y);
                 y += (lines.length * 12) + 6; // Adiciona um pequeno espaço entre parágrafos
            });

            const refClean = (vendaData.referencia || '').replace('#','');
            const cliente = (vendaData.clienteNome || '').replace(/[^\p{L}\p{N}\s-]/gu,'').trim().replace(/\s+/g,'_');
            doc.save(`Contrato-Venda-${refClean}-${cliente || 'Cliente'}.pdf`);
        };

        gerarContratoBtn?.addEventListener('click', async () => {
            // Coleta dos dados no mesmo padrão do Voucher
            const vendaData = {
                referencia: document.getElementById('ref').value || '',
                dataVenda: document.getElementById('data-venda').value || '',
                vendedorPrincipalNome: document.getElementById('vendedor-principal').value || '',
                clienteNome: document.getElementById('clienteNome').value || '',
                observacoes: document.getElementById('observacoes-gerais').value || '',
                periodoViagem: document.getElementById('servico-periodo').value || '',
                valorTotal: (() => {
                    const t = document.getElementById('valor-total');
                    if (t) {
                        const v = parseFloat(String(t.value).replace(',','.'));
                        return isNaN(v) ? 0 : v;
                    }
                    return 0;
                })(),
                servicos: []
            };

            // Percorre serviços e coleta infos relevantes (mesmo que no voucher)
            try {
                servicosContainer.querySelectorAll('.servico-card').forEach(card => {
                    const tipo = card.dataset.serviceType;
                    const servico = { tipo, passageiros: [] };

                    if (tipo === 'aereo') {
                        servico.localizador = card.querySelector('.servico-field1')?.value || '';
                        const voos = [];
                        card.querySelectorAll('.voos-list .voo-item').forEach(v => {
                            voos.push({
                                data: v.dataset.data,
                                origem: v.dataset.origem,
                                destino: v.dataset.destino,
                                numero: v.dataset.numero
                            });
                        });
                        servico.voos = voos;
                    } else if (tipo === 'hospedagem') {
                        servico.hotel = card.querySelector('.servico-field1')?.value || '';
                        servico.checkin = card.querySelector('.servico-field2')?.value || '';
                        servico.checkout = card.querySelector('.servico-field3')?.value || '';
                        servico.regime = card.querySelector('.servico-field4')?.value || '';
                    } else if (tipo === 'terrestre') {
                        servico.trecho = card.querySelector('.servico-field1')?.value || '';
                        servico.data = card.querySelector('.servico-field2')?.value || '';
                        servico.horario = card.querySelector('.servico-field3')?.value || '';
                    } else {
                        servico.descricao = card.querySelector('.servico-field1')?.value || '';
                    }

                    // Passageiros
                    card.querySelectorAll('.passageiro-row').forEach(paxRow => {
                        const chk = paxRow.querySelector('.passageiro-selecionado');
                        if (!chk || chk.checked) {
                            servico.passageiros.push({
                                nome: paxRow.dataset.paxName || ''
                            });
                        }
                    });

                    vendaData.servicos.push(servico);
                });
            } catch (e) {
                console.warn('Não foi possível coletar serviços para o contrato:', e);
            }

            const clienteId = document.getElementById('clienteId')?.value;
            let clienteData = {};
            if (clienteId && typeof FirebaseService !== 'undefined' && FirebaseService.getCliente) {
                try { clienteData = await FirebaseService.getCliente(clienteId); } catch {}
            }

            if (!vendaData.clienteNome || !clienteId) {
                alert("Selecione um cliente antes de gerar o contrato.");
                return;
            }

            gerarContratoPDF(vendaData, clienteData || {});
        });
        // ===================== FIM: CONTRATO (PDF) ===================== //



        // ---------- Salvar ----------
        saveButton.addEventListener('click', async () => {
            const vendaData = {
                referencia:  refInput.value,
                dataVenda:   dataVendaInput.value,
                vendedorPrincipalNome: vendedorPrincipalInput.value,
                clienteNome: clienteNomeInput.value,
                clienteId:   clienteIdInput.value,
                status:      "Pré-venda",
                dataCriacao: new Date().toISOString(),
                periodoViagem: document.getElementById('servico-periodo').value || '',
                observacoes: document.getElementById('observacoes-gerais').value || '',
                pedidos: [],
                servicos: [],
                planoPagamentos: [],
                vendedores: []
            };

            // Coletar pedidos
            pedidosList.querySelectorAll('.pedido-item').forEach(item => {
                vendaData.pedidos.push({
                    descricao: item.dataset.desc || '',
                    responsavel: item.dataset.resp || '',
                    data: item.dataset.data || ''
                });
            });

            // Validações
            if (!vendaData.dataVenda) { alert('A Data da Venda é obrigatória.'); return; }
            if (!vendaData.vendedorPrincipalNome) { alert('O Vendedor Principal é obrigatório.'); return; }
            if (!vendaData.clienteNome) { alert('O Cliente é obrigatório.'); return; }

            // Serviços
            servicosContainer.querySelectorAll('.servico-card').forEach(card => {
                const tipo = card.dataset.serviceType;

                const fornecedorSelect = card.querySelector('.servico-fornecedor');
                const fornecedorId = fornecedorSelect?.value || '';
                const fornecedorNome = fornecedorSelect?.options[fornecedorSelect.selectedIndex]?.text || '';

                const servico = {
                    tipo,
                    fornecedorId,
                    fornecedorNome,
                    valorVenda: parseFloat(card.querySelector('.valor-venda').value) || 0,
                    valorCusto: parseFloat(card.querySelector('.valor-custo').value) || 0,
                    passageiros: []
                };

                if (tipo === 'aereo') {
                    servico.localizador = card.querySelector('.servico-field1').value;
                    const voos = [];
                    card.querySelectorAll('.voos-list .voo-item').forEach(v => {
                        voos.push({
                            data: v.dataset.data,
                            cia: v.dataset.cia,
                            numero: v.dataset.numero,
                            origem: v.dataset.origem,
                            destino: v.dataset.destino,
                            partida: v.dataset.partida,
                            chegada: v.dataset.chegada,
                            categoria: v.dataset.categoria,
                            bagagem: v.dataset.bagagem === '1'
                        });
                    });
                    if (voos.length) servico.voos = voos;
                } else if (tipo === 'hotel') {
                    servico.hotel = card.querySelector('.servico-field1').value;
                    servico.regime = card.querySelector('.servico-regime')?.value || '';
                    servico.tipoQuarto = card.querySelector('.servico-tipo-quarto')?.value || '';
                    servico.checkin = card.querySelector('.servico-checkin')?.value || '';
                    servico.checkout = card.querySelector('.servico-checkout')?.value || '';
                } else if (tipo === 'transfer') {
                    servico.descricao = card.querySelector('.servico-field1').value;
                }

                card.querySelectorAll('.passageiro-row').forEach(paxRow => {
                    const chk = paxRow.querySelector('.passageiro-selecionado');
                    if (!chk || chk.checked) {
                        servico.passageiros.push({
                            id: paxRow.dataset.paxId,
                            nome: paxRow.dataset.paxName,
                            valorVenda: parseFloat(paxRow.querySelector('.passageiro-valor-venda').value) || 0,
                            valorCusto: parseFloat(paxRow.querySelector('.passageiro-valor-custo').value) || 0
                        });
                    }
                });

                vendaData.servicos.push(servico);
            });

            // Plano de pagamentos
            const planoPagamentos = [];
            paymentListBody.querySelectorAll('.payment-row').forEach(row => {
                planoPagamentos.push({
                    quem_recebe:     row.dataset.receiver,
                    forma_pagamento: row.dataset.method,
                    valor:           parseFloat(row.dataset.value) || 0,
                    data_vencimento: row.dataset.dueDate || '',
                    status:          row.dataset.status || 'Pendente',
                    data_liquidacao: row.dataset.paidDate || null
                });
            });
            vendaData.planoPagamentos = planoPagamentos;

            // Comissões
            comissoesContainer.querySelectorAll('.comissao-row').forEach(row => {
                const nome = row.querySelector('.comissao-nome').value;
                const perc = parseFloat(row.querySelector('.comissao-percentual').value) || 0;
                if (nome && perc > 0) vendaData.vendedores.push({ nome, comissaoPerc: perc });
            });

            // Totais
            const totais = VendasCalculos.calcularTotaisVenda(vendaData.servicos);
            vendaData.valorTotal = totais.valorTotal;
            vendaData.custoTotal = totais.custoTotal;
            vendaData.lucro      = totais.lucro;

            try {
                saveButton.textContent = 'Salvando...';
                saveButton.disabled = true;

                const vendaId = await FirebaseService.salvarVenda(currentEditingVendaId, vendaData);

                // Sincroniza plano de pagamentos -> lançamentos
                await FirebaseService.sincronizarPlanoPagamentos(vendaId, vendaData);

                // Lançamentos de comissão
                if (vendaData.lucro > 0 && vendaData.vendedores.length > 0) {
                    for (const vendedor of vendaData.vendedores) {
                        const valorComissao = vendaData.lucro * (vendedor.comissaoPerc / 100);
                        if (valorComissao > 0) {
                            const lancamento = {
                                descricao: `Comissão Venda ${vendaData.referencia} - ${vendedor.nome}`,
                                tipo: 'pagar',
                                status: 'Pendente',
                                valor: valorComissao,
                                valorAberto: valorComissao,
                                vencimento: new Date().toISOString().split('T')[0],
                                favorecidoDevedor: vendedor.nome,
                                vendaRelacionada: vendaId,
                                categoriaNome: "Comissões Vendedores"
                            };
                            await FirebaseService.salvarLancamento(null, lancamento);
                        }
                    }
                }

                // Contas a Pagar (Custo do Fornecedor)
                const custoTotal = vendaData.custoTotal || 0;
                if (custoTotal > 0.01) {
                    const lancamentoPagar = {
                        descricao: `Repasse a fornecedores - Venda ${vendaData.referencia}`,
                        tipo: 'pagar',
                        status: 'Pendente',
                        valor: custoTotal,
                        valorAberto: custoTotal,
                        vencimento: new Date().toISOString().split('T')[0],
                        favorecidoDevedor: `Fornecedores da Venda ${vendaData.referencia}`,
                        vendaRelacionada: vendaId,
                        categoriaNome: "Repasse Fornecedor"
                    };
                    await FirebaseService.salvarLancamento(null, lancamentoPagar);
                }

                alert('Venda salva com sucesso!');
                App.navigate('vendas');
            } catch (error) {
                alert('Ocorreu um erro ao salvar a venda.');
                console.error(error);
            } finally {
                saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Venda';
                saveButton.disabled = false;
            }
        });

        // Carregar se edição
        if (currentEditingVendaId) { loadVendaIntoForm(currentEditingVendaId); }
    }
};