// modules/clientesForm.js (Versão com salvamento funcional)

const ClientesFormModule = {
    render: () => {
        // O HTML não muda
        return `
            <div class="header">
                <div class="header-body"><h1 id="cliente-form-title">Novo Cliente</h1></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <form id="form-cliente">
                        <div class="card-body">
                            <fieldset><legend>Dados Pessoais</legend><div class="form-row"><div class="form-group"><label for="cliente-nome">Nome Completo</label><input type="text" id="cliente-nome" required></div><div class="form-group"><label for="cliente-cpf">CPF</label><input type="text" id="cliente-cpf"></div></div><div class="form-row"><div class="form-group"><label for="cliente-nascimento">Data de Nascimento</label><input type="date" id="cliente-nascimento"></div></div></fieldset>
                            <fieldset><legend>Contato</legend><div class="form-row"><div class="form-group"><label for="cliente-telefone">Telefone</label><input type="tel" id="cliente-telefone"></div><div class="form-group"><label for="cliente-email">Email</label><input type="email" id="cliente-email"></div></div></fieldset>
                        </div>
                        <div class="card-footer">
                             <button id="voltar-lista-clientes-btn" type="button" class="secondary-button">Voltar</button>
                             <button id="salvar-cliente-btn" class="primary-button" type="button"><i class="fa-solid fa-floppy-disk"></i> Salvar Cliente</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },
    
    init: (clienteIdParaEditar = null) => {
        let currentEditingClientId = clienteIdParaEditar;
        const saveButton = document.getElementById('salvar-cliente-btn');
        const backButton = document.getElementById('voltar-lista-clientes-btn');
        const formTitle = document.getElementById('cliente-form-title');

        const loadClienteIntoForm = async (clienteId) => {
            try {
                const clienteData = await FirebaseService.getCliente(clienteId);
                currentEditingClientId = clienteId;
                document.getElementById('cliente-nome').value = clienteData.nome || '';
                document.getElementById('cliente-cpf').value = clienteData.cpf || '';
                document.getElementById('cliente-nascimento').value = clienteData.nascimento || '';
                document.getElementById('cliente-telefone').value = clienteData.telefone || '';
                document.getElementById('cliente-email').value = clienteData.email || '';
                formTitle.textContent = `Editando Cliente: ${clienteData.nome}`;
            } catch (error) {
                console.error("Erro ao carregar cliente para edição:", error);
                alert("Não foi possível carregar os dados do cliente.");
            }
        };

        // --- EVENT LISTENERS ---
        backButton.addEventListener('click', () => App.navigate('clientes'));

        saveButton.addEventListener('click', async () => {
            // Coleta os dados do formulário
            const clienteData = {
                nome: document.getElementById('cliente-nome').value,
                cpf: document.getElementById('cliente-cpf').value,
                nascimento: document.getElementById('cliente-nascimento').value,
                telefone: document.getElementById('cliente-telefone').value,
                email: document.getElementById('cliente-email').value,
            };

            // Validação simples
            if (!clienteData.nome) {
                alert('O nome do cliente é obrigatório.');
                return;
            }

            try {
                saveButton.textContent = 'Salvando...';
                saveButton.disabled = true;
                await FirebaseService.salvarCliente(currentEditingClientId, clienteData);
                alert('Cliente salvo com sucesso!');
                App.navigate('clientes'); // Volta para a lista
            } catch (error) {
                alert('Ocorreu um erro ao salvar o cliente.');
                console.error(error);
            } finally {
                saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Cliente';
                saveButton.disabled = false;
            }
        });

        if (currentEditingClientId) {
            loadClienteIntoForm(currentEditingClientId);
        }
    }
};