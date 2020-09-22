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
   * @param  {Node} container        - Узел документа для презентера.
   * @param  {Observer} eventsModel  - Модель для работы с событиями.
   * @param  {Object} offersModel    - Модель для работы с спец. предложениями.
   * @param  {Observer} filtersModel - Модель для работы с фильтрациями.
   * @param  {Function} displayTable - Коллбек открытия списка событий.
   * @param  {Function} displayStats - Коллбек открытия статистики.
   */
  constructor(container, eventsModel, offersModel, filtersModel, displayTable, displayStats) {
    this._container = container;
    this._eventsModel = eventsModel;
    this._offersModel = offersModel;
    this._filtersModel = filtersModel;

    this._displayTable = displayTable;
    this._displayStats = displayStats;

    this._tripInfoComponent = null;
    this._filtersComponent = null;
    this._menuComponent = null;

    this._updatePresenter = this._updatePresenter.bind(this);
    this._filterEvents = this._filterEvents.bind(this);

    this._menuContainer = container.querySelector(`.trip-controls h2:first-child`);
    this._filtersContainer = container.querySelector(`.trip-controls h2:last-child`);

    this._eventsModel.subscribe(this._updatePresenter);
    this._filtersModel.subscribe(this._updatePresenter);

    this._isInitialized = false;
  }

  /**
   * Инициализация и первичная отрисовка заголовка.
   */
  init() {
    if (this._isInitialized) {
      this.destroy();
    }
    this._renderMenu();
    this._renderFilters();
    this._renderTripInfo();
    this._isInitialized = true;
  }

  /**
   * Очистка презентера.
   */
  destroy() {
    this._menuComponent.remove();
    this._filtersComponent.remove();
    this._tripInfoComponent.remove();
    this._isInitialized = false;
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
        this.init();
        break;
      case UpdateMode.MAJOR:
        this.init();
        break;
    }
  }

  /**
   * Отрисовка сводки о машруте, датах и общей стооимости поездки.
   */
  _renderTripInfo() {
    this._tripInfoComponent = new TripInfoView(this._eventsModel.eventList, this._offersModel.getList());
    render(this._container, this._tripInfoComponent, RenderPosition.AFTERBEGIN);
  }

  /**
   * Отрисовка меню фильтров.
   */
  _renderFilters() {
    this._filtersComponent = new FiltersView(this._filtersModel.list);
    this._filtersComponent.filterEventsHandler = this._filterEvents;
    render(this._filtersContainer, this._filtersComponent, RenderPosition.AFTEREND);
  }

  /**
   * Отрисовка меню.
   */
  _renderMenu() {
    this._menuComponent = new MenuView();
    this._menuComponent.displayTable = this._displayTable;
    this._menuComponent.displayStats = this._displayStats;
    render(this._menuContainer, this._menuComponent, RenderPosition.AFTEREND);
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
