# Oficina de Aprimoramento

Veja **LEIA-PRIMEIRO-COMBATE-V6.md** para instalar a atualização atual. Sobre a integração V5, execute **EXECUTAR-COMBATE-AUTOMATICO-V6.sql** antes de usar a oficina V6.

1. Na Ficha do Tripulante, adicione os equipamentos em Todos os Itens e salve.
2. Na oficina, selecione um equipamento da sua conta.
3. Com pelo menos 1 Salva-Vidas, clique em APRIMORAR ITEM.
4. O giro consome 1 Salva-Vidas e sorteia uma categoria ainda disponível: Capacidade de Cartas, Aprimoramento de Atributo ou Atributo Adicional.
5. As probabilidades de raridade são 70% comum, 20% incomum e 10% raro. Cada categoria aceita uma melhoria por item.

Os equipamentos e os resultados dos aprimoramentos são salvos no Supabase. O custo e o resultado de cada giro são gravados juntos. Ao abrir a oficina na própria conta, os resultados antigos daquele navegador são enviados ao servidor sem nova cobrança. Resultados já existentes no servidor prevalecem.

A nova arena importa os aprimoramentos para as cartas. Cartas adicionais e sobreposição de equipamentos precisam ser escolhidas na preparação; depois os efeitos configurados são contabilizados ao resolver as rodadas.

O catálogo pode ser editado em js/aprimoramentos.js, no array CATALOGO_ITENS_APRIMORAMENTO. Preserve IDs existentes para manter as seleções já salvas.
