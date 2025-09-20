// modules/financeiroForm.js (Versão 100% Completa e Funcional)

const FinanceiroFormModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body"><h1 id="financeiro-form-title">Novo Lançamento</h1></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <form id="form-financeiro">
                        <div class="card-body">
                            <fieldset>
                                <legend>Detalhes do Lançamento</legend>
                                <div class="form-group">
                                    <label for="fin-descricao">Descrição</label>
                                    <input type="text" id="fin-descricao" placeholder="Ex: Comissão Vendedor, Repasse Fornecedor" required>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="fin-tipo">Tipo</label>
                                        <select id="fin-tipo"><option value="pagar">Conta a Pagar</option><option value="receber">Conta a Receber</option></select>
                                    </div>
                                    <div class="form-group">
                                        <label for="fin-status">Status</label>
                                        <select id="fin-status"><option value="Pendente">Pendente</option><option value="Liquidado">Liquidado</option></select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="fin-valor">Valor</label>
                                        <input type="number" id="fin-valor" placeholder="0,00" step="0.01" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="fin-vencimento">Data de Vencimento</label>
                                        <input type="date" id="fin-vencimento" required>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        <div class="card-footer">
                             <button id="voltar-lista-financeiro-btn" type="button" class="secondary-button">Voltar</button>
                             <button id="salvar-transacao-btn" class="primary-button" type="button"><i class="fa-solid fa-floppy-disk"></i> Salvar Lançamento</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },
    
    init: (transacaoIdParaEditar = null) => {
        let currentEditingId = transacaoIdParaEditar;
        const backButton = document.getElementById('voltar-lista-financeiro-btn');
        const saveButton = document.getElementById('salvar-transacao-btn');
        const formTitle = document.getElementById('financeiro-form-title');

        const loadLancamentoIntoForm = async (id) => {
            try {
                const data = await FirebaseService.getLancamento(id);
                currentEditingId = id;
                document.getElementById('fin-descricao').value = data.descricao || '';
                document.getElementById('fin-tipo').value = data.tipo || 'pagar';
                document.getElementById('fin-status').value = data.status || 'Pendente';
                document.getElementById('fin-valor').value = data.valor || '';
                document.getElementById('fin-vencimento').value = data.vencimento || '';
                formTitle.textContent = "Editando Lançamento";
            } catch (error) {
                alert("Não foi possível carregar os dados do lançamento.");
                App.navigate('financeiro');
            }
        };

        backButton.addEventListener('click', () => App.navigate('financeiro'));

        saveButton.addEventListener('click', async () => {
            const dados = {
                descricao: document.getElementById('fin-descricao').value,
                tipo: document.getElementById('fin-tipo').value,
                status: document.getElementById('fin-status').value,
                valor: parseFloat(document.getElementById('fin-valor').value) || 0,
                vencimento: document.getElementById('fin-vencimento').value,
            };

            if (!dados.descricao || !dados.valor || !dados.vencimento) {
                alert('Descrição, Valor e Vencimento são obrigatórios.');
                return;
            }

            try {
                await FirebaseService.salvarLancamento(currentEditingId, dados);
                alert('Lançamento salvo com sucesso!');
                App.navigate('financeiro');
            } catch (error) {
                alert('Ocorreu um erro ao salvar.');
                console.error(error);
            }
        });

        if (currentEditingId) {
            loadLancamentoIntoForm(currentEditingId);
        }
    }
};