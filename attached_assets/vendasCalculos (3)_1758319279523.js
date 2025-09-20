// domain/vendasCalculos.js (Versão Correta e Unificada)

const VendasCalculos = {
    /**
     * Calcula os totais de uma venda com base em seus serviços.
     * @param {Array} servicos - Uma lista de objetos de serviço. Cada objeto deve ter 'valorVenda' e 'valorCusto'.
     * @returns {Object} - Um objeto com valorTotal, custoTotal e lucro.
     */
    calcularTotaisVenda: (servicos) => {
        const totais = servicos.reduce((acc, servico) => {
            acc.valorTotal += servico.valorVenda || 0;
            acc.custoTotal += servico.valorCusto || 0;
            return acc;
        }, { valorTotal: 0, custoTotal: 0 });

        totais.lucro = totais.valorTotal - totais.custoTotal;
        return totais;
    },

    /**
     * Calcula a idade a partir de uma data de nascimento.
     * @param {string} dataNascimento - A data de nascimento no formato 'YYYY-MM-DD'.
     * @returns {number|string} - A idade calculada ou uma string vazia.
     */
    calcularIdade: (dataNascimento) => {
        if (!dataNascimento) return '';
        try {
            const hoje = new Date();
            const nascimento = new Date(dataNascimento);
            // Verifica se a data é válida
            if (isNaN(nascimento.getTime())) return '';

            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }
            return idade >= 0 ? idade : '';
        } catch (e) {
            console.error("Erro ao calcular idade:", e);
            return ''; // Retorna vazio se a data for inválida
        }
    }
};