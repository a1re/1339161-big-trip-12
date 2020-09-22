import SortingView from "../view/sorting-view.js";
import NoEventsView from "../view/no-events-view.js";
import DayListView from "../view/day-list-view.js";
import DayView from "../view/day-view.js";

import EventPresenter from "./event-presenter.js";
import NewEventPresenter from "./new-event-presenter.js";

import {render, RenderPosition} from "../utils/render.js";
import {UpdateMode, EventMode} from "../const.js";

export default class TripPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container         - Узел документа для презентера.
   * @param  {Observer} eventsModel   - Модель для работы с событиями.
   * @param  {Observer} offersModel   - Модель для работы с спец. предложениями.
   * @param  {Observer} filtersModel  - Модель для работы с фильтрациями.
   * @param  {Observer} sortingsModel - Модель для работы с сортировками.
   */
  constructor(container, eventsModel, offersModel, filtersModel, sortingsModel) {
    this._container = container;

    this._eventsModel = eventsModel;
    this._offersModel = offersModel;
    this._sortingsModel = sortingsModel;
    this._filtersModel = filtersModel;

    this._noEventsComponent = null;
    this._sortingComponent = null;
    this._dayListComponent = null;

    this._dayComponentMap = new Map();
    this._eventPresenterMap = new Map();

    this._newEventPresenter = null;

    this._updateEvent = this._updateEvent.bind(this);
    this._updatePresenter = this._updatePresenter.bind(this);
    this._sortEvents = this._sortEvents.bind(this);
    this._switchAllEventsMode = this._switchAllEventsMode.bind(this);

    this._eventsModel.subscribe(this._updatePresenter);
    this._sortingsModel.subscribe(this._updatePresenter);
    this._filtersModel.subscribe(this._updatePresenter);

    this._isInitialized = false;
  }

  /**
   * Инициализация и первичная отрисовка списка событий.
   */
  init() {
    if (this._isInitialized) {
      this.destroy();
    }
    this._renderCaption();
    this._renderEvents();
    this._isInitialized = true;
  }

  /**
   * Очистка презентера - удаление списка событий и заголовка с сортировками.
   */
  destroy() {
    if (!this._isInitialized) {
      return;
    }
    this._clearEvents();
    this._clearCaption();
    this._isInitialized = false;
  }

  /**
   * Открытие формы добавления нового события.
   */
  createNewEvent() {
    this._sortingsModel.reset();
    this._filtersModel.reset();
    this.init();

    this._newEventPresenter = new NewEventPresenter(
        this._dayListComponent.element,
        this._eventsModel,
        this._offersModel,
        this._switchAllEventsMode
    );
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
        this._eventPresenterMap.get(eventData.id).refresh(eventData);
        break;
      case UpdateMode.MINOR:
        this._clearEvents();
        this._renderEvents();
        break;
      case UpdateMode.MAJOR:
        this._clearEvents();
        this._clearCaption();
        this._sortingsModel.reset();
        this._renderCaption();
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
   * Рендеринг шаблона заглушки для состояния списка без событий.
   */
  _renderFallback() {
    this._noEventsComponent = new NoEventsView();
    render(this._container, this._noEventsComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Рендеринг заголовка таблицы.
   */
  _renderCaption() {
    this._sortingComponent = new SortingView(this._sortingsModel.list, this._sortingsModel.isGrouped);
    this._sortingComponent.sortEventsHandler = this._sortEvents;
    render(this._container, this._sortingComponent, RenderPosition.BEFOREEND);

    this._dayListComponent = new DayListView();
    render(this._container, this._dayListComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Рендеринг списка событий согласно выбранной сортировке.
   */
  _renderEvents() {
    if (this._noEventsComponent) {
      this._noEventsComponent.remove();
      this._noEventsComponent = null;
    }

    const eventList = this._getEventList();
    let previousDay;
    let dayComponent;

    if (eventList.length === 0) {
      this._renderFallback();
    }

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
              this._offersModel,
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
   */
  _updateEvent(newEventData, updateView = true) {
    this._eventsModel.update(UpdateMode.DATA, newEventData);
    if (updateView) {
      this._eventPresenterMap.get(newEventData.id).update(newEventData);
    }
  }

  /**
   * Очистка контейнера с событиями.
   */
  _clearEvents() {
    this._eventPresenterMap.forEach((event) => event.destroy());
    this._eventPresenterMap.clear();
    this._dayComponentMap.forEach((day) => day.remove());
    this._dayComponentMap.clear();
  }

  /**
   * Очистка заголовка и контейнера таблицы
   */
  _clearCaption() {
    if (this._newEventPresenter) {
      this._newEventPresenter.destroy();
      this._newEventPresenter = null;
    }

    this._dayListComponent.remove();
    this._dayListComponent = null;

    this._sortingComponent.remove();
    this._sortingComponent = null;
  }

  /**
   * Хендлер для метода сортировки событий. Перед применением очищает список.
   *
   * @param  {String} sortingId - Id метода сортировки.
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

    if (this._newEventPresenter) {
      this._newEventPresenter.destroy();
      this._newEventPresenter = null;
    }
  }
}
