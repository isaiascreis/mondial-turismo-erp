// modules/clientes.js (Com Ações de Editar e Excluir)

const ClientesModule = {
    render: () => {
        // O HTML não muda
        return `
            <div class="header">
                <div class="header-body"><h1>Clientes</h1><button id="novo-cliente-btn" class="primary-button"><i class="fa-solid fa-plus"></i> Novo Cliente</button></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <div class="card-header"><h3>Filtros</h3></div>
                    <div class="card-body">
                        <div class="filters-container">
                            <input type="text" id="filtro-nome-cliente" placeholder="Filtrar por nome ou CPF...">
                            <button id="limpar-filtros-btn">Limpar</button>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header"><h3>Clientes Cadastrados</h3></div>
                    <div class="card-body table-responsive">
                        <table class="sales-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Telefone</th>
                                    <th>Email</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="client-list-body">
                                <tr><td colspan="5">Carregando clientes...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        const novoClienteButton = document.getElementById('novo-cliente-btn');
        const clientListBody = document.getElementById('client-list-body');

        const renderClientList = (clients) => {
            clientListBody.innerHTML = '';
            if (!clients) {
                clientListBody.innerHTML = '<tr><td colspan="5">Nenhum cliente cadastrado.</td></tr>';
                return;
            }
            const clientIds = Object.keys(clients);
            clientIds.forEach(clientId => {
                const clientData = clients[clientId];
                const row = `
                    <tr>
                        <td>${clientData.nome || ''}</td>
                        <td>${clientData.cpf || ''}</td>
                        <td>${clientData.telefone || ''}</td>
                        <td>${clientData.email || ''}</td>
                        <td>
                            <button class="action-button edit-cliente-btn" data-id="${clientId}"><i class="fa-solid fa-pencil"></i></button>
                            <button class="action-button delete-cliente-btn" data-id="${clientId}"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                clientListBody.insertAdjacentHTML('beforeend', row);
            });
        };
        
        // --- EVENT LISTENERS ---
        novoClienteButton.addEventListener('click', () => {
            App.navigate('clientesForm');
        });

        clientListBody.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.action-button');
            if (!targetButton) return;

            const clienteId = targetButton.dataset.id;
            
            if (targetButton.classList.contains('edit-cliente-btn')) {
                // Navega para o formulário, passando o ID para edição
                App.navigate('clientesForm', clienteId);
            } 
            
            if (targetButton.classList.contains('delete-cliente-btn')) {
                // Pede confirmação e exclui o cliente
                const isConfirmed = confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.');
                if (isConfirmed) {
                    FirebaseService.excluirCliente(clienteId).catch(err => {
                        alert('Erro ao excluir cliente.');
                        console.error(err);
                    });
                }
            }
        });
        
        FirebaseService.listarClientes(renderClientList);
    }
};