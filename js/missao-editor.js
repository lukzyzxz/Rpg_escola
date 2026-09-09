function editarMissaoCatalogo(id) {
    const m = catalogoMissoes.find(m => m.id === id);
    if (!m) return;
    const esc = NaveUI.esc;
    const linhas = v => (Array.isArray(v) ? v : []).join('\n');
    NaveUI.form('Editar missão', `
        <label>Título<input name="titulo" required maxlength="200" value="${esc(m.titulo)}"></label>
        <label>Classe<select name="classe">${['Embaixador','Combatente','Tripulante'].map(c=>`<option ${c===m.classe?'selected':''}>${c}</option>`).join('')}</select></label>
        <label>Recompensa<select name="recompensa"><option value="sim" ${m.ganha_nivel!==false?'selected':''}>Com nível ganho</option><option value="nao" ${m.ganha_nivel===false?'selected':''}>Sem nível ganho</option></select></label>
        <p class="n-note">Sem nível ganho retira também os níveis, a vida e os atributos já concedidos por esta missão. As conclusões e os equipamentos são preservados.</p>
        <label>Resumo<textarea name="resumo" maxlength="5000">${esc(m.resumo)}</textarea></label>
        <label>Período<input name="periodo" maxlength="200" value="${esc(m.periodo)}"></label>
        <label>Data<input name="data_missao" type="date" value="${esc(m.data_missao||'')}"></label>
        <label>Local<input name="planeta" maxlength="200" value="${esc(m.planeta)}"></label>
        <label>Etapas (uma por linha)<textarea name="etapas" maxlength="10000" rows="4">${esc(linhas(m.etapas))}</textarea></label>
        <label>Requisitos (um por linha)<textarea name="requisitos" maxlength="10000" rows="4">${esc(linhas(m.requisitos))}</textarea></label>
        <label>Entrega e validação<textarea name="entrega" maxlength="5000">${esc(m.entrega)}</textarea></label>
        <label class="n-check"><input type="checkbox" required>Conferi as alterações e o efeito sobre as fichas.</label>
    `, async form => {
        const d = Object.fromEntries(new FormData(form));
        d.ganha_nivel = d.recompensa === 'sim';
        d.etapas = d.etapas.split('\n').map(s=>s.trim()).filter(Boolean);
        d.requisitos = d.requisitos.split('\n').map(s=>s.trim()).filter(Boolean);
        d.planeta_id = d.planeta === m.planeta ? m.planeta_id : (banco.planetas||[]).find(p=>p.nome.toLowerCase()===d.planeta.trim().toLowerCase())?.id || null;
        const {error} = await supabaseClient.rpc('nave_editar_missao',{p_id:id,p_versao:m.versao||0,p_dados:d});
        if(error) throw Error(error.message);
        await carregarRegistroMissoes();
        mostrarNotificacao('Missão salva. Níveis e bônus recalculados.','success');
    });
}
