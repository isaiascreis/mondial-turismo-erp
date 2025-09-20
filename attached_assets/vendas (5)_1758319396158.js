// modules/vendas.js (Corrigido + filtros atualizados + normalização de status)

const VendasModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body">
                    <h1>Vendas</h1>
                    <button id="nova-venda-btn" class="primary-button">
                        <i class="fa-solid fa-plus"></i> Nova Venda
                    </button>
                </div>
            </div>
            <div class="content-body">
                <div class="card">
                    <div class="card-header">
                        <h3>Filtros</h3>
                    </div>
                    <div class="card-body">
                        <div class="filters-container">
                            <input type="text" id="filtro-cliente" placeholder="Filtrar por nome do cliente...">
                            <select id="filtro-status">
                                <option value="">Todos os Status</option>
                                <option value="Pré-venda">Pré-venda</option>
                                <option value="Confirmado">Confirmado</option>
                                <option value="Cancelada">Cancelada</option>
                            </select>
                            <button id="limpar-filtros-btn">Limpar</button>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>Vendas Salvas</h3>
                    </div>
                    <div class="card-body table-responsive">
                        <table class="sales-table">
                            <thead>
                                <tr>
                                    <th>Referência</th>
                                    <th>Cliente</th>
                                    <th>Valor Total</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="sales-list-body">
                                <tr><td colspan="5">Carregando vendas...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        const salesListBody   = document.getElementById('sales-list-body');
        const novaVendaButton = document.getElementById('nova-venda-btn');
        const filtroCliente   = document.getElementById('filtro-cliente');
        const filtroStatus    = document.getElementById('filtro-status');
        const limparBtn       = document.getElementById('limpar-filtros-btn');

        const formatCurrency = (value) =>
            (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        let vendasCache = null;

        const aplicaFiltros = (vendas) => {
            if (!vendas) return null;
            const byId = Object.keys(vendas);
            const nome = (filtroCliente.value || '').toLowerCase().trim();
            const statusFiltro = filtroStatus.value;

            const filtrados = {};
            byId.forEach(id => {
                const v = vendas[id] || {};
                const nomeOk = !nome || (v.clienteNome || '').toLowerCase().includes(nome);
                const statusOk = !statusFiltro || (v.status === statusFiltro);
                if (nomeOk && statusOk) filtrados[id] = v;
            });
            return filtrados;
        };

        const renderSalesList = (sales) => {
            salesListBody.innerHTML = '';
            if (!sales || Object.keys(sales).length === 0) {
                salesListBody.innerHTML = '<tr><td colspan="5">Nenhuma venda encontrada.</td></tr>';
                return;
            }

            Object.keys(sales).forEach(saleId => {
                const saleData = sales[saleId] || {};
                // normaliza classe para "pré-venda" -> "pre-venda" (remove acento no 'é')
                const statusClass = (saleData.status || '')
                    .toLowerCase()
                    .replace('é', 'e');

                const row = `
                    <tr>
                        <td>${saleData.referencia || 'N/A'}</td>
                        <td>${saleData.clienteNome || 'N/A'}</td>
                        <td>${formatCurrency(saleData.valorTotal)}</td>
                        <td><span class="status ${statusClass}">${saleData.status || 'N/A'}</span></td>
                        <td>
                            <button class="action-button edit-button" data-id="${saleId}">
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button class="action-button delete-button" data-id="${saleId}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                salesListBody.insertAdjacentHTML('beforeend', row);
            });
        };

        // Navegação
        novaVendaButton.addEventListener('click', () => App.navigate('vendasForm'));

        // Ações da lista
        salesListBody.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.action-button');
            if (!targetButton) return;

            const vendaId = targetButton.dataset.id;
            if (targetButton.classList.contains('delete-button')) {
                const isConfirmed = confirm('Tem certeza que deseja excluir esta venda permanentemente?');
                if (isConfirmed) FirebaseService.excluirVenda(vendaId);
            } else if (targetButton.classList.contains('edit-button')) {
                App.navigate('vendasForm', vendaId);
            }
        });

        // Filtros
        const reRender = () => renderSalesList(aplicaFiltros(vendasCache));
        filtroCliente.addEventListener('input', reRender);
        filtroStatus.addEventListener('change', reRender);
        limparBtn.addEventListener('click', () => {
            filtroCliente.value = '';
            filtroStatus.value = '';
            reRender();
        });

        // Listener Firebase
        FirebaseService.listarVendas((vendas) => {
            vendasCache = vendas || null;
            reRender();
        });
    }
};
