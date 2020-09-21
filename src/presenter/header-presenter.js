import TripInfoView from "../view/trip-info-view.js";
import MenuView from "../view/menu-view.js";
import FiltersView from "../view/filters-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {UpdateMode} from "../const.js";

export default class HeaderPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container       — Узел документа для презентера.
   * @param  {Observer} eventsModel – Модель для работы с событиями.
   * @param  {Observer} filtersModel – Модель для работы с фильтрациями.
   */
  constructor(container, eventsModel, filtersModel) {
    this._container = container;
    this._eventsModel = eventsModel;
    this._filtersModel = filtersModel;

    this._tripInfoComponent = null;
    this._filtersComponent = new FiltersView(this._filtersModel.list);
    this._menuComponent = new MenuView();

    this._updatePresenter = this._updatePresenter.bind(this);
    this._filterEvents = this._filterEvents.bind(this);

    this._menuContainer = container.querySelector(`.trip-controls h2:first-child`);
    this._filtersContainer = container.querySelector(`.trip-controls h2:last-child`);

    this._eventsModel.subscribe(this._updatePresenter);
  }

  /**
   * Инициализация и первичная отрисовка заголовка.
   *
   * @param  {array} eventList - Список событий.
   * @return {void}
   */
  init() {
    this._filtersComponent.filterEventsHandler = this._filterEvents;
    render(this._menuContainer, this._menuComponent, RenderPosition.AFTEREND);
    render(this._filtersContainer, this._filtersComponent, RenderPosition.AFTEREND);

    this._renderTripInfo();
  }

  /**
   * Коллбек уведомления об обновлении от модели
   *
   * @param  {String} updateMode - Режим обновления согласно перечислению
   *                               UpdateMode.
   */
  _updatePresenter(updateMode) {
    switch (updateMode) {
      case UpdateMode.MINOR:
        this._clearTripInfo();
        this._renderTripInfo();
        break;
      case UpdateMode.MAJOR:
        this._clearTripInfo();
        this._renderTripInfo();
        break;
    }
  }

  /**
   * Очистка сводки о машруте, датах и общей стооимости поездки.
   */
  _clearTripInfo() {
    this._tripInfoComponent.remove();
  }

  /**
   * Отрисовка сводки о машруте, датах и общей стооимости поездки.
   */
  _renderTripInfo() {
    this._tripInfoComponent = new TripInfoView(this._eventsModel.eventList);
    render(this._container, this._tripInfoComponent, RenderPosition.AFTERBEGIN);
  }

  /**
   * Хендлер для метода фильтрации событий.
   *
   * @param  {String} filterId - Id метода фильтрации.
   * @return {void}
   */
  _filterEvents(filterId) {
    if (this._filtersModel.active === filterId) {
      return;
    }

    this._filtersModel.active = filterId;
  }
}
