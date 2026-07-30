const mainQuestEl = document.querySelector('#main-quest');
const dutyListEl = document.querySelector('#duty-list');
const backdropEl = document.querySelector('#modal-backdrop');
const modalEl = document.querySelector('#details-modal');
const closeEl = document.querySelector('#modal-close');
const modalTitleEl = document.querySelector('#modal-title');
const modalObjectiveEl = document.querySelector('#modal-objective');
const modalDetailsEl = document.querySelector('#modal-details');

let modalOpen = false;
let isIgnoringMouse = true;

function setMousePassthrough(ignore) {
  if (isIgnoringMouse === ignore) {
    return;
  }

  isIgnoringMouse = ignore;
  window.api.setIgnoreMouseEvents(ignore);
}

function createTextElement(tagName, className, text) {
  const el = document.createElement(tagName);
  el.className = className;
  el.textContent = text || '';
  return el;
}

function normalizeQuest(quest) {
  return {
    title: quest?.title || '未命名任务',
    objective: quest?.objective || '',
    details: quest?.details || '暂无详细说明。'
  };
}

function openDetails(quest) {
  const normalized = normalizeQuest(quest);
  modalTitleEl.textContent = normalized.title;
  modalObjectiveEl.textContent = normalized.objective;
  modalDetailsEl.textContent = normalized.details;
  backdropEl.classList.remove('hidden');
  modalEl.setAttribute('open', '');
  modalOpen = true;
  setMousePassthrough(false);
}

function closeDetails() {
  backdropEl.classList.add('hidden');
  modalEl.removeAttribute('open');
  modalOpen = false;
  setMousePassthrough(true);
}

function renderMainQuest(mainQuest) {
  const quest = normalizeQuest(mainQuest);

  mainQuestEl.replaceChildren();
  mainQuestEl.dataset.interactive = 'true';

  const icon = document.createElement('div');
  icon.className = 'main-icon';
  icon.setAttribute('aria-hidden', 'true');

  const textWrap = document.createElement('div');
  textWrap.append(
    createTextElement('h1', 'main-title ffxiv-text', quest.title),
    createTextElement('p', 'main-objective ffxiv-text', quest.objective)
  );

  mainQuestEl.append(icon, textWrap);
  mainQuestEl.onclick = () => openDetails(quest);
}

function renderDutyList(sideQuests) {
  const quests = Array.isArray(sideQuests) ? sideQuests.slice(0, 5).map(normalizeQuest) : [];
  dutyListEl.replaceChildren();

  const heading = createTextElement('h2', 'duty-heading ffxiv-text', 'Duty List');
  dutyListEl.append(heading);

  if (quests.length === 0) {
    dutyListEl.append(createTextElement('p', 'empty-state ffxiv-text', '暂无支线任务'));
    return;
  }

  quests.forEach((quest) => {
    const item = document.createElement('article');
    item.className = 'quest-item clickable';
    item.dataset.interactive = 'true';
    item.tabIndex = 0;
    item.append(
      createTextElement('h3', 'quest-title ffxiv-text', quest.title),
      createTextElement('p', 'quest-objective ffxiv-text', quest.objective)
    );

    item.addEventListener('click', () => openDetails(quest));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDetails(quest);
      }
    });

    dutyListEl.append(item);
  });
}

function renderTasks(tasks) {
  if (tasks?.error) {
    console.warn(tasks.error);
  }

  renderMainQuest(tasks?.mainQuest);
  renderDutyList(tasks?.sideQuests);
}

window.addEventListener('mousemove', (event) => {
  if (modalOpen) {
    setMousePassthrough(false);
    return;
  }

  const target = document.elementFromPoint(event.clientX, event.clientY);
  const interactive = Boolean(target?.closest('[data-interactive="true"], .clickable'));
  setMousePassthrough(!interactive);
});

window.addEventListener('mouseleave', () => {
  if (!modalOpen) {
    setMousePassthrough(true);
  }
});

closeEl.addEventListener('click', closeDetails);

backdropEl.addEventListener('click', (event) => {
  if (event.target === backdropEl) {
    closeDetails();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalOpen) {
    closeDetails();
  }
});

window.api.onUpdateTasks(renderTasks);
setMousePassthrough(true);
