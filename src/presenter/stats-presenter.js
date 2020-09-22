import StatsView from "../view/stats-view.js";

import {render, RenderPosition} from "../utils/render.js";

export default class TripPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container         - Узел документа для презентера.
   * @param  {Observer} eventsModel   - Модель для работы с событиями.
   */
  constructor(container, eventsModel) {
    this._container = container;
    this._eventsModel = eventsModel;
    this._statsComponent = null;
    this._isInitialized = false;
  }

  /**
   * Инициализация и первичная отрисовка списка событий.
   */
  init() {
    if (this._isInitialized) {
      this.destroy();
    }
    this._renderStats();
    this._isInitialized = true;
  }

  /**
   * Очистка презентера - удаление списка событий и заголовка с сортировками.
   */
  destroy() {
    if (!this._isInitialized) {
      return;
    }
    this._statsComponent.remove();
    this._isInitialized = false;
  }

  _renderStats() {
    this._statsComponent = new StatsView();
    render(this._container, this._statsComponent, RenderPosition.BEFOREEND);
  }
}
