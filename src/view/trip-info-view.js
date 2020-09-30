import {MAX_ITINERARY_POINTS} from "../const.js";
import AbstractView from "./abstract-view.js";

import he from "he";

export default class TripInfoView extends AbstractView {
  /**
   * Конструктор отображения информации о маршруте.
   *
   * @param  {Array} pointList - Список всех точек.
   * @param  {Array} offerList - Список всех спец. предложений.
   */
  constructor(pointList, offerList) {
    super();
    this._pointList = pointList;
    this._offerList = offerList;
  }

  /**
   * Геттер шаблона отображения информации о маршруте.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
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
   * Подсчет стоимости поездки по списку точек (включая доп. опции).
   *
   * @return {Number} - Итоговая стоимость.
   */
  _getTotalPrice() {
    let totalPrice = 0;

    this._pointList.forEach((point) => {
      totalPrice += point.price;
      point.offers.forEach((offer) => {
        totalPrice += offer.price;
      });
    });

    return totalPrice;
  }

  /**
   * Опеределние общего маршрута по списку точек.
   *
   * @return {string} - Итоговый маршрут.
   */
  _getTripSummary() {
    if (this._pointList.length === 0) {
      return ``;
    }

    const uniquePoints = this._pointList.filter((element, index, array) => {
      return index === 0 || element.destination !== array[index - 1].destination;
    });

    if (uniquePoints.length === 1) {
      return he.encode(uniquePoints[0].destination.name);
    }

    const itinerary = [];
    itinerary.push(he.encode(uniquePoints[0].destination.name));
    if (uniquePoints.length === MAX_ITINERARY_POINTS) {
      itinerary.push(he.encode(uniquePoints[1].destination.name));
    } else if (uniquePoints.length > MAX_ITINERARY_POINTS) {
      itinerary.push(`...`);
    }
    itinerary.push(uniquePoints[uniquePoints.length - 1].destination.name);

    return itinerary.join(` &mdash; `);
  }

  /**
   * Опеределние дат начала и конца путешествия по списку точек. В случае,
   * если даты остаются в рамках одного месяца, он пишется только один раз,
   * в конце (т.е. `30 MAR - 2 APR` или `28 - 30 MAR`);
   *
   * @return {String}  - Строка с датами.
   */
  _getTiming() {
    const pointList = this._pointList.slice().sort((a, b) => {
      return a.beginTime.valueOf() - b.beginTime.valueOf();
    });

    if (pointList.length === 0) {
      return ``;
    }

    const dayStart = pointList[0].beginTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthStart = pointList[0].beginTime.toLocaleString(`en-US`, {month: `short`});
    const dayFinish = pointList[pointList.length - 1].endTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthFinish = pointList[pointList.length - 1].endTime.toLocaleString(`en-US`, {month: `short`});

    return `${dayStart} ${(monthFinish !== monthStart) ? monthStart : ``}&nbsp;&mdash;&nbsp;${dayFinish} ${monthFinish}`;
  }
}
