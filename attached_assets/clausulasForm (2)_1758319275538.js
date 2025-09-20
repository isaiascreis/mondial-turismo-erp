// modules/clausulasForm.js
const ClausulasFormModule = {
    render: () => {
        return `
            <div class="header">
                <div class="header-body"><h1>Cláusulas dos Documentos</h1></div>
            </div>
            <div class="content-body">
                <div class="card">
                    <form id="form-clausulas">
                        <div class="card-body">
                            <fieldset>
                                <legend>Cláusulas do Contrato de Viagem</legend>
                                <div class="form-group">
                                    <label for="clausulas-contrato">
                                        Insira o texto completo do contrato. Cada parágrafo ou item (1., 1.1., etc.) deve ser separado por uma quebra de linha (Enter).
                                    </label>
                                    <textarea id="clausulas-contrato" rows="20" placeholder="Cole aqui as cláusulas do seu contrato..."></textarea>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Observações do Voucher</legend>
                                <div class="form-group">
                                    <label for="clausulas-voucher">
                                        Insira as observações e regras que devem aparecer no rodapé do voucher.
                                    </label>
                                    <textarea id="clausulas-voucher" rows="10" placeholder="Cole aqui as observações do voucher..."></textarea>
                                </div>
                            </fieldset>
                        </div>
                        <div class="card-footer">
                            <button id="voltar-config-btn" type="button" class="secondary-button">Voltar</button>
                            <button id="salvar-clausulas-btn" class="primary-button" type="button">
                                <i class="fa-solid fa-floppy-disk"></i> Salvar Cláusulas
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },
    init: async () => {
        const contratoTextarea = document.getElementById('clausulas-contrato');
        const voucherTextarea = document.getElementById('clausulas-voucher');
        const saveButton = document.getElementById('salvar-clausulas-btn');
        const backButton = document.getElementById('voltar-config-btn');

        // Carrega as cláusulas salvas
        try {
            const clausulas = await FirebaseService.getClausulas();
            contratoTextarea.value = clausulas.contrato || '';
            voucherTextarea.value = clausulas.voucher || '';
        } catch (error) {
            console.error("Erro ao carregar cláusulas:", error);
            alert("Não foi possível carregar as cláusulas salvas.");
        }

        backButton.addEventListener('click', () => App.navigate('configuracoes'));

        saveButton.addEventListener('click', async () => {
            const dados = {
                contrato: contratoTextarea.value,
                voucher: voucherTextarea.value,
            };

            try {
                saveButton.textContent = 'Salvando...';
                saveButton.disabled = true;
                await FirebaseService.salvarClausulas(dados);
                alert('Cláusulas salvas com sucesso!');
            } catch (error) {
                console.error("Erro ao salvar cláusulas:", error);
                alert('Ocorreu um erro ao salvar as cláusulas.');
            } finally {
                saveButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Cláusulas';
                saveButton.disabled = false;
            }
        });
    }
};