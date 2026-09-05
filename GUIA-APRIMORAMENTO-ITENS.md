# Oficina de Aprimoramento

Veja **LEIA-PRIMEIRO-INTEGRACAO.md** para instalar a atualização. Execute somente **EXECUTAR-APENAS-INTEGRACAO-ITENS-V5.sql** sobre o banco da versão atual.

1. Na Ficha do Tripulante, adicione os equipamentos em Todos os Itens e salve.
2. Na oficina, selecione um equipamento da sua conta.
3. Com pelo menos 1 Salva-Vidas, clique em APRIMORAR ITEM.
4. O giro consome 1 Salva-Vidas e sorteia uma categoria ainda disponível: Capacidade de Cartas, Aprimoramento de Atributo ou Atributo Adicional.
5. As probabilidades de raridade são 70% comum, 20% incomum e 10% raro. Cada categoria aceita uma melhoria por item.

Os IDs dos equipamentos são salvos no Supabase; os resultados dos aprimoramentos são locais ao navegador. A aplicação automática dos efeitos ao combate fica para a próxima etapa.

O catálogo pode ser editado em js/aprimoramentos.js, no array CATALOGO_ITENS_APRIMORAMENTO. Preserve IDs existentes para manter as seleções já salvas.
