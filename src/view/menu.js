import AbstractView from "./abstract.js";

export default class Menu extends AbstractView {
  get template() {
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
              <h2 class="visually-hidden">Switch trip view</h2>
              <a class="trip-tabs__btn  trip-tabs__btn--active" href="#">Table</a>
              <a class="trip-tabs__btn" href="#">Stats</a>
            </nav>`;
  }
}
