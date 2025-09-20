// modules/contasBancarias.js (Unificado e Final)

const ContasBancariasModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body">
                    <h1>Contas Bancárias</h1>
                    <div>
                        <button id="voltar-financeiro-btn" class="secondary-button" style="margin-right: 1rem;">
                            <i class="fa-solid fa-arrow-left"></i> Voltar
                        </button>
                        <button id="nova-conta-btn" class="primary-button">
                            <i class="fa-solid fa-plus"></i> Nova Conta
                        </button>
                    </div>
                </div>
            </div>
            <div class="content-body">
                <div class="card">
                    <div class="card-header"><h3>Suas Contas</h3></div>
                    <div class="card-body" id="contas-bancarias-list">
                        <p>Carregando contas...</p>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        document.getElementById('voltar-financeiro-btn')
            .addEventListener('click', () => App.navigate('financeiro'));
        document.getElementById('nova-conta-btn')
            .addEventListener('click', () => App.navigate('contasBancariasForm'));
        
        const listContainer = document.getElementById('contas-bancarias-list');
        const formatCurrency = (value) =>
            (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let allContas = {};

        const renderList = (contas) => {
            allContas = contas || {};
            listContainer.innerHTML = '';
            if (!allContas || Object.keys(allContas).length === 0) {
                listContainer.innerHTML = '<p class="empty-state">Nenhuma conta bancária cadastrada.</p>';
                return;
            }

            const container = document.createElement('div');
            container.className = 'contas-grid';

            Object.keys(allContas).forEach((id) => {
                const conta = allContas[id] || {};
                container.innerHTML += `
                    <div class="conta-card">
                        <div class="conta-card-header">
                            <span>${conta.nome || '(sem nome)'}</span>
                            <div class="conta-card-actions">
                                <button class="action-button edit-conta-btn" data-id="${id}" title="Editar">
                                    <i class="fa-solid fa-pencil"></i>
                                </button>
                                <button class="action-button delete-conta-btn" data-id="${id}" title="Excluir">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="conta-card-body">
                            <span class="saldo-label">Saldo</span>
                            <span class="saldo-valor">${formatCurrency(conta.saldo)}</span>
                        </div>
                        <div class="card-footer">
                            <button class="secondary-button view-extrato-btn" data-id="${id}">Ver Extrato</button>
                        </div>
                    </div>
                `;
            });

            listContainer.appendChild(container);
        };

        listContainer.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.action-button, .view-extrato-btn');
            if (!targetButton) return;

            const id = targetButton.dataset.id;

            if (targetButton.classList.contains('edit-conta-btn')) {
                App.navigate('contasBancariasForm', id);
                return;
            }

            if (targetButton.classList.contains('delete-conta-btn')) {
                if (confirm('Tem certeza que deseja excluir esta conta bancária?')) {
                    FirebaseService.excluirContaBancaria(id)
                        .catch(() => alert('Erro ao excluir.'));
                }
                return;
            }

            if (targetButton.classList.contains('view-extrato-btn')) {
                // Passa o objeto completo da conta como params
                App.navigate('extratoBancario', { id, ...(allContas[id] || {}) });
                return;
            }
        });

        FirebaseService.listarContasBancarias(renderList);
    }
};
