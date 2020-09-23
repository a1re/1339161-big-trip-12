import SortingView from "../view/sorting-view.js";
import NoPointsView from "../view/no-points-view.js";
import DayListView from "../view/day-list-view.js";
import DayView from "../view/day-view.js";

import PointPresenter from "./point-presenter.js";
import NewPointPresenter from "./new-point-presenter.js";

import {render, RenderPosition} from "../utils/render.js";
import {UpdateMode} from "../const.js";

export default class TripPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container           - Узел документа для презентера.
   * @param  {Observer} pointsModel     - Модель для работы с точками.
   * @param  {Object} destinationsModel - Модель для работы с городами.
   * @param  {Object} typesModel        - Модель для работы с типамм точек.
   * @param  {Object} offersModel       - Модель для работы с спец. предложениями.
   * @param  {Observer} filtersModel    - Модель для работы с фильтрациями.
   * @param  {Observer} sortingsModel   - Модель для работы с сортировками.
   */
  constructor(container, pointsModel, destinationsModel, typesModel, offersModel, filtersModel, sortingsModel) {
    this._container = container;

    this._pointsModel = pointsModel;
    this._destinationsModel = destinationsModel;
    this._typesModel = typesModel;
    this._offersModel = offersModel;
    this._sortingsModel = sortingsModel;
    this._filtersModel = filtersModel;

    this._noPointsComponent = null;
    this._sortingComponent = null;
    this._dayListComponent = null;

    this._dayComponentMap = new Map();
    this._pointPresenterMap = new Map();

    this._newPointPresenter = null;

    this._updatePoint = this._updatePoint.bind(this);
    this._updatePresenter = this._updatePresenter.bind(this);
    this._sortPoints = this._sortPoints.bind(this);
    this._switchAllPointsMode = this._switchAllPointsMode.bind(this);

    this._pointsModel.subscribe(this._updatePresenter);
    this._sortingsModel.subscribe(this._updatePresenter);
    this._filtersModel.subscribe(this._updatePresenter);

    this._isInitialized = false;
  }

  /**
   * Инициализация и первичная отрисовка списка точек.
   */
  init() {
    if (this._isInitialized) {
      this.destroy();
    }
    this._renderCaption();
    this._renderPoints();
    this._isInitialized = true;
  }

  /**
   * Очистка презентера - удаление списка точек и заголовка с сортировками.
   */
  destroy() {
    if (!this._isInitialized) {
      return;
    }
    this._clearPoints();
    this._clearCaption();
    this._isInitialized = false;
  }

  /**
   * Открытие формы добавления новой точки.
   */
  createNewPoint() {
    this._sortingsModel.reset();
    this._filtersModel.reset();
    this.init();

    this._newPointPresenter = new NewPointPresenter(
        this._dayListComponent.element,
        this._pointsModel,
        this._destinationsModel,
        this._typesModel,
        this._offersModel,
        this._switchAllPointsMode
    );
  }

  /**
   * Коллбек уведомления об обновлении модели
   * @param  {String} updateMode - Режим обновления согласно перечислению
   *                               UpdateMode.
   * @param  {Object} pointData  - Объект с обновленной информацией о точке.
   */
  _updatePresenter(updateMode, pointData) {
    switch (updateMode) {
      case UpdateMode.PATCH:
        this._pointPresenterMap.get(pointData.id).refresh(pointData);
        break;
      case UpdateMode.MINOR:
        this._clearPoints();
        this._renderPoints();
        break;
      case UpdateMode.MAJOR:
        this._clearPoints();
        this._clearCaption();
        this._sortingsModel.reset();
        this._renderCaption();
        this._renderPoints();
        break;
    }
  }

  /**
   * Получение упорядоченного согласно заданной сортировке списка точек
   * в виде массива.
   *
   * @return {Array} - Карта точек.
   */
  _getPointList() {
    const pointList = this._pointsModel.pointList.slice()
      .filter(this._filtersModel.callback);

    return pointList.sort(this._sortingsModel.callback);
  }

  /**
   * Рендеринг шаблона заглушки для состояния списка без точек.
   */
  _renderFallback() {
    this._noPointsComponent = new NoPointsView();
    render(this._container, this._noPointsComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Рендеринг заголовка таблицы.
   */
  _renderCaption() {
    this._sortingComponent = new SortingView(this._sortingsModel.list, this._sortingsModel.isGrouped);
    this._sortingComponent.sortPointsHandler = this._sortPoints;
    render(this._container, this._sortingComponent, RenderPosition.BEFOREEND);

    this._dayListComponent = new DayListView();
    render(this._container, this._dayListComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Рендеринг списка точек согласно выбранной сортировке.
   */
  _renderPoints() {
    if (this._noPointsComponent) {
      this._noPointsComponent.remove();
      this._noPointsComponent = null;
    }

    const pointList = this._getPointList();
    let previousDay;
    let dayComponent;

    if (pointList.length === 0) {
      this._renderFallback();
    }

    pointList.forEach((point) => {
      let dayNumber = point.dayNumber;
      let dayDate = point.dayDate;

      if (!this._sortingsModel.isGrouped) {
        dayNumber = null;
        dayDate = null;
      }

      if (previousDay !== dayNumber) {
        dayComponent = new DayView({dayNumber, dayDate});
        this._dayComponentMap.set(dayDate, dayComponent);
        render(this._dayListComponent, dayComponent, RenderPosition.BEFOREEND);
      }

      this._pointPresenterMap.set(
          point.id,
          new PointPresenter(
              dayComponent.pointsContainer,
              point,
              this._pointsModel,
              this._destinationsModel,
              this._typesModel,
              this._offersModel,
              this._switchAllPointsMode
          )
      );

      previousDay = dayNumber;
    });
  }

  /**
   * Обработчик обновления данных списка точек. Передается объект
   * с обновленными данными одной из точек в списке, обновляется весь
   * список.
   *
   * @param  {Object} newEventData  - Объект с обновленными данными точки.
   * @param  {Boolean} updateView   - Флаг перерисовки отображения.
   */
  _updatePoint(newEventData, updateView = true) {
    this._pointsModel.update(UpdateMode.DATA, newEventData);
    if (updateView) {
      this._pointPresenterMap.get(newEventData.id).update(newEventData);
    }
  }

  /**
   * Очистка контейнера с точками.
   */
  _clearPoints() {
    this._pointPresenterMap.forEach((point) => point.destroy());
    this._pointPresenterMap.clear();
    this._dayComponentMap.forEach((day) => day.remove());
    this._dayComponentMap.clear();
  }

  /**
   * Очистка заголовка и контейнера таблицы
   */
  _clearCaption() {
    if (this._newPointPresenter) {
      this._newPointPresenter.destroy();
      this._newPointPresenter = null;
    }

    this._dayListComponent.remove();
    this._dayListComponent = null;

    this._sortingComponent.remove();
    this._sortingComponent = null;
  }

  /**
   * Сортировка точек. Перед применением очищает список.
   *
   * @param  {String} sortingId - Id метода сортировки.
   */
  _sortPoints(sortingId) {
    if (this._sortingsModel.active === sortingId) {
      return;
    }

    this._sortingsModel.active = sortingId;

    this._clearPoints();
    this._renderPoints();
  }

  /**
   * Переключает все точки в нужный режим (должен соответствовать одному
   * из значений перечисления PointMode).
   *
   * @param  {String} pointMode - Режим отображения.
   */
  _switchAllPointsMode(pointMode) {
    this._pointPresenterMap.forEach((pointPresenter) => {
      pointPresenter.switchMode(pointMode);
    });

    if (this._newPointPresenter) {
      this._newPointPresenter.destroy();
      this._newPointPresenter = null;
    }
  }
}
