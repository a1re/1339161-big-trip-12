import {makeEventSummaryTemplate} from "./event-summary.js";
import {makeEventEditTemplate} from "./event-edit.js";

/**
 * Построение шаблона списка событий.
 *
 * @param  {Array} events - Список событий, где каждый элемент — объект
 *                          с описанием события.
 * @return {string}       - Шаблон для вставки;
 */
export const makeEventListTemplate = (events) => {
  // Распределяем события по дням. Для этого создаем объект Map, где ключем
  // будет дата в формате yyyy-mm-dd, а значением — массив с событиями.
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

  // Начинаем собирать шаблон. Чтобы не делать бесконечные запросы к DOM для
  // вставки, упрощаем до простой конкатенации строки template, которую в конце
  // вернем для вставки большой документ.
  let template = ``;
  let dayNumber = 1; // Для перечисления
  let editFormShown = false; // Флаг вывода формы редактирования события

  for (const [dayDate, dayEvents] of eventsByDays) {
    const dayTitle = new Date(dayDate);
    template += `<ul class="trip-days">
            <li class="trip-days__item  day">
              <div class="day__info">
                <span class="day__counter">${dayNumber}</span>
                <time class="day__date" datetime="${dayDate}">${dayTitle.toLocaleString(`en-US`, {day: `numeric`, month: `short`})}</time>
              </div>
              <ul class="trip-events__list">`;

    for (let i = 0; i < dayEvents.length; i++) {
      // Первое событие в списке делаем формой редактирования согласно заданию
      if (!editFormShown) {
        template += `<li class="trip-events__item">`;
        template += makeEventEditTemplate(dayEvents[i]);
        template += `</li>`;

        editFormShown = true;
        continue;
      }

      template += `<li class="trip-events__item">`;
      template += makeEventSummaryTemplate(dayEvents[i]);
      template += `</li>`;
    }

    template += `</ul>
            </li>
          </ul>`;
    dayNumber++;
  }

  return template;
};
