import moment from "moment";

export default class Itinerary {
  /**
   * Вычисление длительности события по времени начала и конца. Чтобы не
   * потеряться в часовых поясах, вычисление примитивно-математическое —
   * вначале берутся таймстемпы обеих дат, вычисляется разница между ними,
   * затем поочереди делится на целые дни, целые часы и целые минуты.
   *
   * @param  {Date} beginTime - Время начала события в объекте Date
   * @param  {Date} endTime   - Время окончания события в объекте Date
   * @return {String}         - Длительность события в формате строки вида
   *                           `01D 02H 03M`
   */
  static getDuration(beginTime, endTime) {
    const beginMoment = moment(beginTime);
    const endMoment = moment(endTime);

    let days = parseInt(endMoment.diff(beginMoment, `days`), 10);
    let hours = parseInt(endMoment.diff(beginMoment, `hours`) % 24, 10);
    let minutes = parseInt(endMoment.diff(beginMoment, `minutes`) % 60, 10);

    if (days === 0) {
      days = ``;
    } else {
      days = ((days < 10) ? (`0` + days) : days) + `D`;
    }

    if (hours === 0) {
      hours = ``;
    } else {
      hours = ((hours < 10) ? (`0` + hours) : hours) + `H`;
    }

    if (minutes === 0) {
      minutes = ``;
    } else {
      minutes = ((minutes < 10) ? (`0` + minutes) : minutes) + `M`;
    }

    return `${days} ${hours} ${minutes}`;
  }

  /**
   * Подсчет стоимости поездки по списку событий (включая доп. опции).
   *
   * @param  {Array} eventList - Список событий.
   * @return {Number}          - Итоговая стоимость.
   */
  static calcPrice(eventList) {
    let totalPrice = 0;

    for (let eventDetails of eventList) {
      totalPrice += eventDetails.price;
      const offers = Object.values(eventDetails.offers);
      for (let i = 0; i < offers.length; i++) {
        totalPrice += parseInt(offers[i].price, 10);
      }
    }
    return totalPrice;
  }

  /**
   * Опеределние общего маршрута по списку событий.
   *
   * @param  {array} eventList - Список событий.
   * @return {string}          - Итоговый маршрут.
   */
  static summarize(eventList) {
    if (eventList.length === 0) {
      return ``;
    }

    const uniquePoints = eventList.filter((element, index, array) => {
      return index === 0 || element.city !== array[index - 1].city;
    });

    if (uniquePoints.length === 1) {
      return uniquePoints[0].city;
    }

    const route = [];
    route.push(uniquePoints[0].city);
    if (uniquePoints.length === 3) {
      route.push(uniquePoints[1].city);
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
   * @param  {Array} eventList - Список событий.
   * @return {String}          - Строка с датами.
   */
  static getTiming(eventList) {
    if (eventList.length === 0) {
      return ``;
    }

    const sortedEvents = eventList.sort((a, b) => a.beginTime.valueOf() - b.beginTime.valueOf());
    const dayStart = sortedEvents[0].beginTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthStart = sortedEvents[0].beginTime.toLocaleString(`en-US`, {month: `short`});
    const dayFinish = sortedEvents[sortedEvents.length - 1].endTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthFinish = sortedEvents[sortedEvents.length - 1].endTime.toLocaleString(`en-US`, {month: `short`});

    return `${dayStart}${(monthFinish !== monthStart) ? monthStart : ``}&nbsp;&mdash;&nbsp;${dayFinish} ${monthFinish}`;
  }

  static sortByEvents(eventA, eventB) {
    return eventA.beginTime.valueOf() - eventB.beginTime.valueOf();
  }

  static sortByDuration(eventA, eventB) {
    const durationA = eventA.endTime.valueOf() - eventA.beginTime.valueOf();
    const durationB = eventB.endTime.valueOf() - eventB.beginTime.valueOf();
    return durationB - durationA;
  }

  static sortByPrice(eventA, eventB) {
    return eventB.price - eventA.price;
  }

}
