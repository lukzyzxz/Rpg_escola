/* Componentes simples compartilhados pelos módulos V7. */
const NaveUI = {
    esc: v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),
    date: v => v ? new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}) : '',
    status(module) {
        const value=NaveDados.states[module];
        if(value==='ready')return '';
        if(value==='idle'||value==='loading')return '<div class="n-state" role="status">Carregando registros compartilhados…</div>';
        return `<div class="n-state error" role="alert"><span>${this.esc(value)}</span><button type="button" class="n-button" onclick="NaveDados.list('${module}',true).catch(()=>{})">Tentar novamente</button></div>`;
    },
    legacy() {return NaveDados.hasLegacy()?'<div class="n-state legacy"><span>Há registros antigos neste navegador. Você pode adicioná-los aos registros compartilhados.</span><button class="n-button" type="button" onclick="NaveUI.importLegacy()">Revisar importação</button></div>':'';},
    async run(button, operation) {
        if(button?.disabled)return;
        if(button)button.disabled=true;
        try {return await operation();} catch(error) {mostrarNotificacao(NaveDados.message(error),'error');} finally {if(button?.isConnected)button.disabled=false;}
    },
    form(title, body, submit, label='Salvar') {
        abrirModal(`<div class="n-workspace"><div class="n-heading"><h2>${this.esc(title)}</h2><button type="button" onclick="fecharModal()" aria-label="Fechar">×</button></div><form class="n-form" id="n-form">${body}<p id="n-form-error" role="alert" class="n-note"></p><div class="n-actions"><button type="button" onclick="fecharModal()">Cancelar</button><button type="submit" class="primary">${this.esc(label)}</button></div></form></div>`);
        const form=document.getElementById('n-form');
        form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('[type=submit]');if(button.disabled)return;button.disabled=true;document.getElementById('n-form-error').textContent='';try{await submit(form);if(form.isConnected)fecharModal();}catch(error){if(form.isConnected){document.getElementById('n-form-error').textContent=NaveDados.message(error);button.disabled=false;}}});
        form.querySelector('input,textarea,select')?.focus();
    },
    importLegacy() {
        this.form('Importar registros deste navegador','<p>Serão adicionados itens que ainda não existem. Planetas só serão preenchidos se o registro online ainda não tiver sido editado. Quantidades de itens existentes não serão somadas.</p>',async()=>{const r=await NaveDados.importLegacy();mostrarNotificacao(`${r.itens} item(ns) e ${r.planetas} planeta(s) importados. ${r.ignorados} registro(s) já existiam.`);},'Importar registros');
    },
    async history(module,id,title) {
        abrirModal(`<div class="n-workspace"><div class="n-heading"><h2>${this.esc(title)}</h2><button type="button" aria-label="Fechar" onclick="fecharModal()">×</button></div><div id="n-history" role="status">Carregando histórico…</div></div>`);
        const target=document.getElementById('n-history');
        try{const rows=await NaveDados.history(module,id);if(!target.isConnected)return;target.innerHTML=rows.length?`<ol class="n-history">${rows.map(r=>`<li><strong>${this.esc(r.resumo)}</strong><div>${this.esc(r.autor_nome||'Tripulante')}</div><time>${this.date(r.criado_em)}</time></li>`).join('')}</ol>`:'Nenhuma alteração registrada ainda.';}catch(e){if(target.isConnected)target.textContent=NaveDados.message(e);}
    }
};
