import AbstractView from "./abstract.js";
import {Route} from "../utils/route.js";

export default class Heading extends AbstractView {
  constructor(events) {
    super();
    this._events = events;
  }

  get template() {
    return `<section class="trip-main__trip-info trip-info">
              <div class="trip-info__main">
                <h1 class="trip-info__title">${Route.summarize(this._events)}</h1>
                <p class="trip-info__dates">${Route.getTiming(this._events)}</p>
              </div>
              <p class="trip-info__cost">
                Total: &euro;&nbsp;<span class="trip-info__cost-value">${Route.calcPrice(this._events)}</span>
              </p>
            </section>`;
  }
}
