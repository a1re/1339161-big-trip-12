import AbstractView from "./abstract-view.js";

export default class DayListView extends AbstractView {
  /**
   * Геттер шаблона контейнера дней для маршрута.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    return `<ul class="trip-days"></div>`;
  }
}
