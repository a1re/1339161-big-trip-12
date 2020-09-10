import {TripInfoView} from "../view/trip-info-view.js";
import {MenuView} from "../view/menu-view.js";
import {FiltersView} from "../view/filters-view.js";

import {render, RenderPosition} from "../utils/render.js";

export class HeaderPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} container — Узел документа для презентера.
   */
  constructor(container) {
    this._container = container;

    this._menuContainer = container.querySelector(`.trip-controls h2:first-child`);
    this._filtersContainer = container.querySelector(`.trip-controls h2:last-child`);
  }

  /**
   * Инициализация и первичная отрисовка заголовка.
   *
   * @param  {array} eventList - Список событий.
   * @return {void}
   */
  init(eventList) {
    render(this._container, new TripInfoView(eventList), RenderPosition.AFTERBEGIN);
    render(this._menuContainer, new MenuView(), RenderPosition.AFTEREND);
    render(this._filtersContainer, new FiltersView(), RenderPosition.AFTEREND);
  }
}