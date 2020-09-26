import StatsView from "../view/stats-view.js";
import TripPointsView from "../view/trip-points-view.js";
import LoadingView from "../view/loading-view.js";

import {render, RenderPosition} from "../utils/render.js";

export default class StatsPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container       - Узел документа для презентера.
   * @param  {Observer} pointsModel - Модель для работы с точками.
   * @param  {Object} typesModel    - Модель для работы с типами.
   */
  constructor(container, pointsModel, typesModel) {
    this._container = container;
    this._pointsModel = pointsModel;
    this._typesModel = typesModel;

    this._statsComponent = null;
    this._tripPointsComponent = null;
    this._loadingComponent = null;

    this._statsMap = null;
    this._isInitialized = false;
  }

  /**
   * Инициализация и первичная отрисовка списка точек.
   */
  init() {
    if (this._isInitialized) {
      this.destroy();
    }

    // В случае, если пользователь успел переключиться на экран статистики
    // до того, как загрузились данные по маршруту
    if (this._pointsModel.isDelivered) {
      this._renderStats();
      this._isInitialized = true;
    } else {
      this._renderFallback();
      this._pointsModel.loadData(() => {
        this._clearFallback();
        this._renderStats();
        this._isInitialized = true;
      });
    }
  }

  /**
   * Очистка презентера - Удаление списка точек и заголовка с сортировками.
   */
  destroy() {
    if (!this._isInitialized) {
      return;
    }

    this._clearFallback();
    this._clearStats();

    this._isInitialized = false;
  }

  /**
   * Отрисовка заглушки загрузки данных.
   */
  _renderFallback() {
    if (!this._tripPointsComponent) {
      this._tripPointsComponent = new TripPointsView();
    }

    if (!this._loadingComponent) {
      this._loadingComponent = new LoadingView();
    }

    render(this._container, this._tripPointsComponent, RenderPosition.BEFOREEND);
    render(this._tripPointsComponent, this._loadingComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Очистка заглушки загрузки данных.
   */
  _clearFallback() {
    if (this._tripPointsComponent) {
      this._tripPointsComponent.remove();
      this._tripPointsComponent = null;
    }

    if (this._loadingComponent) {
      this._loadingComponent.remove();
      this._loadingComponent = null;
    }
  }

  /**
   * Очистка экрана статистики.
   */
  _clearStats() {
    if (this._statsComponent) {
      this._statsComponent.remove();
      this._statsComponent = null;
    }
  }

  /**
   * Отрисовка экрана статистики
   */
  _renderStats() {
    this._statsMap = this._getStats();
    this._statsComponent = new StatsView(
        this._getMoneySpending(),
        this._getTransportUsed(),
        this._getTimeConsumed()
    );
    render(this._container, this._statsComponent, RenderPosition.BEFOREEND);
  }

  /**
   * Получение общего набора данных для вывода статистики.
   *
   * @return {Map} - Карта с учтетом количества точек по типам, потраченных
   *                 денег и времени.
   */
  _getStats() {
    const statsMap = new Map();
    this._pointsModel.list.forEach((point) => {
      let typeStats = statsMap.get(point.type);

      if (!typeStats) {
        const type = this._typesModel.getById(point.type);
        typeStats = {
          title: type.title,
          spending: 0,
          amount: 0,
          time: 0,
          isTransport: type.isTransport
        };
      }

      typeStats.spending += parseInt(point.price, 10);
      typeStats.amount += 1;
      typeStats.time += point.endTime.valueOf() - point.beginTime.valueOf();

      statsMap.set(point.type, typeStats);
    });

    return statsMap;
  }

  /**
   * Получение отсортированного списка расходов по типам точек
   *
   * @return {Map} - Карта, где ключ — тип точки, а значение — расход.
   */
  _getMoneySpending() {
    if (!this._statsMap) {
      this._statsMap = this._getStats();
    }

    const moneySpending = [];
    this._statsMap.forEach((stats) => {
      moneySpending.push([stats.title, stats.spending]);
    });

    moneySpending.sort((typeA, typeB) => typeB[1] - typeA[1]);

    return new Map(moneySpending);
  }


  /**
   * Получение отсортированного списка с количеством использования транспортных
   * типов точек.
   *
   * @return {Map} - Карта, где ключ — тип точки, а значение — количество использований.
   */
  _getTransportUsed() {
    if (!this._statsMap) {
      this._statsMap = this._getStats();
    }

    const transports = [];
    this._statsMap.forEach((stats) => {
      if (!stats.isTransport) {
        return;
      }

      transports.push([stats.title, stats.amount]);
    });

    transports.sort((typeA, typeB) => typeB[1] - typeA[1]);

    return new Map(transports);
  }

  /**
   * Получение отсортированного списка затраченного времени в часах
   * по типам точек.
   *
   * @return {Map} - Карта, где ключ — тип точки, а значение — время в часах.
   */
  _getTimeConsumed() {
    if (!this._statsMap) {
      this._statsMap = this._getStats();
    }

    const timeConsumptions = [];
    this._statsMap.forEach((stats) => {
      timeConsumptions.push([stats.title, stats.time]);
    });

    timeConsumptions.sort((typeA, typeB) => typeB[1] - typeA[1]);
    const hoursConsumptions = timeConsumptions.map((type) => {
      return [type[0], Math.ceil(type[1] / 1000 / 60 / 60)];
    });

    return new Map(hoursConsumptions);
  }
}
