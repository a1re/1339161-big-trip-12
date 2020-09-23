import AbstractView from "./abstract-view.js";

export default class TripPointsView extends AbstractView {
  /**
   * Геттер шаблона контейнера для списка дней.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    return `<section class="trip-events">
            <h2 class="visually-hidden">Trip events</h2>
          </section>`;
  }
}
