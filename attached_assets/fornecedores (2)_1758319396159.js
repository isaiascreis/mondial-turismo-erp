// modules/fornecedores.js

const FornecedoresModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body">
                    <h1>Fornecedores</h1>
                    <button id="novo-fornecedor-btn" class="primary-button">
                        <i class="fa-solid fa-plus"></i> Novo Fornecedor
                    </button>
                </div>
            </div>
            <div class="content-body">
                <div class="card">
                    <div class="card-header"><h3>Fornecedores Cadastrados</h3></div>
                    <div class="card-body table-responsive">
                        <table class="sales-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Contato</th>
                                    <th>Telefone</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="fornecedores-list-body">
                                <tr><td colspan="5">Carregando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        const novoFornecedorButton = document.getElementById('novo-fornecedor-btn');
        const listBody = document.getElementById('fornecedores-list-body');

        novoFornecedorButton.addEventListener('click', () => {
            App.navigate('fornecedoresForm');
        });

        const renderList = (fornecedores) => {
            listBody.innerHTML = '';
            if (!fornecedores) {
                listBody.innerHTML = '<tr><td colspan="5">Nenhum fornecedor cadastrado.</td></tr>';
                return;
            }
            const ids = Object.keys(fornecedores);
            ids.forEach(id => {
                const data = fornecedores[id];
                const row = `
                    <tr>
                        <td>${data.nome || ''}</td>
                        <td>${data.tipo || ''}</td>
                        <td>${data.contatoNome || ''}</td>
                        <td>${data.contatoTelefone || ''}</td>
                        <td>
                            <button class="action-button edit-fornecedor-btn" data-id="${id}"><i class="fa-solid fa-pencil"></i></button>
                            <button class="action-button delete-fornecedor-btn" data-id="${id}"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
                listBody.insertAdjacentHTML('beforeend', row);
            });
        };

        listBody.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.action-button');
            if (!targetButton) return;

            const id = targetButton.dataset.id;
            
            if (targetButton.classList.contains('edit-fornecedor-btn')) {
                App.navigate('fornecedoresForm', id);
            } 
            
            if (targetButton.classList.contains('delete-fornecedor-btn')) {
                if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
                    FirebaseService.excluirFornecedor(id).catch(err => alert('Erro ao excluir.'));
                }
            }
        });
        
        FirebaseService.listarFornecedores(renderList);
    }
};