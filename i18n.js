// Site language (English / Russian). Keys are the English text; a key missing
// from the dictionary is shown as is. "{name}" placeholders are filled by t().

const I18N = {
  en: {
    banner: 'This is a fork of <a href="https://github.com/tkprocat/cogtimizer">tkprocat\'s fork</a> of the original ' +
      '<a href="https://github.com/Monoblos/cogtimizer">Cogtimizer</a> by <a href="https://github.com/Monoblos/">Monoblos</a>, ' +
      'with board scoring taken from the game\'s code and a choice of what to optimize. ' +
      'Thanks to Monoblos, <a href="https://github.com/tkprocat">tkprocat</a>, <a href="https://github.com/Bolero-fk">Bolero-fk</a> ' +
      'and <a href="https://github.com/Xythium">Xythium</a>. ' +
      'Questions and bug reports: <a href="https://github.com/StimDesu/cogtimizer/issues">GitHub issues</a>.',
    loaderHelp: 'Please enter the "Raw Data" from idleonefficiency.com, or you can enter your username. If using your username, make sure you have recently published your profile on idleonefficiency.com, otherwise Cogtimizer will pull stale data. If you make changes and want to run another round of optimizing, please change zones in-game before refreshing data from idleonefficiency.com.',
  },
  ru: {
    banner: 'Это форк <a href="https://github.com/tkprocat/cogtimizer">форка tkprocat</a> оригинального ' +
      '<a href="https://github.com/Monoblos/cogtimizer">Cogtimizer</a> от <a href="https://github.com/Monoblos/">Monoblos</a>: ' +
      'расчёт доски взят из кода игры, и можно выбрать, что оптимизировать. ' +
      'Спасибо Monoblos, <a href="https://github.com/tkprocat">tkprocat</a>, <a href="https://github.com/Bolero-fk">Bolero-fk</a> ' +
      'и <a href="https://github.com/Xythium">Xythium</a>. ' +
      'Вопросы и ошибки: <a href="https://github.com/StimDesu/cogtimizer/issues">Issues на GitHub</a>.',
    loaderHelp: 'Вставьте «Raw Data» с idleonefficiency.com или введите свой ник. Если вводите ник, сначала опубликуйте свежий профиль на idleonefficiency.com, иначе подтянутся старые данные. Чтобы оптимизировать ещё раз после перестановок в игре, смените в игре локацию и только потом обновите данные на idleonefficiency.com.',

    // Menu and loader
    "Loader": "Загрузка",
    "Cogs": "Доска",
    "Settings": "Настройки",
    "Solve": "Подобрать",
    "Optimizing...": "Подбираю...",
    "Load": "Загрузить",
    "Please": "Загрузите",
    "load": "своё",
    "a": "",
    "savegame": "сохранение",
    "Language": "Язык",

    // Board side panel
    "Spare cogs": "Запасные шестерёнки",
    "Cogs in your spare inventory (not on the board). The solver can move them onto the board.": "Шестерёнки в запасе (не на доске). Оптимизатор может переставить их на доску.",
    "Tiny cog slot (World 7). Tiny cogs give a global bonus and are not moved by the solver.": "Слот маленькой шестерёнки (7-й мир). Маленькие шестерёнки дают общий бонус, оптимизатор их не двигает.",
    "Total Build Rate": "Скорость стройки",
    "Player Construct EXP": "Опыт стройки персонажей",
    "Flaggy Rate": "Флагги",
    "Flag Speed": "Скорость флагов",
    "/HR": "/ч",
    "bonus": "бонус",
    "Page": "Стр.",
    "Step": "Шаг",

    // Settings
    "Gem Shop Flaggy upgrades": "Улучшения флагги в магазине самоцветов",
    "Optimize for": "Что улучшать",
    "Balanced (build + EXP + flaggy)": "Баланс (стройка + опыт + флагги)",
    "Build rate only": "Только скорость стройки",
    "Player construct EXP only": "Только опыт стройки персонажей",
    "Flaggy rate only": "Только флагги",
    "Flag speed only": "Только скорость флагов",
    "Custom weights": "Свои веса",
    "Weights are relative: 1 for build and 2 for flaggy means +1% flaggy is worth +2% build.": "Веса относительные: 1 для стройки и 2 для флагги значит, что +1% флагги ценится как +2% стройки.",
    "Build rate weight": "Вес скорости стройки",
    "Player EXP weight": "Вес опыта персонажей",
    "Flaggy rate weight": "Вес флагги",
    "Flag speed weight": "Вес скорости флагов",
    "Solve times (ms)": "Время подбора (мс)",
    "Misc.": "Прочее",
    "Show cog stats?": "Показывать характеристики шестерёнок",
    "Directly show solved board": "Сразу показать готовую доску",

    // Results
    "Starting": "Было",
    "Final": "Стало",
    "BuildRate: {build}/HR, Player EXP: {xp}/HR (+{bonus}%), Flaggy: {flaggy}/HR, Flag speed: {flag}/HR": "Стройка: {build}/ч, опыт персонажей: {xp}/ч (+{bonus}%), флагги: {flaggy}/ч, скорость флагов: {flag}/ч",
    "Switch {from} [{fx}|{fy}]": "Поменять: {from} [{fx}|{fy}]",
    "with {to} [{tx}|{ty}]": "и {to} [{tx}|{ty}]",
    "Step by step ({n} swaps)": "Пошагово (перестановок: {n})",
    "Step {n} of {total}": "Шаг {n} из {total}",
    "drag {cog} ({from}) onto {target} ({to})": "перетащи {cog} ({from}) на {target} ({to})",
    "the empty slot": "пустой слот",
    "board: row {r}, column {c}": "доска: ряд {r}, столбец {c}",
    "spare: page {p}, row {r}, column {c}": "запас: стр. {p}, ряд {r}, столбец {c}",
    "Back": "Назад",
    "Done, next": "Сделал, дальше",
    "Close": "Закрыть",
    "All {n} swaps done. The board now matches the optimized layout.": "Готово, перестановок сделано: {n}. Доска совпадает с оптимальной раскладкой.",
    "board": "доска",
    "spare": "запас",
    "build": "изготовление",

    // Load errors
    "Could not read the save data.": "Не удалось прочитать сохранение.",
    "Loaded, but the cog board looks empty (no cogs or no unlocked slots). Have you used the Construction cog board in-game and refreshed your profile on idleonefficiency.com?": "Загружено, но доска пустая (нет шестерёнок или открытых клеток). Вы уже ставили шестерёнки в игре и обновляли профиль на idleonefficiency.com?",
    "Enter your username, or paste the \"Raw Data\" from idleonefficiency.com.": "Введите ник или вставьте «Raw Data» с idleonefficiency.com.",
    "No profile found for \"{name}\" ({status}). Check the username or paste the Raw Data instead.": "Профиль «{name}» не найден ({status}). Проверьте ник или вставьте Raw Data.",
    "Couldn't load \"{name}\".": "Не удалось загрузить «{name}».",
    "No save data found. Paste the \"Raw Data\" from idleonefficiency.com, or enter your username.": "Сохранение не найдено. Вставьте «Raw Data» с idleonefficiency.com или введите ник.",
    "This doesn't look like a full save - missing cog data ({keys}). Copy the complete \"Raw Data\" from idleonefficiency.com.": "Это не полное сохранение: нет данных шестерёнок ({keys}). Скопируйте «Raw Data» с idleonefficiency.com целиком.",

    // Checklist frame
    "Construction checklist": "Чек-лист стройки",
    "Based on your save and the game's own formulas. ! = something to fix, ? = room to grow, ✓ = fine.": "По вашему сохранению и формулам из кода игры. ! — стоит исправить, ? — есть куда расти, ✓ — в порядке.",
    "Characters": "Персонажи",
    "Construction EXP": "Опыт стройки",
    "Build rate": "Скорость стройки",
    "Flaggy & board": "Флагги и доска",

    // Checklist: characters
    "not placed": "не размещён",
    "{name} ({cls}, Construction {lvl})": "{name} ({cls}, стройка {lvl})",
    "{who} is not on the cog board": "{who} не стоит на доске",
    "Characters only build while placed on the board (or in a cog maker slot). Put them on the board.": "Персонаж строит, только когда стоит на доске (или в слоте изготовления шестерёнок). Поставьте его на доску.",
    "{who} is making {tier} cogs instead of building": "{who} делает шестерёнки «{tier}» вместо стройки",
    "Their {rate}/HR does not count toward the board's build rate while they sit in a cog maker slot. Fine if you need new cogs; otherwise move them to the board.": "Его {rate}/ч не идут в скорость стройки, пока он стоит в слоте изготовления. Это нормально, если нужны новые шестерёнки; иначе верните его на доску.",
    "{name}: Redox Rates talent {lvl}/{max}": "{name}: талант Redox Rates {lvl}/{max}",
    "Gives +{now}% build speed per power of 10 Redox Salts in storage (you have {salts}, i.e. {powers} powers). Maxing it: about +{gain}% build for this character.": "Даёт +{now}% к скорости стройки за каждую степень 10 соли Redox в сундуке (у вас {salts}, это {powers} степени). Прокачка до максимума: примерно +{gain}% стройки этому персонажу.",
    "{name}: Redox Rates talent maxed ({lvl})": "{name}: талант Redox Rates прокачан ({lvl})",
    "+{total}% build speed from {salts} Redox Salts. More salts in the storage chest = more build speed.": "+{total}% к скорости стройки от {salts} соли Redox. Больше соли в сундуке — выше скорость.",
    "{name}: Sharper Saws talent {lvl}/{max}": "{name}: талант Sharper Saws {lvl}/{max}",
    "+1% Construction EXP per level for this character (+{left}% if maxed).": "+1% к опыту стройки этого персонажа за уровень (+{left}% при максимуме).",
    "Construction levels and build rate per character": "Уровни стройки и скорость каждого персонажа",
    "{name} ({cls}): level {lvl}, {rate}/HR, +10 levels = +{gain}%": "{name} ({cls}): уровень {lvl}, {rate}/ч, +10 уровней = +{gain}%",
    "A character's own build rate is 3*(level/2+0.7)^1.6, multiplied by the Carpenter bubble per level, so low-level builders gain the most from leveling.": "Собственная скорость персонажа — 3*(уровень/2+0,7)^1,6, умноженная на пузырь Carpenter за каждый уровень, поэтому сильнее всего от прокачки растут персонажи с низким уровнем.",
    "Construction Container post office box is level 0 for {n} of {total} characters": "Ящик почты Construction Container на уровне 0 у {n} из {total} персонажей",
    "{names}. +0.25% base build rate per box level (and Construction EXP after level 100).": "{names}. +0,25% к базовой скорости стройки за уровень ящика (и опыт стройки после 100 уровня).",
    "The box is in Shipment Unit 2 (second Upgrade tab at the post office).": "Ящик находится в Shipment Unit 2 (вторая вкладка Upgrade на почте).",
    "The box is in Shipment Unit 2, which opens after 325 completed post office orders. Completed so far: {n} of 325.": "Ящик находится в Shipment Unit 2, а он открывается после 325 выполненных заказов почты. Выполнено: {n} из 325.",

    // Checklist: construction EXP
    "nobody": "ни у кого",
    "Star sign Sawsaw Salala (+25% Construct EXP): {who}": "Знак зодиака Sawsaw Salala (+25% опыта стройки): {who}",
    "Applies to each character that has it equipped.": "Действует на каждого персонажа, у которого он надет.",
    "Call Me Bob bubble level {lvl}: +{pct}% Construction EXP": "Пузырь Call Me Bob, уровень {lvl}: +{pct}% опыта стройки",
    "Counts for every character thanks to the Sheep companion (all big bubbles count as equipped).": "Действует на всех персонажей благодаря компаньону Sheep (все большие пузыри считаются экипированными).",
    "Without the Sheep companion this only counts for characters who have the bubble equipped.": "Без компаньона Sheep действует только на персонажей, у которых пузырь экипирован.",
    "Warriors Rule bubble level {lvl}": "Пузырь Warriors Rule, уровень {lvl}",
    "Warriors (Barbarian/Squire lines) get Call Me Bob x{mult} when not the active character.": "Воины (ветки Barbarian и Squire) получают Call Me Bob x{mult}, когда играете не за них.",
    "Seesaw statue level {lvl}: +{pct}% Construction EXP": "Статуя Seesaw, уровень {lvl}: +{pct}% опыта стройки",
    "+0.5% per level.": "+0,5% за уровень.",
    "Visible Ink vial level {lvl}": "Флакон Visible Ink, уровень {lvl}",
    "Visible Ink vial not unlocked": "Флакон Visible Ink не открыт",
    "+1% Construction EXP per level.": "+1% опыта стройки за уровень.",
    "No cogs give '% Player Construct XP'": "Нет шестерёнок с «% Player Construct XP»",
    "Such cogs boost the EXP of characters next to them. Until you have them, player EXP grows only from '% Bonus Construct EXP' cogs on the board and the sources above.": "Такие шестерёнки усиливают опыт соседних персонажей. Пока их нет, опыт персонажей растёт только от шестерёнок с «% Bonus Construct EXP» на доске и от источников выше.",
    "Spare cogs with '% Bonus Construct EXP' are not on the board: +{spare}% unused (board total now {board}%)": "Шестерёнки с «% Bonus Construct EXP» лежат в запасе, а не на доске: +{spare}% пропадает (сейчас на доске {board}%)",
    "{n} cogs in the spare inventory. This bonus multiplies every character's Construction EXP, but only for cogs placed on the board. Put them in empty slots or instead of weak cogs; the solver with the 'Player EXP' goal does this.": "В запасе таких шестерёнок: {n}. Этот бонус умножает опыт стройки всех персонажей, но считается только для шестерёнок на доске. Поставь их в пустые слоты или вместо слабых шестерёнок; оптимизатор с целью «Опыт игроков» сделает это сам.",
    "All cogs with '% Bonus Construct EXP' are on the board: {board}%": "Все шестерёнки с «% Bonus Construct EXP» стоят на доске: {board}%",
    "This bonus multiplies every character's Construction EXP.": "Этот бонус умножает опыт стройки всех персонажей.",

    // Checklist: build rate
    "Carpenter bubble level {lvl}: +{pct}% build per Construction level": "Пузырь Carpenter, уровень {lvl}: +{pct}% стройки за каждый уровень стройки",
    "Multiplies every character's own build rate; higher Construction levels profit more.": "Умножает собственную скорость каждого персонажа; чем выше уровень стройки, тем больше выгода.",
    "Shinyfin Stew vial level {lvl}": "Флакон Shinyfin Stew, уровень {lvl}",
    "Shinyfin Stew vial not unlocked": "Флакон Shinyfin Stew не открыт",
    "+% Construction build rate.": "+% к скорости стройки.",
    "Turtle Tisane vial level {lvl}": "Флакон Turtle Tisane, уровень {lvl}",
    "Turtle Tisane vial not unlocked": "Флакон Turtle Tisane не открыт",
    "Multiplicative build rate bonus.": "Множитель скорости стройки.",
    "Achievement 'Cog in the System' done": "Достижение «Cog in the System» получено",
    "Achievement 'Cog in the System' not done": "Достижение «Cog in the System» не получено",
    "+5% build speed.": "+5% к скорости стройки.",
    "Have 20 grey (Nooby) cogs on the board at once for +5% build speed. You have {n} now.": "Поставьте на доску одновременно 20 серых (Nooby) шестерёнок — +5% к скорости стройки. Сейчас стоит {n}.",

    // Checklist: star signs
    "Star signs": "Знаки зодиака",
    "Telescope quest done": "Квест телескопа выполнен",
    "Telescope quest not finished": "Квест телескопа не выполнен",
    "The Telescope is at the top of the big tree in Blunder Hills (entrance from the Slimes map). There you change star signs; finishing its quest lets you complete constellations around the world.": "Телескоп стоит на вершине большого дерева в Blunder Hills (вход с карты слаймов). У него меняют знаки зодиака, а его квест открывает созвездия по всему миру.",
    "To finish it, complete the constellation at {map}: {req}.": "Чтобы его закончить, выполните созвездие на карте {map}: {req}.",
    "lets every character wear one more star sign": "+1 слот под знак каждому персонажу",
    "+25% Construction EXP": "+25% опыта стройки",
    "{sign} unlocked": "{sign} открыт",
    "{sign} ({why}): {n} signs to unlock, {cost} star points": "{sign} ({why}): открыть ещё {n} знаков, нужно {cost} очков звёзд",
    "Path: {path}. You have {points} points.": "Путь: {path}. Сейчас очков: {points}.",

    // Checklist: flaggy & board
    "Gem shop flaggy upgrades: {n}": "Улучшения флагги в магазине самоцветов: {n}",
    "Each one gives +50% flaggy rate on the whole board.": "Каждое даёт +50% флагги всей доске.",
    "Flags placed: {n}/4": "Флагов поставлено: {n}/4",
    "Flags unlock new board slots; flaggy rate fills them.": "Флаги открывают новые клетки доски; флагги их заполняют.",
    "{empty} empty board slots and {spare} cogs in the spare inventory": "{empty} пустых клеток на доске и {spare} шестерёнок в запасе",
    "Run the solver or place spare cogs on the board.": "Запустите подбор или поставьте запасные шестерёнки на доску.",
    "{empty} empty board slots": "Пустых клеток на доске: {empty}",
    "Make more cogs in the cog maker to fill them.": "Сделайте больше шестерёнок, чтобы их заполнить.",
    "Cog inventory: gem shop +{gem}, Bubonic Burp vial {vial}": "Запас шестерёнок: магазин самоцветов +{gem}, флакон Bubonic Burp {vial}",
    "not unlocked": "не открыт",
    "More spare slots let you keep better cogs for later.": "Больше мест в запасе — можно копить хорошие шестерёнки на потом.",
  }
};

let LANG = "en";
try {
  LANG = localStorage.getItem("lang") || "";
} catch (e) { /* storage unavailable */ }
if (!I18N[LANG]) {
  LANG = (navigator.language || "").toLowerCase().startsWith("ru") ? "ru" : "en";
}

function t(key, vars) {
  let text = I18N[LANG][key];
  if (text === undefined) text = I18N.en[key];
  if (text === undefined) text = key;
  if (vars) {
    text = text.replace(/\{(\w+)\}/g, (m, name) => vars[name] !== undefined ? vars[name] : m);
  }
  return text;
}

// Static texts are marked in the HTML: data-i18n (text), data-i18n-html, data-i18n-title.
function applyI18n(root = document) {
  document.documentElement.lang = LANG;
  for (const el of root.querySelectorAll("[data-i18n]")) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll("[data-i18n-html]")) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll("[data-i18n-title]")) el.title = t(el.dataset.i18nTitle);
}

function setLang(lang) {
  if (!I18N[lang]) return;
  LANG = lang;
  try { localStorage.setItem("lang", lang); } catch (e) { /* storage unavailable */ }
  applyI18n();
  window.dispatchEvent(new Event("langchange"));
}
