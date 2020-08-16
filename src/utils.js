/**
 * Словарь позиций внутри элементов DOM для размещения потомков.
 *
 * @type {Object}
 */
export const RenderPosition = {
  BEFOREBEGIN: `beforebegin`,
  AFTERBEGIN: `afterbegin`,
  BEFOREEND: `beforeend`,
  AFTEREND: `afterend`
};

/**
 * Добавление DOM-элемента в струкутру документа.
 *
 * @param  {Node} container - Узел для добавления нового элемента.
 * @param  {Node} element   - Сам элемент, который будет добавляться.
 * @param  {string} place   - Место добавления, должно соответствовать словарю
 *                            RenderPosition
 * @return {void}
 */
export const render = (container, element, place) => {
  switch (place) {
    case RenderPosition.BEFOREBEGIN:
      container.bafore(element);
      break;
    case RenderPosition.AFTERBEGIN:
      container.prepend(element);
      break;
    case RenderPosition.BEFOREEND:
      container.append(element);
      break;
    case RenderPosition.AFTEREND:
      container.after(element);
      break;
  }
};

/**
 * Добавление элемента как строкового шаблона внутрь DOM-узла.
 *
 * @param  {Node} container  - Узел для добавления нового элемента.
 * @param  {string} template - Строка с шаблона для добавления.
 * @param  {string} place    - Место добавления, должно соответствовать значениям
 *                             первого аргумента функции insertAdjacenHTML.
 * @return {void}
 */
export const renderTemplate = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

/**
 * Конвертация строкового шаблона в DOM-элемент.
 *
 * @param  {string} template - Строка с шаблона для добавления.
 * @return {Node}            - DOM-элемент.
 */
export const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;

  return newElement.firstChild;
};

/**
 * Генерация случайного целого числе с небольшой надстройкой — его можно сделать
 * кратным какому-то другому числу за счет указания третьего параметра divider
 * (по умолчанию 1).
 *
 * @param  {Int} a       - Граница диапазона.
 * @param  {Int} b       - Граница диапазона.
 * @param  {Int} divider - Делитель (по умолчанию 1).
 * @return {Int}         - Случайное число.
 */
export const getRandomInt = (a = 0, b = 1, divider = 1) => {
  const lower = Math.floor(Math.min(a, b));
  const upper = Math.ceil(Math.max(a, b));

  const randomInt = Math.floor(lower + Math.random() * (upper - lower + 1));
  return randomInt - randomInt % divider;
};

/**
 * Вычисление длительности события по времени начала и конца. Чтобы не
 * потеряться в часовых поясах, вычисление примитивно-математическое —
 * вначале берутся таймстемпы обеих дат, вычисляется разница между ними,
 * затем поочереди делится на целые дни, целые часы и целые минуты.
 *
 * @param  {Date} beginTime - Время начала события в объекте Date
 * @param  {Date} endTime   - Время окончания события в объекте Date
 * @return {string}         - Длительность события в формате строки вида
 *                            `01D 02H 03M`
 */
export const getDuration = (beginTime, endTime) => {
  const MIN_IN_MS = 1000 * 60;
  const HOUR_IN_MS = 60 * MIN_IN_MS;
  const DAY_IN_MS = 24 * HOUR_IN_MS;

  let timeDifference = endTime.valueOf() - beginTime.valueOf();
  let duration = ``;

  if (timeDifference >= DAY_IN_MS) {
    const days = Math.round(timeDifference / DAY_IN_MS);
    duration += ((days < 10) ? (`0` + days) : days) + `D `;
    timeDifference = timeDifference % DAY_IN_MS;
  }

  if (timeDifference.valueOf() >= 1000 * 60 * 60) {
    const hours = Math.round(timeDifference / HOUR_IN_MS);
    duration += ((hours < 10) ? (`0` + hours) : hours) + `H `;
    timeDifference = timeDifference % HOUR_IN_MS;
  }

  if (timeDifference > 0) {
    const minutes = Math.round(timeDifference / MIN_IN_MS);
    duration += ((minutes < 10) ? (`0` + minutes) : minutes) + `M`;
  }

  return duration;
};

/**
 * Распределяем события по дням. Для этого создаем объект Map, где ключом
 * будет дата в формате yyyy-mm-dd, а значением — массив с событиями.
 *
 * @param  {array} events - Массив событий.
 * @return {Map}          - Карта событий, где ключ — дата, а значение — массив
 *                          событий в рамках дня.
 */
export const organizeEventsByDays = (events) => {
  const eventsByDays = new Map();
  events.forEach((event) => {
    const eventDate = event.beginTime.toISOString().split(`T`)[0];

    if (!eventsByDays.get(eventDate)) {
      eventsByDays.set(eventDate, []);
    }

    const eventsInDate = eventsByDays.get(eventDate);
    eventsInDate.push(event);
    eventsByDays.set(eventDate, eventsInDate);
  });

  return eventsByDays;
};

/**
 * Создание хэндлера для обработки нажатии клавиши Esc. Хэндлер должен
 * быть добавлен как событие при помощи addEventListener(`key`).
 *
 * @param  {function} callback - Коллбек, который будет вызван при нажатии
 *                               Esc.
 * @return {function}          - Функция для закрепления.
 */
export const bindToEsc = (callback) => {
  const onEscKeyDown = (keyEvent) => {
    if (keyEvent.key === `Escape` || keyEvent.key === `Esc`) {
      keyEvent.preventDefault();
      callback();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };
  return onEscKeyDown;
};
