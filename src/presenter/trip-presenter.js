import SortingView from "../view/sorting-view.js";
import NoEventsView from "../view/no-events-view.js";
import DayListView from "../view/day-list-view.js";
import DayView from "../view/day-view.js";

import EventPresenter from "./event-presenter.js";

import {render, RenderPosition} from "../utils/render.js";
import {UpdateMode} from "../const.js";

export default class TripPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container       — Узел документа для презентера.
   * @param  {Observer} eventsModel - Модель для работы с событиями.
   * @param  {Observer} filtersModel - Модель для работы с фильтрациями.
   * @param  {Observer} sortingsModel - Модель для работы с сортировками.
   */
  constructor(container, eventsModel, filtersModel, sortingsModel) {
    this._container = container;
    this._eventsModel = eventsModel;
    this._sortingsModel = sortingsModel;
    this._filtersModel = filtersModel;

    this._eventPresenterMap = new Map();
    this._dayComponentMap = new Map();

    this._dayListComponent = new DayListView();
    this._noEventsComponent = new NoEventsView();
    this._sortingComponent = new SortingView(this._sortingsModel.list, this._sortingsModel.isGrouped);

    this._updateEvent = this._updateEvent.bind(this);
    this._updatePresenter = this._updatePresenter.bind(this);
    this._sortEvents = this._sortEvents.bind(this);
    this._switchAllEventsMode = this._switchAllEventsMode.bind(this);

    this._eventsModel.subscribe(this._updatePresenter);
    this._sortingsModel.subscribe(this._updatePresenter);
    this._filtersModel.subscribe(this._updatePresenter);
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
   * Коллбек уведомления об обновлении модели
   * @param  {String} updateMode - Режим обновления согласно перечислению
   *                               UpdateMode.
   * @param  {Object} eventData  - Объект с обновленной информацией о событии.
   */
  _updatePresenter(updateMode, eventData) {
    switch (updateMode) {
      case UpdateMode.PATCH:
        this._eventPresenterMap.get(eventData.id).update(eventData);
        break;
      case UpdateMode.MINOR:
        this._clearEvents();
        this._renderEvents();
        break;
      case UpdateMode.MAJOR:
        this._sortingsModel.reset();
        this._clearEvents();
        this._renderEvents();
        break;
    }
  }

  /**
   * Получение упорядоченного согласно заданной сортировке списка события
   * в виде массива.
   *
   * @return {Array} - Карта событий.
   */
  _getEventList() {
    const eventList = this._eventsModel.eventList.slice()
      .filter(this._filtersModel.callback);

    return eventList.sort(this._sortingsModel.callback);
  }

  /**
   * Рендеринг списка событий согласно выбранной сортировке
   *
   * @return {void}
   */
  _renderEvents() {
    const eventList = this._getEventList();
    let previousDay;
    let dayComponent;

    eventList.forEach((event) => {
      let dayNumber = event.dayNumber;
      let dayDate = event.dayDate;

      if (!this._sortingsModel.isGrouped) {
        dayNumber = null;
        dayDate = null;
      }

      if (previousDay !== dayNumber) {
        dayComponent = new DayView({dayNumber, dayDate});
        this._dayComponentMap.set(dayDate, dayComponent);
        render(this._dayListComponent, dayComponent, RenderPosition.BEFOREEND);
      }

      this._eventPresenterMap.set(
          event.id,
          new EventPresenter(
              dayComponent.eventsContainer,
              event,
              this._eventsModel,
              this._switchAllEventsMode
          )
      );

      previousDay = dayNumber;
    });
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
  _clearEvents() {
    this._eventPresenterMap.forEach((event) => event.destroy());
    this._eventPresenterMap.clear();
    this._dayComponentMap.forEach((day) => day.remove());
    this._dayComponentMap.clear();
  }

  /**
   * Хендлер для метода сортировки событий. Перед применением очищает список.
   *
   * @param  {String} sortingId - Id метода сортировки.
   * @return {void}
   */
  _sortEvents(sortingId) {
    if (this._sortingsModel.active === sortingId) {
      return;
    }

    this._sortingsModel.active = sortingId;

    this._clearEvents();
    this._renderEvents();
  }

  /**
   * Переключает все события в нужный режим (должен соответствовать одному
   * из значений перечисления EventMode).
   *
   * @param  {String} eventMode - Режим отображения.
   */
  _switchAllEventsMode(eventMode) {
    this._eventPresenterMap.forEach((eventPresenter) => {
      eventPresenter.switchMode(eventMode);
    });
  }
}
