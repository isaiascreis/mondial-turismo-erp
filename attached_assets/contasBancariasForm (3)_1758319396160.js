// modules/contasBancariasForm.js (Versão Final Completa e Funcional Unificada)

const ContasBancariasFormModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body"><h1 id="conta-form-title">Nova Conta Bancária</h1></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <form id="form-conta-bancaria">
                        <div class="card-body">
                            <fieldset>
                                <legend>Dados da Conta</legend>
                                <div class="form-group">
                                    <label for="conta-nome">Nome da Conta</label>
                                    <input type="text" id="conta-nome" placeholder="Ex: Bradesco CC, Caixa Agência" required>
                                </div>
                                <div class="form-group">
                                    <label for="conta-saldo-inicial">Saldo Inicial</label>
                                    <input type="number" id="conta-saldo-inicial" placeholder="0,00" step="0.01" required>
                                </div>
                            </fieldset>
                        </div>
                        <div class="card-footer">
                            <button id="voltar-lista-contas-btn" type="button" class="secondary-button">Voltar</button>
                            <button id="salvar-conta-btn" class="primary-button" type="button">
                                <i class="fa-solid fa-floppy-disk"></i> Salvar Conta
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    init: (contaIdParaEditar = null) => {
        let currentEditingId = contaIdParaEditar;

        const formTitle  = document.getElementById('conta-form-title');
        const nomeInput  = document.getElementById('conta-nome');
        const saldoInput = document.getElementById('conta-saldo-inicial');

        // Voltar para listagem
        document.getElementById('voltar-lista-contas-btn')
            .addEventListener('click', () => App.navigate('contasBancarias'));

        // Carrega dados no formulário quando for edição
        const loadContaIntoForm = async (id) => {
            try {
                const data = await FirebaseService.getContaBancaria(id);
                currentEditingId = id;
                nomeInput.value  = data.nome || '';
                saldoInput.value = data.saldo ?? 0;
                // Em edição, geralmente o saldo não deve ser alterado diretamente
                saldoInput.disabled = true;
                formTitle.textContent = "Editando Conta Bancária";
            } catch (error) {
                alert("Não foi possível carregar os dados da conta.");
                App.navigate('contasBancarias');
            }
        };

        // Salvar conta (novo ou editar)
        document.getElementById('salvar-conta-btn').addEventListener('click', async () => {
            const dados = {
                nome:  nomeInput.value,
                saldo: parseFloat(saldoInput.value) || 0
            };

            if (!dados.nome) {
                alert('O nome da conta é obrigatório.');
                return;
            }

            try {
                await FirebaseService.salvarContaBancaria(currentEditingId, dados);
                alert('Conta salva com sucesso!');
                App.navigate('contasBancarias');
            } catch (error) {
                console.error(error);
                alert('Ocorreu um erro ao salvar a conta.');
            }
        });

        if (currentEditingId) {
            loadContaIntoForm(currentEditingId);
        }
    }
};
