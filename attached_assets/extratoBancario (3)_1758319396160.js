// modules/extratoBancario.js (Versão Final Completa e Funcional, unificada)

const ExtratoBancarioModule = {
    render: () => {
        // O preenchimento do nome da conta e saldo é feito no init(conta)
        return `
            <div class="header">
                <div class="header-body">
                    <div>
                        <h1>Extrato: <span id="extrato-nome-conta">...</span></h1>
                        <h2 class="saldo-header">Saldo Atual: <span id="extrato-saldo-atual">R$ 0,00</span></h2>
                    </div>
                    <button id="voltar-contas-btn" class="secondary-button">
                        <i class="fa-solid fa-arrow-left"></i> Voltar para Contas
                    </button>
                </div>
            </div>
            <div class="content-body">
                <div class="card">
                    <div class="card-header"><h3>Transações Registradas</h3></div>
                    <div class="card-body table-responsive">
                        <table class="sales-table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Descrição</th>
                                    <th>Valor</th>
                                    <th>Conciliado</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="extrato-list-body">
                                <tr><td colspan="5">Carregando transações...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init: (conta) => {
        // Garante params do roteador
        if (!conta || !conta.id) {
            App.navigate('contasBancarias');
            return;
        }

        const formatCurrency = (value) =>
            (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Preenche cabeçalho com dados da conta
        const nomeEl = document.getElementById('extrato-nome-conta');
        const saldoEl = document.getElementById('extrato-saldo-atual');
        if (nomeEl) nomeEl.textContent = conta.nome || '(sem nome)';
        if (saldoEl) saldoEl.textContent = formatCurrency(conta.saldo);

        // Voltar para Contas
        const voltarBtn = document.getElementById('voltar-contas-btn');
        if (voltarBtn) {
            voltarBtn.addEventListener('click', () => App.navigate('contasBancarias'));
        }

        const listBody = document.getElementById('extrato-list-body');

        const renderExtrato = (transacoes) => {
            listBody.innerHTML = '';
            if (!transacoes || Object.keys(transacoes).length === 0) {
                listBody.innerHTML = '<tr><td colspan="5">Nenhuma transação encontrada para esta conta.</td></tr>';
                return;
            }

            // Ordena por data (mais recente primeiro)
            const ordenadas = Object.keys(transacoes).sort((a, b) => {
                const da = transacoes[a]?.data || '';
                const db = transacoes[b]?.data || '';
                return new Date(db) - new Date(da);
            });

            ordenadas.forEach((id) => {
                const tx = transacoes[id] || {};
                const valor = Number(tx.valor) || 0;
                const isDebito = tx.tipo === 'debito';
                const valorClass = isDebito ? 'text-danger' : 'text-success';
                const valorSignal = isDebito ? '- ' : '+ ';
                const dataFormatada = tx.data
                    ? new Date(tx.data + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '';

                const row = `
                    <tr>
                        <td>${dataFormatada}</td>
                        <td>${tx.descricao || ''}</td>
                        <td class="${valorClass}">${valorSignal}${formatCurrency(valor)}</td>
                        <td>
                            <input
                                type="checkbox"
                                class="conciliado-check"
                                data-id="${id}"
                                ${tx.conciliado ? 'checked' : ''}>
                        </td>
                        <td>
                            <button
                                class="action-button edit-lancamento-extrato-btn"
                                data-id="${tx.lancamentoId || ''}"
                                title="Editar Lançamento Original"
                                ${tx.lancamentoId ? '' : 'disabled'}>
                                <i class="fa-solid fa-pencil"></i>
                            </button>
                            <button
                                class="action-button go-to-venda-btn"
                                data-id="${tx.vendaRelacionada || ''}"
                                title="Ir para a Venda"
                                ${tx.vendaRelacionada ? '' : 'disabled'}>
                                <i class="fa-solid fa-tags"></i>
                            </button>
                        </td>
                    </tr>
                `;
                listBody.insertAdjacentHTML('beforeend', row);
            });
        };

        // Eventos: conciliação (change) e navegação (click)
        listBody.addEventListener('change', (event) => {
            const input = event.target.closest('.conciliado-check');
            if (!input) return;
            const id = input.dataset.id;
            FirebaseService.atualizarTransacao(id, { conciliado: input.checked })
                .catch(() => alert('Erro ao atualizar conciliação.'));
        });

        listBody.addEventListener('click', (event) => {
            const editBtn = event.target.closest('.edit-lancamento-extrato-btn');
            if (editBtn) {
                const lancId = editBtn.dataset.id;
                if (lancId) App.navigate('financeiroForm', lancId);
                return;
            }

            const vendaBtn = event.target.closest('.go-to-venda-btn');
            if (vendaBtn) {
                const vendaId = vendaBtn.dataset.id;
                if (vendaId) App.navigate('vendasForm', vendaId);
                return;
            }
        });

        // Listener do Firebase para esta conta
        FirebaseService.listarTransacoesPorConta(conta.id, renderExtrato);
    }
};
