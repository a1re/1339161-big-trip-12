import AbstractView from "./abstract-view.js";

import he from "he";

export default class TripInfoView extends AbstractView {
  /**
   * Конструктор отображения
   * @param  {Array} eventList - Список всех событий.
   * @param  {Array} offerList - Список всех спец. предложений.
   */
  constructor(eventList, offerList) {
    super();
    this._eventList = eventList;
    this._offerList = offerList;
  }

  /**
   * Геттер шаблона.
   */
  get template() {
    const totalPrice = this._getTotalPrice();
    const tripSummary = this._getTripSummary();
    const timing = this._getTiming();

    return `<section class="trip-main__trip-info trip-info">
              <div class="trip-info__main">
                <h1 class="trip-info__title">${tripSummary}</h1>
                <p class="trip-info__dates">${timing}</p>
              </div>
              <p class="trip-info__cost">
                Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
              </p>
            </section>`;
  }

  /**
   * Подсчет стоимости поездки по списку событий (включая доп. опции).
   *
   * @return {Number} - Итоговая стоимость.
   */
  _getTotalPrice() {
    let totalPrice = 0;

    this._eventList.forEach((event) => {
      totalPrice += event.price;
      event.offers.forEach((offerId) => {
        const selectedOffer = this._offerList.find((offer) => offer.id === offerId);
        if (selectedOffer) {
          totalPrice += selectedOffer.price;
        }
      });
    });

    return totalPrice;
  }

  /**
   * Опеределние общего маршрута по списку событий.
   *
   * @return {string} - Итоговый маршрут.
   */
  _getTripSummary() {
    if (this._eventList.length === 0) {
      return ``;
    }

    const uniquePoints = this._eventList.filter((element, index, array) => {
      return index === 0 || element.city !== array[index - 1].city;
    });

    if (uniquePoints.length === 1) {
      return he.encode(uniquePoints[0].city);
    }

    const route = [];
    route.push(he.encode(uniquePoints[0].city));
    if (uniquePoints.length === 3) {
      route.push(he.encode(uniquePoints[1].city));
    } else if (uniquePoints.length > 3) {
      route.push(`...`);
    }
    route.push(uniquePoints[uniquePoints.length - 1].city);

    return route.join(` &mdash; `);
  }

  /**
   * Опеределние дат начала и конца путешествия по списку событий. В случае,
   * если даты остаются в рамках одного месяца, он пишется только один раз,
   * в конце (т.е. `30 MAR - 2 APR` или `28 - 30 MAR`);
   *
   * @return {String}  - Строка с датами.
   */
  _getTiming() {
    const eventList = this._eventList.slice().sort((a, b) => {
      return a.beginTime.valueOf() - b.beginTime.valueOf();
    });

    if (eventList.length === 0) {
      return ``;
    }

    const dayStart = eventList[0].beginTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthStart = eventList[0].beginTime.toLocaleString(`en-US`, {month: `short`});
    const dayFinish = eventList[eventList.length - 1].endTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthFinish = eventList[eventList.length - 1].endTime.toLocaleString(`en-US`, {month: `short`});

    return `${dayStart}${(monthFinish !== monthStart) ? monthStart : ``}&nbsp;&mdash;&nbsp;${dayFinish} ${monthFinish}`;
  }
}
