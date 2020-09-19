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
   */
  constructor(container, eventsModel) {
    this._container = container;
    this._eventsModel = eventsModel;

    this._tripInfoComponent = null;

    this._pushModel = this._pushModel.bind(this);

    this._menuContainer = container.querySelector(`.trip-controls h2:first-child`);
    this._filtersContainer = container.querySelector(`.trip-controls h2:last-child`);

    this._eventsModel.subscribe(this._pushModel);
  }

  /**
   * Инициализация и первичная отрисовка заголовка.
   *
   * @param  {array} eventList - Список событий.
   * @return {void}
   */
  init() {
    render(this._menuContainer, new MenuView(), RenderPosition.AFTEREND);
    render(this._filtersContainer, new FiltersView(), RenderPosition.AFTEREND);

    this._renderTripInfo();
  }

  _getEventList() {
    return this._eventsModel.eventList;
  }

  _pushModel(updateMode) {
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

  _clearTripInfo() {
    this._tripInfoComponent.remove();
  }

  _renderTripInfo() {
    this._tripInfoComponent = new TripInfoView(this._getEventList());
    render(this._container, this._tripInfoComponent, RenderPosition.AFTERBEGIN);
  }
}
