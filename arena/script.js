const TEAM_ID = document.body.dataset.team || "equipe1";
const KEY = "arena-" + TEAM_ID + "-v1";
const PLAYER_TYPES = ["warrior", "archer", "mage", "cleric"];
const LOBBY_BOSS_BY_TEAM = {
  equipe1: "boss1",
  equipe2: "boss1",
  equipe3: "boss2",
  equipe4: "boss2"
};
const LOBBY_BOSS_ID = LOBBY_BOSS_BY_TEAM[TEAM_ID];
const LOBBY_PREFIX = "arena-lobby-";
const FLEET_SELECTION_KEY = "arena-frota-combate-v1";


/* ==================================================
   ESTADO
   ================================================== */

const state = JSON.parse(
  localStorage.getItem(KEY) || "{}"
);


function save() {

  localStorage.setItem(
    KEY,
    JSON.stringify(state)
  );

}


/* ==================================================
   SINCRONIZAR O KAIJU ESCOLHIDO NO LOBBY
   ================================================== */

if (LOBBY_BOSS_ID) {

  const lobbyImage = localStorage.getItem(
    LOBBY_PREFIX + LOBBY_BOSS_ID + "-image"
  );

  const lobbyName = localStorage.getItem(
    LOBBY_PREFIX + LOBBY_BOSS_ID + "-name"
  );

  if (lobbyImage) {
    state["image-boss"] = lobbyImage;
  }

  if (lobbyName) {
    state["boss-name"] = lobbyName;
  }

  if (lobbyImage || lobbyName) {
    save();
  }

}



/* ==================================================
   SALVAR CAMPOS
   ================================================== */

document
  .querySelectorAll("[data-save]")
  .forEach(element => {

    const key =
      element.dataset.save;


    if (
      state[key] !== undefined
    ) {

      if (
        element.matches(
          "[contenteditable=true]"
        )
      ) {

        element.textContent =
          state[key];

      } else {

        element.value =
          state[key];

      }

    }


    element.addEventListener(
      "input",
      () => {

        state[key] =
          element.matches(
            "[contenteditable=true]"
          )
            ? element.textContent
            : element.value;


        if (key === "boss-name" && LOBBY_BOSS_ID) {

          localStorage.setItem(
            LOBBY_PREFIX + LOBBY_BOSS_ID + "-name",
            element.textContent.trim()
          );

        }


        save();


        if (
          key === "boss-hp" ||
          key === "boss-max"
        ) {

          updateBoss();

        }

      }
    );

  });



/* ==================================================
   IMAGENS
   ================================================== */

function resizeImage(
  src,
  max,
  done
) {

  const image =
    new Image();


  image.onload = () => {

    const scale =
      Math.min(
        1,
        max /
        Math.max(
          image.width,
          image.height
        )
      );


    const canvas =
      document.createElement(
        "canvas"
      );


    canvas.width =
      Math.round(
        image.width * scale
      );


    canvas.height =
      Math.round(
        image.height * scale
      );


    canvas
      .getContext("2d")
      .drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );


    done(
      canvas.toDataURL(
        "image/jpeg",
        .82
      )
    );

  };


  image.src = src;

}



function setImage(
  type,
  data
) {

  state[
    "image-" + type
  ] = data;


  save();


  if (type === "boss" && LOBBY_BOSS_ID) {

    localStorage.setItem(
      LOBBY_PREFIX + LOBBY_BOSS_ID + "-image",
      data
    );

  }


  const element =
    document.getElementById(
      "image-" + type
    );


  if (element) {

    element.textContent = "";
    element.classList.remove(
      "fighter-image-initials",
      "fighter-slot-empty"
    );

    element.style.backgroundImage =
      `url("${data}")`;

  }

}



/* ==================================================
   FROTA ESCOLHIDA NA CENTRAL DA NAVE
   ================================================== */

function applyFleetSelection(selection, registerLog = true) {

  if (
    !selection ||
    !Array.isArray(selection.combatentes)
  ) {
    return;
  }

  const fighters = selection.combatentes.slice(0, 4);

  PLAYER_TYPES.forEach((type, index) => {

    const fighter = fighters[index] || null;
    const nameElement = document.querySelector(
      `[data-save="${type}-name"]`
    );
    const imageElement = document.getElementById("image-" + type);

    if (fighter) {

      const name = fighter.nome || fighter.username || "Tripulante";

      if (nameElement) {
        nameElement.textContent = name;
      }

      state[type + "-name"] = name;

      if (fighter.avatar) {

        if (imageElement) {
          imageElement.textContent = "";
          imageElement.classList.remove(
            "fighter-image-initials",
            "fighter-slot-empty"
          );
        }

        setImage(type, fighter.avatar);

      } else if (imageElement) {

        delete state["image-" + type];
        imageElement.style.backgroundImage = "";
        imageElement.textContent = getFleetInitials(name);
        imageElement.classList.add("fighter-image-initials");
        imageElement.classList.remove("fighter-slot-empty");

      }

      return;
    }

    if (nameElement) {
      nameElement.textContent = "VAGA LIVRE";
    }

    state[type + "-name"] = "VAGA LIVRE";
    delete state["image-" + type];

    if (imageElement) {
      imageElement.style.backgroundImage = "";
      imageElement.textContent = "+";
      imageElement.classList.add("fighter-image-initials", "fighter-slot-empty");
    }

  });

  state["fleet-selection"] = {
    frotaId: selection.frotaId,
    frotaNome: selection.frotaNome,
    frotaCor: selection.frotaCor,
    combatentes: fighters
  };

  save();
  renderFleetBadge(selection);

  if (registerLog) {
    addBattleLog(
      `Frota ${selection.frotaNome || "selecionada"} entrou na Arena com ${fighters.length} combatente${fighters.length === 1 ? "" : "s"}.`
    );
  }

}


function renderFleetBadge(selection) {

  const header = document.querySelector(".arena-header");
  if (!header) return;

  let badge = document.getElementById("fleet-battle-badge");

  if (!badge) {
    badge = document.createElement("section");
    badge.id = "fleet-battle-badge";
    badge.className = "fleet-battle-badge";
    header.insertAdjacentElement("afterend", badge);
  }

  const fighters = Array.isArray(selection.combatentes)
    ? selection.combatentes.slice(0, 4)
    : [];
  const color = /^#[0-9a-f]{3,8}$/i.test(selection.frotaCor || "")
    ? selection.frotaCor
    : "#00eaff";

  badge.style.setProperty("--fleet-color", color);
  badge.innerHTML = `
    <div>
      <small>FROTA EM COMBATE</small>
      <strong>${escapeBattleText(selection.frotaNome || "Frota selecionada")}</strong>
    </div>
    <div class="fleet-battle-members">
      ${fighters.map(fighter => `
        <span title="${escapeBattleText(fighter.nome || "Tripulante")}">
          ${escapeBattleText(getFleetInitials(fighter.nome || fighter.username || "T"))}
        </span>
      `).join("")}
    </div>
  `;

}


function getFleetInitials(name) {

  return String(name || "T")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "T";

}


function initializeSelectedFleet() {

  try {

    const selection = JSON.parse(
      localStorage.getItem(FLEET_SELECTION_KEY) || "null"
    );

    if (selection) {
      applyFleetSelection(selection, false);
    }

  } catch (error) {

    console.warn("Não foi possível carregar a frota selecionada:", error);

  }

}


window.addEventListener("message", event => {

  if (
    event.origin !== window.location.origin ||
    event.data?.tipo !== "NAVE_RPG_FROTA_ARENA"
  ) {
    return;
  }

  applyFleetSelection(event.data.selecao, true);

});



document
  .querySelectorAll("[data-image]")
  .forEach(input => {

    const type =
      input.dataset.image;


    if (
      state[
      "image-" + type
      ]
    ) {

      setImage(
        type,
        state[
        "image-" + type
        ]
      );

    }


    input.addEventListener(
      "change",
      () => {

        const file =
          input.files[0];


        if (!file) {

          return;

        }


        const reader =
          new FileReader();


        reader.onload = () => {

          resizeImage(
            reader.result,
            900,
            data => {

              setImage(
                type,
                data
              );

            }
          );

        };


        reader.readAsDataURL(
          file
        );

      }
    );

  });



/* ==================================================
   CONSOLE, HISTÓRICO E DESFAZER
   ================================================== */

function getFighterName(type) {

  const name = document.querySelector(
    `[data-save="${type}-name"]`
  )?.textContent?.trim();

  return name || type;

}


function getBattleSnapshot() {

  const players = {};

  PLAYER_TYPES.forEach(type => {

    players[type] = Number(
      document.getElementById("hp-" + type)?.value
    ) || 0;

  });

  return {
    players,
    boss: Number(document.getElementById("boss-hp")?.value) || 0
  };

}


function registerSnapshot(description) {

  const history = Array.isArray(state["battle-undo"])
    ? state["battle-undo"]
    : [];

  history.push({
    description,
    snapshot: getBattleSnapshot()
  });

  state["battle-undo"] = history.slice(-20);
  save();

}


function addBattleLog(message) {

  const log = Array.isArray(state["battle-log"])
    ? state["battle-log"]
    : [];

  log.unshift({
    message,
    time: new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  state["battle-log"] = log.slice(0, 18);
  save();
  renderBattleLog();

}


function renderBattleLog() {

  const list = document.getElementById("battle-log-list");
  if (!list) return;

  const log = Array.isArray(state["battle-log"])
    ? state["battle-log"]
    : [];

  list.innerHTML = log.length
    ? log.map(item => `
        <div class="battle-log-item">
          <time>${item.time || "--:--"}</time>
          <span>${escapeBattleText(item.message)}</span>
        </div>
      `).join("")
    : '<p class="battle-log-empty">Nenhuma ação registrada nesta batalha.</p>';

}


function escapeBattleText(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function updateFighterStatus(type) {

  const hp = Number(document.getElementById("hp-" + type)?.value) || 0;
  const max = Math.max(
    1,
    Number(document.getElementById("max-" + type)?.value) || 1
  );
  const card = document.getElementById("hp-" + type)?.closest(".fighter-card");

  if (!card) return;

  card.classList.toggle("fighter-defeated", hp <= 0);
  card.classList.toggle("fighter-critical", hp > 0 && hp / max <= 0.3);

}


function updateAllFighterStatuses() {

  PLAYER_TYPES.forEach(updateFighterStatus);

}


function undoLastBattleAction() {

  const history = Array.isArray(state["battle-undo"])
    ? state["battle-undo"]
    : [];

  const last = history.pop();

  if (!last) {
    alert("Não existe nenhuma alteração de vida para desfazer.");
    return;
  }

  PLAYER_TYPES.forEach(type => {

    const input = document.getElementById("hp-" + type);
    if (!input) return;

    const value = Number(last.snapshot?.players?.[type]) || 0;
    input.value = value;
    state["hp-" + type] = value;

  });

  const bossInput = document.getElementById("boss-hp");
  if (bossInput) {
    const value = Number(last.snapshot?.boss) || 0;
    bossInput.value = value;
    state["boss-hp"] = value;
  }

  state["battle-undo"] = history;
  save();
  updateBoss();
  updateAllFighterStatuses();
  addBattleLog(`Ação desfeita: ${last.description}.`);

}


function createQuickPlayerControls() {

  PLAYER_TYPES.forEach(type => {

    const stats = document.getElementById("hp-" + type)?.closest(".stats");
    if (!stats || stats.querySelector(".quick-hp-control")) return;

    const control = document.createElement("div");
    control.className = "quick-hp-control";
    control.innerHTML = `
      <input type="number" min="1" value="10" aria-label="Valor de dano ou cura">
      <button type="button" data-action="damage">− Dano</button>
      <button type="button" data-action="heal">+ Cura</button>
    `;

    control.addEventListener("click", event => {

      const button = event.target.closest("button[data-action]");
      if (!button) return;

      const input = control.querySelector("input");
      const hpInput = document.getElementById("hp-" + type);
      const maxInput = document.getElementById("max-" + type);
      const amount = Math.max(1, Number(input.value) || 1);
      const oldHp = Number(hpInput.value) || 0;
      const max = Math.max(1, Number(maxInput.value) || 1);
      const isDamage = button.dataset.action === "damage";

      registerSnapshot(
        `${isDamage ? "dano" : "cura"} em ${getFighterName(type)}`
      );

      const newHp = isDamage
        ? Math.max(0, oldHp - amount)
        : Math.min(max, oldHp + amount);

      hpInput.value = newHp;
      state["hp-" + type] = newHp;
      save();
      updateFighterStatus(type);

      addBattleLog(
        `${getFighterName(type)} ${isDamage ? "sofreu" : "recuperou"} ${Math.abs(newHp - oldHp)} de vida.`
      );

    });

    stats.appendChild(control);

  });

}


function initializeBattleConsole() {

  const grid = document.querySelector(".battle-grid");
  if (!grid || document.querySelector(".battle-console")) return;

  const consoleElement = document.createElement("section");
  consoleElement.className = "battle-console";
  consoleElement.innerHTML = `
    <div class="battle-console-header">
      <div>
        <small>REGISTRO TÁTICO</small>
        <h2>CONTROLE DA BATALHA</h2>
      </div>

      <div class="battle-round-control">
        <span>RODADA</span>
        <strong id="battle-round-value">${Number(state["battle-round"]) || 1}</strong>
        <button id="battle-next-round" type="button">Próxima rodada</button>
        <button id="battle-undo" type="button">Desfazer última ação</button>
      </div>
    </div>

    <div id="battle-log-list" class="battle-log-list"></div>
  `;

  grid.insertAdjacentElement("afterend", consoleElement);

  document.getElementById("battle-next-round")?.addEventListener("click", () => {

    const nextRound = (Number(state["battle-round"]) || 1) + 1;
    state["battle-round"] = nextRound;
    save();

    const value = document.getElementById("battle-round-value");
    if (value) value.textContent = nextRound;

    addBattleLog(`Rodada ${nextRound} iniciada.`);

  });

  document.getElementById("battle-undo")?.addEventListener(
    "click",
    undoLastBattleAction
  );

  createQuickPlayerControls();
  renderBattleLog();
  updateAllFighterStatuses();

}



/* ==================================================
   LIMITAR VIDA DOS JOGADORES
   ================================================== */

function limitPlayerHp(type) {

  const hpInput =
    document.getElementById(
      "hp-" + type
    );


  const maxInput =
    document.getElementById(
      "max-" + type
    );


  if (
    !hpInput ||
    !maxInput
  ) {

    return;

  }


  let hp =
    Number(
      hpInput.value
    ) || 0;


  let max =
    Number(
      maxInput.value
    ) || 1;


  max =
    Math.max(
      1,
      max
    );


  hp =
    Math.max(
      0,
      Math.min(
        hp,
        max
      )
    );


  hpInput.value =
    hp;


  maxInput.value =
    max;


  state[
    "hp-" + type
  ] = hp;


  state[
    "max-" + type
  ] = max;


  save();

}



/* ==================================================
   BOTÕES + E -
   ================================================== */

document
  .querySelectorAll(
    ".hp-minus, .hp-plus"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const type =
          button.dataset.hp;


        const hpInput =
          document.getElementById(
            "hp-" + type
          );


        const maxInput =
          document.getElementById(
            "max-" + type
          );


        let hp =
          Number(
            hpInput.value
          ) || 0;


        const oldHp = hp;


        const max =
          Math.max(
            1,
            Number(
              maxInput.value
            ) || 1
          );


        const isHealing = button.classList.contains(
          "hp-plus"
        );


        registerSnapshot(
          `${isHealing ? "cura" : "dano"} em ${getFighterName(type)}`
        );


        if (
          isHealing
        ) {

          if (
            hp < max
          ) {

            hp++;

          }

        } else {

          hp =
            Math.max(
              0,
              hp - 1
            );

        }


        hpInput.value =
          hp;


        state[
          "hp-" + type
        ] = hp;


        save();


        updateFighterStatus(type);


        addBattleLog(
          `${getFighterName(type)} ${isHealing ? "recuperou" : "sofreu"} ${Math.abs(hp - oldHp)} de vida.`
        );

      }
    );

  });



/* ==================================================
   VIDA MANUAL DOS JOGADORES
   ================================================== */

document
  .querySelectorAll(
    '[id^="hp-"]'
  )
  .forEach(input => {

    input.addEventListener(
      "input",
      () => {

        const type =
          input.id.replace(
            "hp-",
            ""
          );


        limitPlayerHp(
          type
        );


        updateFighterStatus(type);

      }
    );

  });



/* ==================================================
   VIDA MÁXIMA DOS JOGADORES
   ================================================== */

document
  .querySelectorAll(
    '[id^="max-"]'
  )
  .forEach(input => {

    input.addEventListener(
      "input",
      () => {

        const type =
          input.id.replace(
            "max-",
            ""
          );


        limitPlayerHp(
          type
        );


        updateFighterStatus(type);

      }
    );

  });



/* ==================================================
   VIDA DO CHEFÃO
   ================================================== */

function updateBoss() {

  const hpInput =
    document.getElementById(
      "boss-hp"
    );


  const maxInput =
    document.getElementById(
      "boss-max"
    );


  if (
    !hpInput ||
    !maxInput
  ) {

    return;

  }


  let hp =
    Number(
      hpInput.value
    ) || 0;


  let max =
    Number(
      maxInput.value
    ) || 1;


  max =
    Math.max(
      1,
      max
    );


  hp =
    Math.max(
      0,
      Math.min(
        hp,
        max
      )
    );


  hpInput.value =
    hp;


  maxInput.value =
    max;


  state["boss-hp"] =
    hp;


  state["boss-max"] =
    max;


  const percentage =
    Math.max(
      0,
      Math.min(
        100,
        (hp / max) * 100
      )
    );


  const fill =
    document.getElementById(
      "boss-fill"
    );


  if (fill) {

    fill.style.width =
      percentage + "%";

  }


  save();

}



/* ==================================================
   BOTÃO - DO CHEFÃO
   ================================================== */

const bossMinus =
  document.getElementById(
    "boss-hp-minus"
  );


if (bossMinus) {

  bossMinus.addEventListener(
    "click",
    () => {

      const hpInput =
        document.getElementById(
          "boss-hp"
        );


      let hp =
        Number(
          hpInput.value
        ) || 0;


      const oldHp = hp;


      registerSnapshot("redução manual da vida do Kaiju");


      hp =
        Math.max(
          0,
          hp - 1
        );


      hpInput.value =
        hp;


      state["boss-hp"] =
        hp;


      save();

      updateBoss();


      addBattleLog(`Kaiju sofreu ${Math.abs(hp - oldHp)} de dano.`);

    }
  );

}



/* ==================================================
   BOTÃO + DO CHEFÃO
   ================================================== */

const bossPlus =
  document.getElementById(
    "boss-hp-plus"
  );


if (bossPlus) {

  bossPlus.addEventListener(
    "click",
    () => {

      const hpInput =
        document.getElementById(
          "boss-hp"
        );


      const maxInput =
        document.getElementById(
          "boss-max"
        );


      let hp =
        Number(
          hpInput.value
        ) || 0;


      const oldHp = hp;


      registerSnapshot("recuperação manual da vida do Kaiju");


      const max =
        Math.max(
          1,
          Number(
            maxInput.value
          ) || 1
        );


      if (
        hp < max
      ) {

        hp++;

      }


      hp =
        Math.min(
          hp,
          max
        );


      hpInput.value =
        hp;


      state["boss-hp"] =
        hp;


      save();

      updateBoss();


      addBattleLog(`Kaiju recuperou ${Math.abs(hp - oldHp)} de vida.`);

    }
  );

}



/* ==================================================
   DANO DIRETO NO CHEFÃO
   ================================================== */

const bossDamageInput =
  document.getElementById(
    "boss-damage"
  );


const bossDamageButton =
  document.getElementById(
    "boss-damage-apply"
  );


if (
  bossDamageInput &&
  bossDamageButton
) {

  bossDamageButton.addEventListener(
    "click",
    () => {

      const hpInput =
        document.getElementById(
          "boss-hp"
        );


      const maxInput =
        document.getElementById(
          "boss-max"
        );


      let hp =
        Number(
          hpInput.value
        ) || 0;


      const max =
        Math.max(
          1,
          Number(
            maxInput.value
          ) || 1
        );


      const damage =
        Math.max(
          0,
          Number(
            bossDamageInput.value
          ) || 0
        );


      const oldHp = hp;


      registerSnapshot(`dano direto de ${damage} no Kaiju`);


      hp =
        Math.max(
          0,
          hp - damage
        );


      hp =
        Math.min(
          hp,
          max
        );


      hpInput.value =
        hp;


      state["boss-hp"] =
        hp;


      save();

      updateBoss();


      addBattleLog(`Kaiju sofreu ${Math.abs(hp - oldHp)} de dano direto.`);


      bossDamageInput.value =
        "";

    }
  );


  bossDamageInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        bossDamageButton.click();

      }

    }
  );

}



/* ==================================================
   OCULTAR VIDA DO CHEFÃO
   ================================================== */

const bossHide =
  document.getElementById(
    "boss-hide-hp"
  );


function setBossHpVisibility(
  hidden
) {

  const values =
    document.getElementById(
      "boss-hp-values"
    );


  if (!values) {

    return;

  }


  values.classList.toggle(
    "hidden",
    hidden
  );


  if (bossHide) {

    bossHide.textContent =
      hidden
        ? "Mostrar vida"
        : "Ocultar vida";

  }


  state[
    "boss-hp-hidden"
  ] = hidden;


  save();

}



if (bossHide) {

  const hidden =
    state[
    "boss-hp-hidden"
    ] === true;


  setBossHpVisibility(
    hidden
  );


  bossHide.addEventListener(
    "click",
    () => {

      const values =
        document.getElementById(
          "boss-hp-values"
        );


      const isHidden =
        values.classList.contains(
          "hidden"
        );


      setBossHpVisibility(
        !isHidden
      );

    }
  );

}



/* ==================================================
   ATAQUE DO CHEFÃO
   ================================================== */

const bossPlayerDamage =
  document.getElementById(
    "boss-player-damage"
  );


const bossAttackButton =
  document.getElementById(
    "boss-attack-apply"
  );


const bossSelectAll =
  document.getElementById(
    "boss-select-all"
  );


const bossTargets =
  document.querySelectorAll(
    ".boss-target"
  );



/* ==================================================
   SELECIONAR TODOS OS JOGADORES
   ================================================== */

if (bossSelectAll) {

  bossSelectAll.addEventListener(
    "click",
    () => {

      const allSelected =
        [...bossTargets].every(
          checkbox =>
            checkbox.checked
        );


      bossTargets.forEach(
        checkbox => {

          checkbox.checked =
            !allSelected;

        }
      );


      bossSelectAll.textContent =
        allSelected
          ? "Todos"
          : "Desmarcar";

    }
  );

}



/* ==================================================
   APLICAR ATAQUE DO CHEFÃO
   ================================================== */

if (
  bossAttackButton &&
  bossPlayerDamage
) {

  bossAttackButton.addEventListener(
    "click",
    () => {

      const baseDamage =
        Math.max(
          0,
          Number(
            bossPlayerDamage.value
          ) || 0
        );


      const selectedPlayers =
        [...bossTargets]
          .filter(
            checkbox =>
              checkbox.checked
          )
          .map(
            checkbox =>
              checkbox.value
          );


      if (
        selectedPlayers.length === 0
      ) {

        alert(
          "Selecione pelo menos um jogador."
        );

        return;

      }


      registerSnapshot("ataque do Kaiju contra a equipe");


      selectedPlayers.forEach(
        type => {

          const hpInput =
            document.getElementById(
              "hp-" + type
            );


          const maxInput =
            document.getElementById(
              "max-" + type
            );


          const defenseInput =
            document.querySelector(
              `[data-save="def-${type}"]`
            );


          if (
            !hpInput ||
            !maxInput
          ) {

            return;

          }


          let hp =
            Number(
              hpInput.value
            ) || 0;


          const max =
            Math.max(
              1,
              Number(
                maxInput.value
              ) || 1
            );


          const defense =
            Math.max(
              0,
              Number(
                defenseInput?.value
              ) || 0
            );


          /*
              DANO FINAL =
              DANO DO CHEFÃO
              MENOS DEFESA.
          */

          const finalDamage =
            Math.max(
              0,
              baseDamage -
              defense
            );


          hp =
            Math.max(
              0,
              hp -
              finalDamage
            );


          hp =
            Math.min(
              hp,
              max
            );


          hpInput.value =
            hp;


          state[
            "hp-" + type
          ] = hp;


          state[
            "max-" + type
          ] = max;

        }
      );


      save();


      updateAllFighterStatuses();


      addBattleLog(
        `Kaiju atacou ${selectedPlayers.length} jogador${selectedPlayers.length > 1 ? "es" : ""} com ${baseDamage} de dano base.`
      );


      bossPlayerDamage.value =
        "";


      bossTargets.forEach(
        checkbox => {

          checkbox.checked =
            false;

        }
      );


      bossSelectAll.textContent =
        "Todos";

    }
  );


  bossPlayerDamage.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter"
      ) {

        bossAttackButton.click();

      }

    }
  );

}



/* ==================================================
   CARTAS DE ATAQUE
   ================================================== */

const cards = [

  ["A", "♠"],

  ["2", "♥"],

  ["3", "♦"],

  ["4", "♣"],

  ["5", "♠"],

  ["6", "♥"],

  ["7", "♦"],

  ["8", "♣"],

  ["9", "♠"],

  ["10", "♥"],

  ["Q", "♦"],

  ["J", "♣"],

  ["K", "♠"]

];


const cardsContainer =
  document.querySelector(
    ".cards"
  );


if (cardsContainer) {

  cardsContainer.innerHTML =
    "";


  cards.forEach(
    ([number, suit]) => {

      const card =
        document.createElement(
          "article"
        );


      card.className =
        "action-card";


      const cardKey =
        "card-" + number;


      const savedText =
        state[cardKey] ||
        "Clique para escrever";


      card.innerHTML = `

                <div class="card-inner">


                    <!-- FRENTE -->

                    <div
                        class="
                            card-face
                            card-front
                        "
                    >

                        <span
                            class="
                                card-corner
                                card-corner-top
                            "
                        >
                            ${number}
                        </span>


                        <span
                            class="card-suit"
                        >
                            ${suit}
                        </span>


                        <span
                            class="
                                card-corner
                                card-corner-bottom
                            "
                        >
                            ${number}
                        </span>

                    </div>



                    <!-- VERSO -->

                    <div
                        class="
                            card-face
                            card-back
                        "
                    >

                        <strong>
                            ${number}
                        </strong>


                        <div
                            contenteditable="true"
                            data-save="${cardKey}"
                        >
                            ${savedText}
                        </div>

                    </div>

                </div>

            `;


      cardsContainer.appendChild(
        card
      );

    }
  );



  /* ==================================================
     SALVAR TEXTO DAS CARTAS
     ================================================== */

  cardsContainer
    .querySelectorAll(
      "[contenteditable=true]"
    )
    .forEach(
      element => {

        element.addEventListener(
          "input",
          () => {

            state[
              element.dataset.save
            ] =
              element.textContent;


            save();

          }
        );

      }
    );



  /* ==================================================
     VIRAR CARTAS
     ================================================== */

  cardsContainer
    .querySelectorAll(
      ".action-card"
    )
    .forEach(
      card => {

        card.addEventListener(
          "click",
          event => {

            /*
               Se clicou na área
               de escrever, não vira.
            */

            if (
              event.target.closest(
                "[contenteditable=true]"
              )
            ) {

              return;

            }


            card.classList.toggle(
              "flipped"
            );

          }
        );

      }
    );

}



/* ==================================================
   LIMPAR DADOS
   ================================================== */

const clearButton =
  document.getElementById(
    "clear-storage"
  );


if (clearButton) {

  clearButton.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "Apagar todos os textos, números e imagens salvos?"
        );


      if (confirmed) {

        localStorage.removeItem(
          KEY
        );


        location.reload();

      }

    }
  );

}



/* ==================================================
   INICIALIZAÇÃO
   ================================================== */

updateBoss();
initializeBattleConsole();
initializeSelectedFleet();
