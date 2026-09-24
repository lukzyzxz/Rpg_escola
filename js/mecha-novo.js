/* Segundo projeto de mecha. A configuração antiga não é lida nem alterada aqui. */
const MechaNovoUI = (() => {
    const R = MechaNovoRegras;
    const esc = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const $ = id => document.getElementById(id);
    let config, ficha, usuario, arquivo, imagemUrl = '', carregado = false, salvando = false, versao = 0, versaoFicha = 0;
    const padrao = id => ({ usuario_id: id, nome: 'NOVO MECHA', descricao: '', imagem_path: null, cabeca: null, torso: null, bracos: null, pernas: null, kaijus_derrotados: [], armas_simples: true, carta_dupla: 'A' });
    const abas = atual => `<nav class="mecha-novo-abas" aria-label="Projetos de mecha"><button type="button" class="n-button" ${atual === 'antigo' ? 'aria-current="page"' : ''} onclick="abrirPagina('mechas')">Mecha original</button><button type="button" class="n-button" ${atual === 'novo' ? 'aria-current="page"' : ''} onclick="abrirPagina('mecha-novo')">Novo mecha · novas peças</button></nav>`;
    function resumo(base, projeto) {
        const r = R.calcular(base, projeto);
        return `<div class="mecha-novo-resumo">
            <div class="mecha-atributos"><div><small>VIDA</small><strong>${r.vida}</strong></div><div><small>DANO EXTRA</small><strong>${r.dano_extra}</strong></div><div><small>DEFESA</small><strong>${r.defesa}</strong></div><div><small>AGILIDADE</small><strong>${r.agilidade}</strong></div></div>
            <h4>Níveis originais da ficha</h4><div class="mecha-novo-tabela"><table><thead><tr><th>Classe</th><th>Nível</th></tr></thead><tbody>${R.classes.map(classe => `<tr><th>${classe[0].toUpperCase() + classe.slice(1)}</th><td><strong>${r.base[classe]}</strong></td></tr>`).join('')}</tbody></table></div>
            <p class="mecha-novo-ajuda">Cada fórmula usa estes níveis originais. As peças alteram atributos, sem aumentar níveis nem multiplicar bônus de outras peças.</p>
            <div class="mecha-novo-formula"><strong>Cálculo por peça</strong>${r.calculos.map(c => `<p><b>${esc(R.nomesSlots[c.slot])} → ${esc(c.atributo)}</b><br>${esc(c.formula)} = ${c.valor}</p>`).join('')}</div>
            ${r.efeitos.length ? `<div class="mecha-novo-formula"><strong>Efeitos adicionais da planilha</strong>${r.efeitos.map(e => `<p>${esc(e)}</p>`).join('')}<small>São aplicados diretamente aos atributos, sem alterar os níveis usados nas fórmulas.</small></div>` : ''}
            <div class="mecha-novo-formula"><strong>Vida total</strong><p>(${r.vidaTorso} do torso ${r.vidaExtra >= 0 ? '+' : '−'} ${Math.abs(r.vidaExtra)} dos efeitos) × ${1 + r.percentualVida / 100} = <b>${r.vida} vida</b></p><small>Os totais ficam no mínimo em zero.</small></div>
            ${!r.completo ? '<p class="mecha-novo-aviso">Escolha um torso para definir a vida do novo mecha.</p>' : ''}
            <div class="mecha-lista-passivas">${r.passivas.map(p => `<div class="mecha-passiva"><strong>${esc(p.nome)}</strong><p>${esc(p.texto)}</p></div>`).join('')}</div>
        </div>`;
    }
    function tela() {
        return `<section class="mecha-pagina mecha-novo-pagina">${abas('novo')}
            <div class="mecha-topo"><div><span class="mecha-selo">PARTES KAIJUS · VERSÃO FINAL</span><h2>Novo mecha</h2><p>Cabeça define defesa, torso define vida, pernas definem agilidade e braços definem dano extra. Cada fórmula usa os níveis originais da ficha.</p></div></div>
            <p id="novo-mecha-status" role="status" aria-live="polite">Carregando seu novo mecha…</p>
            <form id="novo-mecha-form"><fieldset id="novo-mecha-campos" disabled><div class="mecha-layout"><div class="mecha-coluna-principal">
                <article class="mecha-painel mecha-formulario"><h3>Identidade do novo mecha</h3><label for="novo-mecha-nome">Nome</label><input type="text" id="novo-mecha-nome" maxlength="60" required value="NOVO MECHA"><label for="novo-mecha-descricao">Notas do projeto</label><textarea id="novo-mecha-descricao" maxlength="1200" rows="3"></textarea><label for="novo-mecha-imagem">Imagem do novo mecha (até 5 MB)</label><input id="novo-mecha-imagem" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><div id="novo-mecha-preview" class="mecha-novo-preview"></div></article>
                <article class="mecha-painel"><h3>Kaijus derrotados</h3><p class="mecha-novo-ajuda">Marque os kaijus que você derrotou para liberar suas peças neste projeto.</p><div id="novo-mecha-kaijus" class="mecha-novo-kaijus"></div></article>
                <article class="mecha-painel"><h3>Novas peças</h3><div id="novo-mecha-slots" class="mecha-slots"></div></article>
                <article class="mecha-painel mecha-formulario"><h3>Condições de combate</h3><label class="mecha-novo-check"><input id="novo-mecha-simples" type="checkbox"> Estou usando armas simples</label><p class="mecha-novo-ajuda">Ativa o multiplicador ×3 dos braços do Urso e permite a mordida.</p><label for="novo-mecha-carta">Carta com dano dobrado pela cabeça da Hidra</label><select id="novo-mecha-carta">${['A','2','3','4','5','6','7','8','9','10','J','Q','K'].map(c => `<option>${c}</option>`).join('')}</select><p class="mecha-novo-ajuda">Só tem efeito se a cabeça da Hidra estiver equipada.</p></article>
            </div><aside class="mecha-resumo"><div class="mecha-resumo-sticky"><span class="mecha-resumo-selo">FICHA DO NOVO MECHA</span><div id="novo-mecha-resumo"></div><button type="submit" id="novo-mecha-salvar" class="btn-salvar-mecha">SALVAR NOVO MECHA</button><p class="mecha-novo-ajuda">Depois de salvar, estes totais aparecem na Ficha do Tripulante, na seção do novo mecha.</p></div></aside></div></fieldset></form></section>`;
    }
    function status(texto, erro = false) {
        const el = $('novo-mecha-status');
        if (el) { el.textContent = texto; el.classList.toggle('mecha-novo-aviso', erro); }
    }
    function atualizarResumo() {
        if ($('novo-mecha-resumo')) $('novo-mecha-resumo').innerHTML = resumo(ficha, config);
    }
    function alterado() { status('Alterações não salvas. Clique em SALVAR NOVO MECHA.'); atualizarResumo(); }
    function renderizarPecas() {
        $('novo-mecha-kaijus').innerHTML = R.kaijus.map(k => `<label class="mecha-novo-check"><input type="checkbox" data-novo-kaiju="${k.id}" ${config.kaijus_derrotados.includes(k.id) ? 'checked' : ''}>${esc(k.nome)}</label>`).join('');
        $('novo-mecha-slots').innerHTML = R.slots.map(slot => {
            const peca = R.pecas.find(p => p.id === config[slot]);
            return `<div class="mecha-novo-slot"><label for="novo-slot-${slot}">${R.nomesSlots[slot]}</label><select id="novo-slot-${slot}" data-novo-slot="${slot}"><option value="">Sem peça</option>${R.pecas.filter(p => p.slot === slot && config.kaijus_derrotados.includes(p.kaiju)).map(p => `<option value="${p.id}" ${config[slot] === p.id ? 'selected' : ''}>${esc(p.nome)}</option>`).join('')}</select><p>${peca ? esc(peca.texto) : 'Selecione uma nova peça.'}</p></div>`;
        }).join('');
        atualizarResumo();
    }
    function preview(url) { if ($('novo-mecha-preview')) $('novo-mecha-preview').innerHTML = url ? `<img src="${esc(url)}" alt="Design do novo mecha">` : ''; }
    async function iniciar() {
        const token = ++versao;
        usuario = window.usuarioAtual?.id;
        carregado = false; arquivo = null;
        if (imagemUrl.startsWith('blob:')) URL.revokeObjectURL(imagemUrl);
        imagemUrl = '';
        if (!usuario) { status('Entre na sua conta para carregar o novo mecha.', true); return; }
        const uid = usuario;
        const form = $('novo-mecha-form');
        form?.addEventListener('submit', salvar);
        form?.addEventListener('change', mudar);
        form?.addEventListener('input', event => {
            if (!carregado || salvando) return;
            if (event.target.id === 'novo-mecha-nome') config.nome = event.target.value;
            else if (event.target.id === 'novo-mecha-descricao') config.descricao = event.target.value;
            else return;
            alterado();
        });
        try {
            const [projeto, piloto] = await Promise.all([
                supabaseClient.from('mechas_novos').select('*').eq('usuario_id', uid).maybeSingle(),
                supabaseClient.from('fichas_tripulantes').select('id,nivel_embaixador,nivel_combatente,nivel_tripulante').eq('id', uid).single()
            ]);
            if (projeto.error) throw projeto.error;
            if (piloto.error) throw piloto.error;
            if (token !== versao || uid !== window.usuarioAtual?.id || !form.isConnected) return;
            config = { ...padrao(uid), ...projeto.data }; ficha = piloto.data;
            $('novo-mecha-nome').value = config.nome;
            $('novo-mecha-descricao').value = config.descricao;
            $('novo-mecha-simples').checked = config.armas_simples;
            $('novo-mecha-carta').value = config.carta_dupla;
            renderizarPecas();
            carregado = true; $('novo-mecha-campos').disabled = false;
            status('Novo mecha sincronizado. As escolhas do mecha original foram preservadas.');
            if (config.imagem_path) {
                const result = await supabaseClient.storage.from('mechas-designs').createSignedUrl(config.imagem_path, 3600);
                if (token === versao && !arquivo && form.isConnected) { imagemUrl = result.data?.signedUrl || ''; preview(imagemUrl); }
            }
        } catch (erro) { if (token === versao) status(`Não foi possível carregar o novo mecha: ${erro.message}`, true); }
    }
    function mudar(event) {
        if (!carregado || salvando) return;
        const el = event.target;
        if (el.dataset.novoKaiju) {
            const id = el.dataset.novoKaiju;
            config.kaijus_derrotados = el.checked ? [...new Set([...config.kaijus_derrotados, id])] : config.kaijus_derrotados.filter(k => k !== id);
            for (const slot of R.slots) if (R.pecas.some(p => p.id === config[slot] && !config.kaijus_derrotados.includes(p.kaiju))) config[slot] = null;
            renderizarPecas();
        } else if (el.dataset.novoSlot) { config[el.dataset.novoSlot] = el.value || null; renderizarPecas(); }
        else if (el.id === 'novo-mecha-simples') config.armas_simples = el.checked;
        else if (el.id === 'novo-mecha-carta') config.carta_dupla = el.value;
        else if (el.id === 'novo-mecha-imagem') {
            const novo = el.files?.[0]; if (!novo) return;
            if (!['image/png','image/jpeg','image/webp','image/gif'].includes(novo.type) || novo.size > 5 * 1024 * 1024) { el.value = ''; status('Use PNG, JPG, WEBP ou GIF de até 5 MB.', true); return; }
            arquivo = novo;
            if (imagemUrl.startsWith('blob:')) URL.revokeObjectURL(imagemUrl);
            imagemUrl = URL.createObjectURL(novo); preview(imagemUrl);
        }
        alterado();
    }
    async function salvar(event) {
        event.preventDefault();
        if (!carregado || salvando || usuario !== window.usuarioAtual?.id) return;
        const token = versao, form = $('novo-mecha-form');
        const dados = { ...config, nome: config.nome.trim() || 'NOVO MECHA', atualizado_em: new Date().toISOString() };
        salvando = true; $('novo-mecha-campos').disabled = true; status('Salvando novo mecha…');
        try {
            if (arquivo) {
                const ext = { 'image/png':'png', 'image/jpeg':'jpg', 'image/webp':'webp', 'image/gif':'gif' }[arquivo.type];
                const path = `${usuario}/novo-mecha-${crypto.randomUUID()}.${ext}`;
                const result = await supabaseClient.storage.from('mechas-designs').upload(path, arquivo, { upsert: false, contentType: arquivo.type });
                if (result.error) throw result.error;
                dados.imagem_path = path;
            }
            const result = await supabaseClient.from('mechas_novos').upsert(dados, { onConflict: 'usuario_id' }).select().single();
            if (result.error) throw result.error;
            if (token !== versao || usuario !== window.usuarioAtual?.id) return;
            config = result.data; arquivo = null;
            if (form.isConnected) { $('novo-mecha-imagem').value = ''; status('Novo mecha salvo. Os atributos e efeitos estão disponíveis na sua ficha.'); }
        } catch (erro) { if (token === versao && form.isConnected) status(`Não foi possível salvar: ${erro.message}. Suas escolhas continuam na tela.`, true); }
        finally { salvando = false; if (token === versao && form.isConnected) $('novo-mecha-campos').disabled = false; }
    }
    async function renderizarNaFicha(base) {
        const alvo = $('ficha-novo-mecha'); if (!alvo || !base?.id) return;
        const token = ++versaoFicha, uid = window.usuarioAtual?.id;
        alvo.textContent = 'Carregando ficha do novo mecha…';
        try {
            const { data, error } = await supabaseClient.from('mechas_novos').select('*').eq('usuario_id', base.id).maybeSingle();
            if (token !== versaoFicha || uid !== window.usuarioAtual?.id || !alvo.isConnected) return;
            if (error) throw error;
            alvo.innerHTML = data ? `<h3>${esc(data.nome)} · ficha do novo mecha</h3><p class="mecha-novo-ajuda">Atributos calculados por peça a partir dos níveis originais das missões.</p>${resumo(base, data)}` : '<h3>Ficha do novo mecha</h3><p>Este tripulante ainda não salvou um novo mecha.</p>';
        } catch (erro) { if (token === versaoFicha && alvo.isConnected) alvo.textContent = `Não foi possível carregar a ficha do novo mecha: ${erro.message}`; }
    }
    document.addEventListener('usuarioAutenticado', () => { ++versao; ++versaoFicha; carregado = false; config = null; ficha = null; });
    return { tela, iniciar, abas, resumo, renderizarNaFicha };
})();
