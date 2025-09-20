// modules/planoContas.js

const PlanoContasModule = {
    render: () => {
        return `
            <div class="header"><div class="header-body"><h1>Plano de Contas</h1><button id="voltar-financeiro-btn" class="secondary-button"><i class="fa-solid fa-arrow-left"></i> Voltar</button></div></div>
            <div class="content-body"><div class="card"><div class="card-header"><h3>Gerenciar Grupos e Categorias</h3></div><div class="card-body"><p class="text-secondary" style="margin-top: 0;">Aqui você define as categorias para seus lançamentos financeiros.</p><div class="plano-contas-layout"><div class="plano-coluna"><h3>Grupos</h3><div id="grupos-list" class="plano-list"></div><div class="add-form"><input type="text" id="novo-grupo-nome" placeholder="Nome do novo grupo"><select id="novo-grupo-tipo"><option value="Receita">Receita</option><option value="Despesa">Despesa</option></select><button id="add-grupo-btn" class="primary-button">Adicionar Grupo</button></div></div><div class="plano-coluna"><h3>Categorias</h3><div id="categorias-list" class="plano-list"></div><div class="add-form"><input type="text" id="nova-categoria-nome" placeholder="Nome da nova categoria"><select id="select-grupo-pai"></select><button id="add-categoria-btn" class="primary-button">Add Categoria</button></div></div></div></div></div></div>`;
    },
    init: () => {
        document.getElementById('voltar-financeiro-btn').addEventListener('click', () => App.navigate('financeiro'));
        const addGrupoBtn = document.getElementById('add-grupo-btn');
        const addCategoriaBtn = document.getElementById('add-categoria-btn');
        const layoutContainer = document.querySelector('.plano-contas-layout');
        let planoDeContas = { grupos: {}, categorias: {} };
        const render = () => {
            const gruposList = document.getElementById('grupos-list');
            const categoriasList = document.getElementById('categorias-list');
            const selectGrupoPai = document.getElementById('select-grupo-pai');
            gruposList.innerHTML = '';
            categoriasList.innerHTML = '';
            selectGrupoPai.innerHTML = '<option value="">Selecione um grupo</option>';
            const grupos = planoDeContas.grupos || {};
            const categorias = planoDeContas.categorias || {};
            Object.keys(grupos).forEach(id => {
                const grupo = grupos[id];
                gruposList.innerHTML += `<div class="plano-item"><span>${grupo.nome} (${grupo.tipo})</span><button data-id="${id}" class="delete-btn delete-grupo-btn">&times;</button></div>`;
                selectGrupoPai.innerHTML += `<option value="${id}">${grupo.nome}</option>`;
            });
            Object.keys(categorias).forEach(id => {
                const cat = categorias[id];
                const grupoPai = grupos[cat.grupoId];
                categoriasList.innerHTML += `<div class="plano-item"><span>${cat.nome} <i>(Grupo: ${grupoPai?.nome || 'N/A'})</i></span><button data-id="${id}" class="delete-btn delete-categoria-btn">&times;</button></div>`;
            });
        };
        const saveChanges = () => { FirebaseService.salvarPlanoDeContas(planoDeContas).catch(err => alert("Erro ao salvar.")); };
        const carregarPlanoDeContas = async () => {
            try {
                planoDeContas = await FirebaseService.getPlanoDeContas();
                render();
            } catch (error) { console.error("Erro ao carregar plano de contas:", error); alert("Não foi possível carregar o plano de contas."); }
        };
        addGrupoBtn.addEventListener('click', () => {
            const nomeInput = document.getElementById('novo-grupo-nome');
            const tipoSelect = document.getElementById('novo-grupo-tipo');
            if (!nomeInput.value.trim()) { alert("O nome do grupo não pode ser vazio."); return; }
            const novoId = `grp_${Date.now()}`;
            if (!planoDeContas.grupos) planoDeContas.grupos = {};
            planoDeContas.grupos[novoId] = { nome: nomeInput.value, tipo: tipoSelect.value };
            nomeInput.value = '';
            saveChanges();
            render();
        });
        addCategoriaBtn.addEventListener('click', () => {
            const nomeInput = document.getElementById('nova-categoria-nome');
            const grupoSelect = document.getElementById('select-grupo-pai');
            if (!nomeInput.value.trim()) { alert("O nome da categoria não pode ser vazio."); return; }
            if (!grupoSelect.value) { alert("Por favor, selecione um grupo para a categoria."); return; }
            const novoId = `cat_${Date.now()}`;
            if (!planoDeContas.categorias) planoDeContas.categorias = {};
            planoDeContas.categorias[novoId] = { nome: nomeInput.value, grupoId: grupoSelect.value };
            nomeInput.value = '';
            saveChanges();
            render();
        });
        layoutContainer.addEventListener('click', event => {
            const target = event.target.closest('.delete-btn');
            if (!target) return;
            const id = target.dataset.id;
            if (target.classList.contains('delete-grupo-btn')) {
                if(confirm('Atenção: excluir um grupo também removerá todas as categorias associadas a ele. Deseja continuar?')) {
                    delete planoDeContas.grupos[id];
                    Object.keys(planoDeContas.categorias).forEach(catId => {
                        if (planoDeContas.categorias[catId].grupoId === id) { delete planoDeContas.categorias[catId]; }
                    });
                    saveChanges();
                    render();
                }
            }
            if (target.classList.contains('delete-categoria-btn')) {
                delete planoDeContas.categorias[id];
                saveChanges();
                render();
            }
        });
        carregarPlanoDeContas();
    }
};