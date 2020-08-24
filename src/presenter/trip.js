import SortingView from "../view/sorting.js";
import EventSummaryView from "../view/event-summary.js";
import EventEditView from "../view/event-edit.js";
import NoEventsView from "../view/no-events.js";
import DayListView from "../view/day-list.js";
import DayView from "../view/day.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";
import {Itinerary} from "../utils/itinerary.js";

export default class Trip {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container — Узел документа для презентера.
   */
  constructor(container) {
    this._container = container;

    this._dayListComponent = new DayListView();
    this._noEventsComponent = new NoEventsView();
    this._sortingComponent = new SortingView();
  }

  /**
   * Инициализация и первичная отрисовка списка событий.
   *
   * @param  {array} eventList - Список событий.
   * @return {void}
   */
  init(eventList) {
    this._eventList = eventList.slice();

    render(this._container, this._sortingComponent, RenderPosition.BEFOREEND);
    render(this._container, this._dayListComponent, RenderPosition.BEFOREEND);

    this._renderEventsByDay(this._eventList);
  }

  /**
   * Рендеринг событий в базовой сортировке по дням. В начале метода вызывается
   * функция Route.organizeByDays, которая конвертирует список событий в объект
   * Map, где ключем является дата, а значением — список событий в рамках даты.
   * В цикле для каждого дня вызывается метод this._renderDay, который и
   * отрисовывает сами события. Если в списке нет событий, то вызывается метод
   * this._renderFallback, который отрисовывает заглушку.
   *
   * @param  {array} eventList - Список событий.
   * @return {void}
   */
  _renderEventsByDay(eventList) {
    const dayList = Itinerary.organizeByDays(eventList);

    if (dayList.size === 0) {
      this._renderFallback();
      return;
    }

    let dayNumber = 1;
    for (const [dayDate, dayEventList] of dayList) {
      this._renderEventList(dayEventList, dayDate, dayNumber++);
    }
  }

  /**
   * Рендеринг событий внутри одного дня. Может также испольльзоваться для
   * вывода отсортированных событий (параметры dayDate и dayNumber не
   * обязательны).
   *
   * @param  {array} eventList  - Список событий. Если переданы параметры
   *                              dayDate и dayNumber, то события выведутся
   *                              в рамках одного дня.
   * @param  {string} dayDate   - Дата в формате гггг-мм-дд.
   * @param  {[type]} dayNumber - Номер лня.
   * @return {void}
   */
  _renderEventList(eventList, dayDate = null, dayNumber = null) {
    const dayComponent = new DayView({dayNumber, dayDate});
    render(this._dayListComponent, dayComponent, RenderPosition.BEFOREEND);

    for (const event of eventList) {
      render(
          dayComponent.eventsContainer,
          this._createEventSummaryElement(dayComponent.eventsContainer, event),
          RenderPosition.BEFOREEND
      );
    }
  }

  /**
   * Создание шаблона отображения сводки о событии для демонстрации в общем
   * списке. Вместе с шаблоном создается также и обработчик открытия события
   * (замена шаблона сводки формой редактирования).
   *
   * @param  {Node} container - DOM-узел для размещения отобажения.
   * @param  {Object} event   - Объект с данными события.
   * @return {Node}           - Шаблон в виде DOM-элемента для размещения.
   */
  _createEventSummaryElement(container, event) {
    const eventSummary = new EventSummaryView(event);
    eventSummary.openHandler = () => {
      container.replaceChild(this._createEventEditElement(container, event), eventSummary.element);
      eventSummary.element.remove();
      eventSummary.removeElement();
    };

    return eventSummary.element;
  }


  /**
   * Создание формы редактрирован события в общем списке. Вместе с формой
   * создаются также обработчики закрытия формы (замена формы шаблономм
   * сводки) и сохранения данных.
   *
   * @param  {Node} container - DOM-узел для размещения отобажения.
   * @param  {Object} event   - Объект с данными события.
   * @return {Node}           - Шаблон в виде DOM-элемента для размещения.
   */
  _createEventEditElement(container, event) {
    const eventEdit = new EventEditView(event);
    const closeEventEdit = () => {
      container.replaceChild(this._createEventSummaryElement(container, event), eventEdit.element);
      eventEdit.element.remove();
      eventEdit.removeElement();
      closeEventByEsc.unbind();
    };

    const closeEventByEsc = new EscHandler(closeEventEdit);
    eventEdit.closeHandler = closeEventEdit;
    eventEdit.submitHandler = closeEventEdit;

    return eventEdit.element;
  }

  /**
   * Рендеринг шаблона заглушки для состояния списка без событий
   *
   * @return {void}
   */
  _renderFallback() {
    render(this._container, this._noEventsComponent, RenderPosition.BEFOREEND);
  }
}
