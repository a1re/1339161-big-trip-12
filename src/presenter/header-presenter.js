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
   * @param  {Observer} pointsModel  - Модель для работы с точками.
   * @param  {Observer} filtersModel - Модель для работы с фильтрациями.
   * @param  {Function} displayTable - Коллбек открытия списка точек.
   * @param  {Function} displayStats - Коллбек открытия статистики.
   */
  constructor(container, pointsModel, filtersModel, displayTable, displayStats) {
    this._container = container;
    this._pointsModel = pointsModel;
    this._filtersModel = filtersModel;

    this._displayTable = displayTable;
    this._displayStats = displayStats;

    this._tripInfoComponent = null;
    this._filtersComponent = null;
    this._menuComponent = null;

    this._updatePresenter = this._updatePresenter.bind(this);
    this._filterPoints = this._filterPoints.bind(this);

    this._menuContainer = container.querySelector(`.trip-controls h2:first-child`);
    this._filtersContainer = container.querySelector(`.trip-controls h2:last-child`);

    this._pointsModel.subscribe(this._updatePresenter);
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
    this._tripInfoComponent = new TripInfoView(this._pointsModel.list);
    render(this._container, this._tripInfoComponent, RenderPosition.AFTERBEGIN);
  }

  /**
   * Отрисовка меню фильтров.
   */
  _renderFilters() {
    this._filtersComponent = new FiltersView(this._filtersModel.list);
    this._filtersComponent.filterPointsHandler = this._filterPoints;
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
   * Хендлер для метода фильтрации точек.
   *
   * @param  {String} filterId - Id метода фильтрации.
   */
  _filterPoints(filterId) {
    if (this._filtersModel.active === filterId) {
      return;
    }

    this._filtersModel.active = filterId;
  }
}
