import {SortingView} from "../view/sorting-view.js";
import {NoEventsView} from "../view/no-events-view.js";
import {DayListView} from "../view/day-list-view.js";
import {DayView} from "../view/day-view.js";

import {EventPresenter} from "./event-presenter.js";

import {render, RenderPosition} from "../utils/render.js";
import {Itinerary} from "../utils/itinerary.js";

import {SortingMethod} from "../const.js";

export class TripPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container — Узел документа для презентера.
   */
  constructor(container) {
    this._container = container;
    this._currentSortingMethod = SortingMethod.EVENT;
    this._eventPresenter = new Map();
    this._dayComponent = new Map();

    this._dayListComponent = new DayListView();
    this._noEventsComponent = new NoEventsView();
    this._sortingComponent = new SortingView(this._currentSortingMethod);

    this._handleSortEvents = this._handleSortEvents.bind(this);
  }

  /**
   * Инициализация и первичная отрисовка списка событий.
   *
   * @param  {array} eventList - Список событий.
   * @return {void}
   */
  init(eventList) {
    this._eventList = eventList.slice();
    this._sortingComponent.sortEventsHandler = this._handleSortEvents;

    render(this._container, this._sortingComponent, RenderPosition.BEFOREEND);
    render(this._container, this._dayListComponent, RenderPosition.BEFOREEND);
    this._renderSortedEvents();
  }

  /**
   * Рендеринг событий в базовой сортировке по дням. В начале метода вызывается
   * функция Route.organizeByDays, которая конвертирует список событий в объект
   * Map, где ключем является дата, а значением — список событий в рамках даты.
   * В цикле для каждого дня вызывается метод this._renderDay, который и
   * отрисовывает сами события. Если в списке нет событий, то вызывается метод
   * this._renderFallback, который отрисовывает заглушку.
   *
   * @return {void}
   */
  _renderEventsByDay() {
    const dayList = Itinerary.organizeByDays(this._eventList);

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
   * Рендеринг событий внутри одного дня. Может также использоваться для
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
    this._dayComponent.set(dayDate, dayComponent);
    render(this._dayListComponent, dayComponent, RenderPosition.BEFOREEND);

    for (const event of eventList) {
      this._eventPresenter.set(
          event.id,
          new EventPresenter(dayComponent.eventsContainer, event)
      );
    }
  }

  /**
   * Вывод отсортированных событий. В зависимости от метода сортировки выбирает
   * нужную функцию для сортировки, а также метод вывода (если события
   * выводятся по дням, то нужно выводит методом _renderEventsByDay).
   *
   * @return {void}
   */
  _renderSortedEvents() {
    this._sortingComponent.sortingMethod = this._currentSortingMethod;

    switch (this._currentSortingMethod) {
      case SortingMethod.TIME:
        this._eventList.sort(Itinerary.sortByDuration);
        this._renderEventList(this._eventList);
        break;
      case SortingMethod.PRICE:
        this._eventList.sort(Itinerary.sortByPrice);
        this._renderEventList(this._eventList);
        break;
      default:
        this._eventList.sort(Itinerary.sortByEvents);
        this._renderEventsByDay(this._eventList);
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
    this._eventPresenter.forEach((event) => event.destroy());
    this._eventPresenter.clear();
    this._dayComponent.forEach((day) => day.remove());
    this._dayComponent.clear();
  }

  /**
   * Хендлер для метода сортировки событий. Перед применением очищает список.
   *
   * @param  {String} sortingMethod - Метод сортировки согласно перечислению
   *                                  SortingMethod.
   * @return {void}
   */
  _handleSortEvents(sortingMethod) {
    if (this._currentSortingMethod === sortingMethod) {
      return;
    }

    this._currentSortingMethod = sortingMethod;

    this._clearEventList();
    this._renderSortedEvents();
  }
}
