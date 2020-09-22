import AbstractView from "./abstract-view.js";

export default class TripEventsView extends AbstractView {
  get template() {
    return `<section class="trip-events">
            <h2 class="visually-hidden">Trip events</h2>
          </section>`;
  }
}
