import SortingView from "../view/sorting-view.js";
import NoEventsView from "../view/no-events-view.js";
import DayListView from "../view/day-list-view.js";
import DayView from "../view/day-view.js";

import EventPresenter from "./event-presenter.js";

import {render, RenderPosition} from "../utils/render.js";
import Itinerary from "../utils/itinerary.js";

import {SortingMethod, UpdateMode} from "../const.js";

export default class TripPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container       — Узел документа для презентера.
   * @param  {Observer} eventsModel - Модель для работы с событиями.
   */
  constructor(container, eventsModel) {
    this._container = container;
    this._eventsModel = eventsModel;

    this._currentSortingMethod = SortingMethod.EVENT;
    this._eventPresenterMap = new Map();
    this._dayComponentMap = new Map();

    this._dayListComponent = new DayListView();
    this._noEventsComponent = new NoEventsView();
    this._sortingComponent = new SortingView(this._currentSortingMethod);

    this._updateEvent = this._updateEvent.bind(this);
    this._sortEvents = this._sortEvents.bind(this);
    this._resetAllEvents = this._resetAllEvents.bind(this);
  }

  /**
   * Инициализация и первичная отрисовка списка событий.
   *
   * @return {void}
   */
  init() {
    this._sortingComponent.sortEventsHandler = this._sortEvents;

    render(this._container, this._sortingComponent, RenderPosition.BEFOREEND);
    render(this._container, this._dayListComponent, RenderPosition.BEFOREEND);
    this._renderEvents();
  }

  /**
   * Получение упорядоченного согласно заданной сортировке списка события
   * в виде карты (объекта Map).
   *
   * @return {Map} - Карта событий.
   */
  _getEventMap() {
    const eventMap = new Map();
    const eventList = this._eventsModel.eventList.slice();

    if (eventList.length === 0) {
      return eventMap;
    }

    switch (this._currentSortingMethod) {
      case SortingMethod.EVENT:
        eventList.forEach((event) => {
          const eventDate = event.beginTime.toISOString().split(`T`)[0];

          if (!eventMap.get(eventDate)) {
            eventMap.set(eventDate, []);
          }

          const eventsInDate = eventMap.get(eventDate);
          eventsInDate.push(event);
          eventMap.set(eventDate, eventsInDate);
        });
        break;
      case SortingMethod.TIME:
        eventMap.set(null, eventList.sort(Itinerary.sortByDuration));
        break;
      case SortingMethod.PRICE:
        eventMap.set(null, eventList.sort(Itinerary.sortByPrice));
        break;
    }

    return eventMap;
  }

  /**
   * Рендеринг списка событий согласно выбранной сортировке
   *
   * @return {void}
   */
  _renderEvents() {
    let i = 0;
    const eventMap = this._getEventMap();

    for (const [dayDate, eventList] of eventMap) {
      const dayNumber = dayDate === null ? null : (i + 1);
      const dayComponent = new DayView({dayNumber, dayDate});

      this._dayComponentMap.set(dayDate, dayComponent);
      render(this._dayListComponent, dayComponent, RenderPosition.BEFOREEND);

      for (const event of eventList) {
        this._eventPresenterMap.set(
            event.id,
            new EventPresenter(dayComponent.eventsContainer, event, this._updateEvent, this._resetAllEvents)
        );
      }

      i++;
    }
  }

  /**
   * Хендлер обновления данных списка событий. Передается объект
   * с обновленными данными одного из события в списке, обновляется весь
   * список.
   *
   * @param  {Object} newEventData - Объект с обновленными данными события.
   * @param  {Boolean} updateView      - Флаг перерисовки отображения.
   * @return {void}
   */
  _updateEvent(newEventData, updateView = true) {
    this._eventsModel.update(UpdateMode.DATA, newEventData);
    if (updateView) {
      this._eventPresenterMap.get(newEventData.id).update(newEventData);
    }
  }

  /**
   * Рендеринг шаблона заглушки для состояния списка без событий.
   *
   * @return {void}
   */
  _renderFallback() {
    render(this._container, this._noEventsComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Очистка контейнера с событиями.
   *
   * @return {void}
   */
  _clearEventList() {
    this._eventPresenterMap.forEach((event) => event.destroy());
    this._eventPresenterMap.clear();
    this._dayComponentMap.forEach((day) => day.remove());
    this._dayComponentMap.clear();
  }

  /**
   * Хендлер для метода сортировки событий. Перед применением очищает список.
   *
   * @param  {String} sortingMethod - Метод сортировки согласно перечислению
   *                                  SortingMethod.
   * @return {void}
   */
  _sortEvents(sortingMethod) {
    if (this._currentSortingMethod === sortingMethod) {
      return;
    }

    this._currentSortingMethod = sortingMethod;

    this._clearEventList();
    this._renderEvents();
  }

  /**
   * Закртие всех форм редактирования.
   *
   * @return {void}
   */
  _resetAllEvents() {
    this._eventPresenterMap.forEach((eventPresenter) => {
      eventPresenter.reset();
    });
  }
}
