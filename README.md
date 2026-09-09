# Atualização atual: Codex V8.4 e missões V9

Integra os 27 equipamentos (incluindo cinco Codex), escolhas persistentes de ataques,
edição das missões e visual do sistema estelar.

Em **Missões → Abrir detalhes → Editar missão**, altere os textos, a classe e a
recompensa. **Sem nível ganho** mantém a conclusão, mas retira os níveis e bônus
daquela missão, inclusive dos jogadores que já a concluíram. Reativar a recompensa
restaura os bônus. As missões existentes continuam com recompensa até serem editadas.
Missões oficiais são editáveis pelos tripulantes autenticados; as pessoais, somente
pelo autor. Edições têm histórico e proteção contra alterações simultâneas.

Sobre V7, aplicar `EXECUTAR-ATUALIZACAO-ITENS-CODEX-V8.sql` e depois
`ATUALIZAR-MISSOES-V9.sql`. Essas atualizações já foram aplicadas ao projeto RPGescola.
O ajuste pontual de integridade de 14 para 15 e a liberação de uma tentativa foram
registrados no histórico do banco, sem mudar o intervalo normal de recuperação.

Validação: 53 testes aprovados. A prévia visual local foi bloqueada pelo navegador
da sessão; o novo CSS ainda precisa de conferência visual no site publicado.

---

## Histórico V6

Instalação, demonstração e regras em **LEIA-PRIMEIRO-COMBATE-V6.md**. A atualização do banco é **EXECUTAR-COMBATE-AUTOMATICO-V6.sql**, aplicada sobre a integração V5. O conteúdo abaixo documenta o projeto original.

---

Nave 3B — Central de Comando

Site publicado em: https://lukzyzxz.github.io/Rpg_escola/

Configuração das novas funções:
`GUIA-ATUALIZACAO-INTEGRIDADE-E-MECHAS.md`
