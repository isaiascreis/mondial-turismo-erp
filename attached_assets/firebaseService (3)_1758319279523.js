// services/firebaseService.js

const firebaseConfig = {
  apiKey: "AIzaSyBeobzj8n3ag50h0JPzAbVYU3DuA1Xr0_c",
  authDomain: "mondialsistemamodular.firebaseapp.com",
  projectId: "mondialsistemamodular",
  databaseURL: "https://mondialsistemamodular-default-rtdb.firebaseio.com/",
  // Dica: normalmente o bucket do Storage é *.appspot.com. Se tiver erro no Storage, troque para:
  // storageBucket: "mondialsistemamodular.appspot.com",
  storageBucket: "mondialsistemamodular.firebasestorage.app",
  messagingSenderId: "1002534872354",
  appId: "1:1002534872354:web:1076e92f69fbfcf86c717b"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage  = firebase.storage(); // <= ADICIONADO: inicialização do Storage (compat)

const FirebaseService = {
  // ------------------------
  // VENDAS
  // ------------------------
  salvarVenda: (vendaId, dadosVenda) => {
    if (!vendaId) {
      const novaVendaRef = database.ref('erp/vendas').push();
      return novaVendaRef.set(dadosVenda).then(() => novaVendaRef.key);
    } else {
      return database.ref('erp/vendas/' + vendaId).update(dadosVenda).then(() => vendaId);
    }
  },

  listarVendas: (callback) => {
    database.ref('erp/vendas').on('value', (snapshot) => callback(snapshot.val()));
  },

  excluirVenda: (vendaId) => {
    return database.ref('erp/vendas/' + vendaId).remove();
  },

  getVenda: (vendaId) => {
    return database.ref('erp/vendas/' + vendaId).get().then((s) => {
      if (s.exists()) { return s.val(); }
      else { throw new Error("Venda não encontrada."); }
    });
  },

  // ------------------------
  // CLIENTES
  // ------------------------
  salvarCliente: (clienteId, dadosCliente) => {
    if (!clienteId) {
      const novoClienteRef = database.ref('erp/clientes').push();
      return novoClienteRef.set(dadosCliente).then(() => novoClienteRef.key);
    } else {
      return database.ref('erp/clientes/' + clienteId).update(dadosCliente).then(() => clienteId);
    }
  },

  listarClientes: (callback) => {
    database.ref('erp/clientes').on('value', (snapshot) => callback(snapshot.val()));
  },

  excluirCliente: (clienteId) => {
    return database.ref('erp/clientes/' + clienteId).remove();
  },

  getCliente: (clienteId) => {
    return database.ref('erp/clientes/' + clienteId).get().then((s) => {
      if (s.exists()) { return s.val(); }
      else { throw new Error("Cliente não encontrado."); }
    });
  },

  // ------------------------
  // FORNECEDORES
  // ------------------------
  salvarFornecedor: (id, dados) => {
    if (!id) {
      const novaRef = database.ref('erp/fornecedores').push();
      return novaRef.set(dados).then(() => novaRef.key);
    } else {
      return database.ref('erp/fornecedores/' + id).update(dados).then(() => id);
    }
  },

  listarFornecedores: (callback) => {
    database.ref('erp/fornecedores').on('value', (snapshot) => callback(snapshot.val()));
  },

  excluirFornecedor: (id) => {
    return database.ref('erp/fornecedores/' + id).remove();
  },

  getFornecedor: (id) => {
    return database.ref('erp/fornecedores/' + id).get().then((s) => {
      if (s.exists()) { return s.val(); }
      else { throw new Error("Fornecedor não encontrado."); }
    });
  },

  // ------------------------
  // FINANCEIRO (LANÇAMENTOS)
  // ------------------------
  salvarLancamento: (id, dados) => {
    if (!id) {
      const novaRef = database.ref('erp/lancamentos').push();
      return novaRef.set(dados).then(() => novaRef.key);
    } else {
      return database.ref('erp/lancamentos/' + id).update(dados).then(() => id);
    }
  },

  listarLancamentos: (callback) => {
    database.ref('erp/lancamentos').on('value', (snapshot) => callback(snapshot.val()));
  },

  excluirLancamento: (id) => {
    return database.ref('erp/lancamentos/' + id).remove();
  },

  getLancamento: (id) => {
    return database.ref('erp/lancamentos/' + id).get().then((s) => {
      if (s.exists()) { return s.val(); }
      else { throw new Error("Lançamento não encontrado."); }
    });
  },

  // ------------------------
  // SINCRONIZAÇÃO PLANO DE PAGAMENTOS -> LANÇAMENTOS
  // ------------------------
  sincronizarPlanoPagamentos: async (vendaId, vendaData) => {
    const refLanc = database.ref('erp/lancamentos');

    // Apaga os antigos dessa origem
    const snap = await refLanc.orderByChild('vendaRelacionada').equalTo(vendaId).get();
    const updates = {};
    if (snap.exists()) {
      snap.forEach((child) => {
        const val = child.val() || {};
        if (val.origem === 'planoPagamentos') {
          updates[`erp/lancamentos/${child.key}`] = null;
        }
      });
    }

    // Cria os novos
    (vendaData.planoPagamentos || []).forEach((p, idx) => {
      const key = refLanc.push().key;
      const tipo = p.quem_recebe === 'AGENCIA' ? 'receber' : 'pagar';
      const categoria = tipo === 'receber' ? 'Receitas de Vendas' : 'Repasse a Fornecedores';
      const descBase = tipo === 'receber' ? 'Receber cliente' : 'Repasse a fornecedores';
      const descricao = `${descBase} - Venda ${vendaData.referencia || ''} (parcela ${idx + 1})`;

      updates[`erp/lancamentos/${key}`] = {
        descricao,
        tipo,
        status: p.status || 'Pendente',
        valor: Number(p.valor || 0),
        valorAberto: Number(p.valor || 0),
        vencimento: p.data_vencimento || new Date().toISOString().split('T')[0],
        favorecidoDevedor: tipo === 'receber' ? (vendaData.clienteNome || 'Cliente') : (p.favorecido || 'Fornecedor'),
        formaPagamento: p.forma_pagamento || '',
        vendaRelacionada: vendaId,
        categoriaNome: categoria,
        origem: 'planoPagamentos'
      };
    });

    return database.ref().update(updates);
  },

  // ------------------------
  // PLANO DE CONTAS
  // ------------------------
  getPlanoDeContas: () => {
    return database.ref('erp/planoDeContas').get().then((snapshot) => {
      return snapshot.val() || { grupos: {}, categorias: {} };
    });
  },

  salvarPlanoDeContas: (plano) => {
    return database.ref('erp/planoDeContas').set(plano);
  },

  // ------------------------
  // CONTAS BANCÁRIAS
  // ------------------------
  salvarContaBancaria: (id, dados) => {
    if (!id) {
      const novaRef = database.ref('erp/contasBancarias').push();
      return novaRef.set(dados).then(() => novaRef.key);
    } else {
      return database.ref('erp/contasBancarias/' + id).update(dados).then(() => id);
    }
  },

  listarContasBancarias: (callback) => {
    database.ref('erp/contasBancarias').on('value', (snapshot) => callback(snapshot.val()));
  },

  excluirContaBancaria: (id) => {
    return database.ref('erp/contasBancarias/' + id).remove();
  },

  getContaBancaria: (id) => {
    return database.ref('erp/contasBancarias/' + id).get().then((snapshot) => {
      if (snapshot.exists()) { return snapshot.val(); }
      else { throw new Error("Conta bancária não encontrada."); }
    });
  },

  // ------------------------
  // LIQUIDAÇÃO
  // ------------------------
  /**
   * Liquida (total/parcial) um lançamento e registra a transação bancária,
   * atualizando o saldo da conta — tudo em uma operação atômica.
   * Além disso, se o lançamento estiver ligado a uma venda, marca a venda como "Confirmado".
   */
  liquidarLancamento: async (lancamentoId, dadosLiquidacao) => {
    const { valorLiquidado, contaBancariaId, dataLiquidacao } = dadosLiquidacao;

    // 1) Buscar lançamento e conta
    const lancamentoRef = database.ref(`erp/lancamentos/${lancamentoId}`);
    const contaBancariaRef = database.ref(`erp/contasBancarias/${contaBancariaId}`);

    const [lancamentoSnapshot, contaSnapshot] = await Promise.all([
      lancamentoRef.get(),
      contaBancariaRef.get()
    ]);

    if (!lancamentoSnapshot.exists() || !contaSnapshot.exists()) {
      throw new Error("Lançamento ou conta bancária não encontrada.");
    }

    const lancamento = { id: lancamentoSnapshot.key, ...lancamentoSnapshot.val() };
    const conta = contaSnapshot.val() || {};

    // 2) Preparar updates
    const updates = {};

    // 2a) Atualizar lançamento (valor aberto + status)
    const baseAberto = Number(lancamento.valorAberto ?? lancamento.valor ?? 0);
    const liquidar = Math.max(0, Number(valorLiquidado || 0));

    let valorAberto = baseAberto - liquidar;
    if (valorAberto < 0.01) valorAberto = 0;

    const novoStatus = valorAberto <= 0 ? 'Liquidado' : 'Parcial';
    updates[`erp/lancamentos/${lancamentoId}/valorAberto`] = valorAberto;
    updates[`erp/lancamentos/${lancamentoId}/status`] = novoStatus;

    // histórico simples
    const histKey = database.ref('noop').push().key;
    updates[`erp/lancamentos/${lancamentoId}/historico/${histKey}`] = {
      data: dataLiquidacao,
      valor: liquidar,
      contaId: contaBancariaId,
      acao: 'liquidacao'
    };

    // 2b) Atualizar saldo da conta + registrar transação
    const saldoAnterior = Number(conta.saldo ?? 0);
    const tipoTransacao = (lancamento.tipo === 'pagar') ? 'debito' : 'credito';
    const saldoNovo = (tipoTransacao === 'debito')
      ? (saldoAnterior - liquidar)
      : (saldoAnterior + liquidar);

    updates[`erp/contasBancarias/${contaBancariaId}/saldo`] = saldoNovo;

    const transacaoKey = database.ref('erp/transacoes').push().key;
    updates[`erp/transacoes/${transacaoKey}`] = {
      contaId: contaBancariaId,
      contaNome: conta.nome || '',
      data: dataLiquidacao,
      tipo: tipoTransacao, // 'debito' ou 'credito'
      valor: liquidar,
      descricao: `Liquidação: ${lancamento.descricao || ''}`,
      lancamentoId,
      saldoAnterior,
      saldoNovo
    };

    // 2c) Se houver venda relacionada, marcar venda como "Confirmado"
    if (lancamento.vendaRelacionada) {
      updates[`erp/vendas/${lancamento.vendaRelacionada}/status`] = 'Confirmado';
    }

    // 3) Commit atômico
    return database.ref().update(updates);
  },

  // ------------------------
  // EXTRATO BANCÁRIO
  // ------------------------
  listarTransacoesPorConta: (contaId, callback) => {
    const transacoesRef = database
      .ref('erp/transacoes')
      .orderByChild('contaId')
      .equalTo(contaId);

    transacoesRef.on('value', (snapshot) => {
      callback(snapshot.val());
    });
  },

  atualizarTransacao: (id, updates) => {
    return database.ref(`erp/transacoes/${id}`).update(updates);
  },

  // ========================================
  // >>> NOVA SEÇÃO: CONFIGURAÇÕES <<<
  // ========================================
  salvarClausulas: (dados) => {
    return database.ref('erp/configuracoes/clausulas').set(dados);
  },

  getClausulas: () => {
    return database.ref('erp/configuracoes/clausulas').get().then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.val();
      }
      // Retorna um objeto padrão se não houver nada salvo ainda
      return { contrato: 'Nenhuma cláusula de contrato cadastrada.', voucher: 'Nenhuma cláusula de voucher cadastrada.' };
    });
  },

  // ------------------------
  // ANEXOS (STORAGE)
  // ------------------------
  // Envia um arquivo para: erp/vendas/{vendaId}/{timestamp_nome.ext} e retorna a URL pública
  uploadAnexoVenda: (vendaId, file) => {
    const anexoRef = storage.ref(`erp/vendas/${vendaId}/${Date.now()}_${file.name}`);
    return anexoRef.put(file).then(snapshot => snapshot.ref.getDownloadURL());
  },

  // Exclui um anexo no Storage a partir da URL salva
  excluirAnexoVenda: (fileUrl) => {
    return storage.refFromURL(fileUrl).delete();
  },
};
