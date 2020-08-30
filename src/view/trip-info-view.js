import {AbstractView} from "./abstract-view.js";
import {Itinerary} from "../utils/itinerary.js";

export class TripInfoView extends AbstractView {
  constructor(events) {
    super();
    this._events = events;
  }

  get template() {
    return `<section class="trip-main__trip-info trip-info">
              <div class="trip-info__main">
                <h1 class="trip-info__title">${Itinerary.summarize(this._events)}</h1>
                <p class="trip-info__dates">${Itinerary.getTiming(this._events)}</p>
              </div>
              <p class="trip-info__cost">
                Total: &euro;&nbsp;<span class="trip-info__cost-value">${Itinerary.calcPrice(this._events)}</span>
              </p>
            </section>`;
  }
}
