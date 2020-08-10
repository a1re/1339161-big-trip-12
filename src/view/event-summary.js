import {getDuration} from "../utils.js";
import {MAX_OFFERS_TO_SHOW} from "../const.js";

/**
 * Построение шаблона строки с краткой сводкой по событию.
 *
 * @param  {Object} event - Описание события в формате объекта.
 * @return {string}       - Шаблон для вставки.
 */
export const makeEventSummaryTemplate = (event) => {
  let template = `<div class="event">
            <div class="event__type">
              <img class="event__type-icon" width="42" height="42" src="img/icons/${event.type.toLowerCase()}.png" alt="Event type icon">
            </div>
            <h3 class="event__title">${event.type} ${(event.isTransfer) ? `to` : `in`} ${event.city}</h3>

            <div class="event__schedule">
              <p class="event__time">
                <time class="event__start-time" datetime="${event.beginTime.toISOString()}">${event.beginTime.toLocaleTimeString(`en-US`, {timeStyle: `short`, hour12: false})}</time>
                &mdash;
                <time class="event__end-time" datetime="${event.endTime.toISOString()}">${event.endTime.toLocaleTimeString(`en-US`, {timeStyle: `short`, hour12: false})}</time>
              </p>
              <p class="event__duration">${getDuration(event.beginTime, event.endTime)}</p>
            </div>

            <p class="event__price">
              &euro;&nbsp;<span class="event__price-value">${event.price}</span>
            </p>`;

  const offers = Object.values(event.offers);
  if (offers.length > 0) {
    template += `<h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">`;

    for (let i = 0; i < MAX_OFFERS_TO_SHOW && i < offers.length; i++) {
      template += `<li class="event__offer">
            <span class="event__offer-title">${offers[i].title}</span>
            &plus;
            &euro;&nbsp;<span class="event__offer-price">${offers[i].price}</span>
          </li>`;
    }

    template += `</ul>`;
  }

  template += `<button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>`;


  return template;
};
