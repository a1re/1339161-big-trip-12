import AbstractView from "./abstract-view.js";

export default class TripPointsView extends AbstractView {
  get template() {
    return `<section class="trip-events">
            <h2 class="visually-hidden">Trip events</h2>
          </section>`;
  }
}
