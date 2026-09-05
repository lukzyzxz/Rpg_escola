/* Dados compartilhados da nave. O servidor confirma cada alteração antes da tela mudar. */
const NaveDados = (() => {
    const states = { planetas: 'idle', inventario: 'idle', catalogo: 'idle' };
    const inFlight = new Map(), photos = new Map(), operations = new Map();
    let session = null, epoch = 0, channel = null, refreshTimer = null;
    let legacy = null;
    const tables = { planetas: 'nave_planetas', inventario: 'nave_inventario', catalogo: 'nave_itens_catalogo' };
    const uid = () => window.usuarioAtual?.id;
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const uuid = () => '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
    function emit(module) { document.dispatchEvent(new CustomEvent('naveDadosAtualizados', {detail: {module, states: {...states}}})); }
    function message(error) {
        if (error?.code === '23505') return 'Já existe um registro com esse nome. Atualize a lista para conferir.';
        if (['42P01','42703','PGRST202','PGRST204','PGRST205'].includes(error?.code)) return 'Esta área precisa da atualização do banco. Siga o guia V7 e tente novamente.';
        if (/fetch|network|load failed/i.test(error?.message || '')) return 'Sem conexão com o servidor. A alteração não foi confirmada; atualize antes de tentar novamente.';
        return error?.message || 'Não foi possível concluir. Tente novamente.';
    }
    async function request(name, args) {
        if (!uid()) throw Error('Entre na sua conta para salvar.');
        const user = uid(), generation = epoch;
        const r = await supabaseClient.rpc(name, args);
        if (r.error) throw Object.assign(Error(message(r.error)),{code:r.error.code});
        if (user !== uid() || generation !== epoch) throw Error('A conta mudou. Reabra esta área para continuar.');
        return r.data;
    }
    async function list(module, force = false) {
        if (!uid()) return [];
        if (inFlight.has(module)) return inFlight.get(module);
        if (!force && states[module] === 'ready') return module === 'catalogo' ? CATALOGO_ITENS_APRIMORAMENTO : banco[module];
        const generation = epoch, user = uid(); states[module] = 'loading'; emit(module);
        const promise = (async () => {
            try {
                let query = supabaseClient.from(tables[module]).select('*');
                if(module==='inventario')query=query.eq('arquivado',false);
                const r = await query.order(module === 'inventario' ? 'nome' : 'ordem');
                if (r.error) throw r.error;
                if (generation !== epoch || user !== uid()) return [];
                const rows = r.data || [];
                if (module === 'catalogo') CATALOGO_ITENS_APRIMORAMENTO.splice(0, CATALOGO_ITENS_APRIMORAMENTO.length, ...rows.map(r => ({...r.definicao, id:r.id, nome:r.nome})));
                else banco[module] = rows;
                states[module] = 'ready'; emit(module); return rows;
            } catch (error) {
                if (generation === epoch) { states[module] = message(error); emit(module); }
                throw Error(message(error));
            } finally { if (generation === epoch) inFlight.delete(module); }
        })();
        inFlight.set(module, promise); return promise;
    }
    function applyRow(module,row) { const current=banco[module].find(r=>r.id===row.id);if(current&&current.versao>row.versao)return current;const rows=banco[module].filter(r=>r.id!==row.id);if(!row.arquivado)rows.push(row);banco[module]=rows.sort((a,b)=>module==='inventario'?a.nome.localeCompare(b.nome,'pt-BR'):a.ordem-b.ordem);states[module]='ready';emit(module);return row; }
    async function savePlanet(record) {
        const saved = await request('nave_salvar_planeta', {p_id:record.id || null, p_versao:record.versao ?? null, p_dados:record});
        return applyRow('planetas',saved);
    }
    async function saveItem(record) {
        const saved = await request('nave_salvar_item', {p_id:record.id || null, p_versao:record.versao ?? null, p_dados:record});
        return applyRow('inventario',saved);
    }
    async function quantity(item, delta) {
        const key=uid()+':stock:'+item.id, pending=operations.get(key);
        if(pending&&pending.delta!==delta)throw Error('Repita a última movimentação para confirmar o resultado antes de mudar a quantidade.');
        const operation=pending||{delta,id:uuid()};operations.set(key,operation);
        try {const saved = await request('nave_movimentar_item', {p_id:item.id, p_delta:delta, p_operacao:operation.id});
        operations.delete(key);return applyRow('inventario',saved);
        }catch(error){if(error.code)operations.delete(key);throw error;}
    }
    async function archiveItem(item) {
        const saved=await request('nave_arquivar_item', {p_id:item.id, p_versao:item.versao});return applyRow('inventario',saved);
    }
    async function history(module, id) {
        const r = await supabaseClient.from('nave_eventos').select('id,acao,criado_em,autor_nome,resumo').eq('modulo',module).eq('registro_id',String(id)).order('id',{ascending:false}).limit(30);
        if (r.error) throw Error(message(r.error)); return r.data || [];
    }
    function legacyData() {
        if (!legacy) { try { legacy = JSON.parse(localStorage.getItem('nave3b_db') || '{}'); } catch { legacy = {}; } }
        return {planetas: Array.isArray(legacy.planetas) ? legacy.planetas : [], itens: Array.isArray(legacy.inventario) ? legacy.inventario : []};
    }
    function legacyKey() { const text = JSON.stringify(legacyData()); let hash=2166136261; for (let i=0;i<text.length;i++) hash=Math.imul(hash ^ text.charCodeAt(i),16777619); return (hash>>>0).toString(16); }
    function hasLegacy() {
        const d = legacyData();
        try { if (localStorage.getItem('nave7-importado-'+uid()+'-'+legacyKey())) return false; } catch {}
        return d.itens.length > 0 || d.planetas.some(p=>Number(p.id)>1&&p.desbloqueado || Number(p.id)===1&&(p.nome!=='Verdejante'||p.descricao!=='Primeiro planeta disponível para exploração.'));
    }
    async function importLegacy() {
        const d = legacyData(); const result = await request('nave_importar_legado', {p_chave:legacyKey(),p_planetas:d.planetas,p_itens:d.itens});
        try { localStorage.setItem('nave7-importado-'+uid()+'-'+legacyKey(),'1'); } catch {}
        await Promise.allSettled([list('planetas',true),list('inventario',true)]); return result;
    }
    async function imageUrl(source) {
        if (!source?.path || !['mechas-designs','kaijus-imagens'].includes(source.bucket)) return '';
        const key=source.bucket+'/'+source.path, cached=photos.get(key); if(cached?.until>Date.now())return cached.url;
        try { const r=await supabaseClient.storage.from(source.bucket).createSignedUrl(source.path,3600); if(r.error)return ''; const url=r.data?.signedUrl||''; if(url)photos.set(key,{url,until:Date.now()+3000000}); return url; } catch {return '';}
    }
    async function hydrateKaijus(rows) {
        await Promise.all(rows.map(async k=>{if(k.imagem_storage?.path)k.imagem_url=await imageUrl(k.imagem_storage); else k.imagem_url=k.imagem_path;})); return rows;
    }
    async function kaijus() {
        const r=await supabaseClient.from('mecha_kaijus_catalogo').select('*').order('ordem'); if(r.error)throw Error(message(r.error)); return hydrateKaijus(r.data||[]);
    }
    async function uploadKaiju(file) {
        if(!uid())throw Error('Entre na sua conta.');
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4000000)throw Error('Envie PNG, JPG ou WEBP de até 4 MB.');
        const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[file.type]; const path=uid()+'/'+uuid()+'.'+ext;
        const r=await supabaseClient.storage.from('kaijus-imagens').upload(path,file,{contentType:file.type,upsert:false}); if(r.error)throw Error(message(r.error)); return {bucket:'kaijus-imagens',path};
    }
    async function removeUpload(source) { if(source?.path?.startsWith(uid()+'/'))await supabaseClient.storage.from('kaijus-imagens').remove([source.path]); }
    async function boot() {
        if (!uid()) return;
        if (session === uid()) return;
        reset(); session=uid();const generation=epoch;
        await Promise.allSettled(['planetas','inventario','catalogo'].map(m=>list(m,true)));
        if (!session||generation!==epoch) return;
        channel=supabaseClient.channel('nave-v7-'+session).on('postgres_changes',{event:'*',schema:'public',table:'nave_planetas'},()=>schedule('planetas')).on('postgres_changes',{event:'*',schema:'public',table:'nave_inventario'},()=>schedule('inventario')).on('postgres_changes',{event:'*',schema:'public',table:'nave_itens_catalogo'},()=>schedule('catalogo')).subscribe();
    }
    const pending=new Set();
    function schedule(module) { pending.add(module); clearTimeout(refreshTimer); refreshTimer=setTimeout(()=>{for(const m of pending)list(m,true).catch(()=>{});pending.clear();},200); }
    function reset() {epoch++;session=null;inFlight.clear();photos.clear();operations.clear();clearTimeout(refreshTimer);pending.clear();if(channel){supabaseClient.removeChannel(channel);channel=null;}for(const key of Object.keys(states))states[key]='idle';if(typeof banco!=='undefined'){banco.planetas=[];banco.inventario=[];}}
    document.addEventListener('usuarioAutenticado',()=>boot());
    document.addEventListener('usuarioDesconectado',reset);
    window.addEventListener('online',()=>{if(uid())for(const m of Object.keys(states))list(m,true).catch(()=>{});});
    return {states,list,request,savePlanet,saveItem,quantity,archiveItem,history,hasLegacy,importLegacy,kaijus,hydrateKaijus,imageUrl,uploadKaiju,removeUpload,esc,uuid,message,boot};
})();
