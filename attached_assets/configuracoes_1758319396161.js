// modules/configuracoes.js
(function () {
  const goto = (moduleName) => {
    try {
      if (typeof window.navigate === 'function') window.navigate(moduleName);
      else { location.hash = '#' + moduleName; setTimeout(() => window.dispatchEvent(new Event('hashchange')), 0); }
    } catch(e){ console.warn('[Configurações] navegação falhou:', e); }
  };

  const html = `
    <div class="header">
      <div class="header-body">
        <h1 id="config-title">Configurações</h1>
        <p class="subtitle">Central de ajustes do sistema</p>
      </div>
    </div>
    <div class="content-body">
      <div class="card"><div class="card-body">
        <div class="grid grid-4">
          <button class="config-card" data-target="clientes"><i class="fa-solid fa-users"></i><span>Clientes</span><small>Cadastro e gestão</small></button>
          <button class="config-card" data-target="fornecedores"><i class="fa-solid fa-truck-fast"></i><span>Fornecedores</span><small>Cadastro e gestão</small></button>
          <button class="config-card" data-target="planoContas"><i class="fa-solid fa-list-check"></i><span>Plano de Contas</span><small>Estrutura de contas</small></button>
          <button class="config-card" data-target="contasBancarias"><i class="fa-solid fa-building-columns"></i><span>Contas Bancárias</span><small>Cadastro e conciliação</small></button>
        </div>
        <hr class="divider"/>
        <div class="config-section">
          <h2 class="section-title"><i class="fa-solid fa-file-signature"></i> Documentos & Cláusulas</h2>
          <p class="section-help">Defina textos padrão de contrato e voucher.</p>
          <div class="form-row">
            <div class="form-group">
              <label for="cfg-clausulas-contrato">Cláusulas de Contrato</label>
              <textarea id="cfg-clausulas-contrato" rows="6"></textarea>
            </div>
            <div class="form-group">
              <label for="cfg-clausulas-voucher">Cláusulas de Voucher</label>
              <textarea id="cfg-clausulas-voucher" rows="6"></textarea>
            </div>
          </div>
          <div class="actions">
            <button id="btn-salvar-clausulas" class="primary-button"><i class="fa-solid fa-floppy-disk"></i> Salvar</button>
          </div>
          <p id="cfg-clausulas-feedback" class="info-text" style="margin-top:.5rem;"></p>
        </div>
      </div></div>
    </div>
  `;

  const ConfiguracoesModule = {
    name: 'configuracoes',
    render(){ return html; },
    init(){
      document.querySelectorAll('.config-card').forEach(btn=>{
        btn.addEventListener('click', ()=> goto(btn.getAttribute('data-target')));
      });

      try {
        if (window.firebaseService?.getClausulas) {
          firebaseService.getClausulas().then(cfg=>{
            const c = document.getElementById('cfg-clausulas-contrato');
            const v = document.getElementById('cfg-clausulas-voucher');
            if (c) c.value = cfg?.contrato || '';
            if (v) v.value = cfg?.voucher  || '';
          }).catch(err=>console.warn('[Configurações] getClausulas:', err));
        }
      } catch(e){ console.warn('[Configurações] carregar cláusulas:', e); }

      const btn = document.getElementById('btn-salvar-clausulas');
      const fb  = document.getElementById('cfg-clausulas-feedback');
      btn?.addEventListener('click', async ()=>{
        const contrato = (document.getElementById('cfg-clausulas-contrato')||{}).value || '';
        const voucher  = (document.getElementById('cfg-clausulas-voucher') ||{}).value || '';
        try{
          if (window.firebaseService?.salvarClausulas) {
            await firebaseService.salvarClausulas({ contrato, voucher });
            if (fb){ fb.textContent='Cláusulas salvas com sucesso.'; fb.style.color='green'; }
          } else {
            if (fb){ fb.textContent='Persistência indisponível (firebaseService.salvarClausulas não encontrado).'; fb.style.color='crimson'; }
          }
        } catch(e){
          console.error('[Configurações] salvarClausulas:', e);
          if (fb){ fb.textContent='Falha ao salvar cláusulas.'; fb.style.color='crimson'; }
        }
      });
    }
  };

  // Registro explícito para o router
  window.ConfiguracoesModule = ConfiguracoesModule;
  window.Modules = window.Modules || {};
  window.Modules['configuracoes'] = ConfiguracoesModule;
})();
