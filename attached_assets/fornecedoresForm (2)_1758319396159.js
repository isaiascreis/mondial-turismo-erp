// modules/fornecedoresForm.js

const FornecedoresFormModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body"><h1 id="fornecedor-form-title">Novo Fornecedor</h1></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <form id="form-fornecedor">
                        <div class="card-body">
                            <fieldset>
                                <legend>Dados Gerais</legend>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="fornecedor-nome">Nome do Fornecedor</label>
                                        <input type="text" id="fornecedor-nome" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="fornecedor-tipo">Tipo</label>
                                        <select id="fornecedor-tipo" required>
                                            <option value="">Selecione...</option>
                                            <option value="Prestador de Serviço">Prestador de Serviço (Hotel, Cia Aérea, etc)</option>
                                            <option value="Operadora/Consolidadora">Operadora/Consolidadora</option>
                                        </select>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Contato</legend>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="fornecedor-contato-nome">Nome do Contato</label>
                                        <input type="text" id="fornecedor-contato-nome">
                                    </div>
                                    <div class="form-group">
                                        <label for="fornecedor-contato-telefone">Telefone</label>
                                        <input type="tel" id="fornecedor-contato-telefone">
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                        <div class="card-footer">
                             <button id="voltar-lista-fornecedores-btn" type="button" class="secondary-button">Voltar</button>
                             <button id="salvar-fornecedor-btn" class="primary-button" type="button"><i class="fa-solid fa-floppy-disk"></i> Salvar Fornecedor</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },
    
    init: (fornecedorIdParaEditar = null) => {
        let currentEditingId = fornecedorIdParaEditar;
        const saveButton = document.getElementById('salvar-fornecedor-btn');
        const backButton = document.getElementById('voltar-lista-fornecedores-btn');
        const formTitle = document.getElementById('fornecedor-form-title');

        const loadFornecedorIntoForm = async (id) => {
            try {
                const data = await FirebaseService.getFornecedor(id);
                currentEditingId = id;
                document.getElementById('fornecedor-nome').value = data.nome || '';
                document.getElementById('fornecedor-tipo').value = data.tipo || '';
                document.getElementById('fornecedor-contato-nome').value = data.contatoNome || '';
                document.getElementById('fornecedor-contato-telefone').value = data.contatoTelefone || '';
                formTitle.textContent = `Editando Fornecedor: ${data.nome}`;
            } catch (error) {
                alert("Não foi possível carregar os dados do fornecedor.");
            }
        };

        backButton.addEventListener('click', () => App.navigate('fornecedores'));

        saveButton.addEventListener('click', async () => {
            const data = {
                nome: document.getElementById('fornecedor-nome').value,
                tipo: document.getElementById('fornecedor-tipo').value,
                contatoNome: document.getElementById('fornecedor-contato-nome').value,
                contatoTelefone: document.getElementById('fornecedor-contato-telefone').value,
            };

            if (!data.nome || !data.tipo) {
                alert('Nome e Tipo são obrigatórios.');
                return;
            }

            try {
                await FirebaseService.salvarFornecedor(currentEditingId, data);
                alert('Fornecedor salvo com sucesso!');
                App.navigate('fornecedores');
            } catch (error) {
                alert('Ocorreu um erro ao salvar o fornecedor.');
                console.error(error);
            }
        });

        if (currentEditingId) {
            loadFornecedorIntoForm(currentEditingId);
        }
    }
};