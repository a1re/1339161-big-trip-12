export class Route {
  /**
   * Вычисление длительности события по времени начала и конца. Чтобы не
   * потеряться в часовых поясах, вычисление примитивно-математическое —
   * вначале берутся таймстемпы обеих дат, вычисляется разница между ними,
   * затем поочереди делится на целые дни, целые часы и целые минуты.
   *
   * @param  {Date} beginTime - Время начала события в объекте Date
   * @param  {Date} endTime   - Время окончания события в объекте Date
   * @return {string}         - Длительность события в формате строки вида
   *                            `01D 02H 03M`
   */
  static duration(beginTime, endTime) {
    const MIN_IN_MS = 1000 * 60;
    const HOUR_IN_MS = 60 * MIN_IN_MS;
    const DAY_IN_MS = 24 * HOUR_IN_MS;

    let timeDifference = endTime.valueOf() - beginTime.valueOf();
    let duration = ``;

    if (timeDifference >= DAY_IN_MS) {
      const days = Math.round(timeDifference / DAY_IN_MS);
      duration += ((days < 10) ? (`0` + days) : days) + `D `;
      timeDifference = timeDifference % DAY_IN_MS;
    }

    if (timeDifference.valueOf() >= 1000 * 60 * 60) {
      const hours = Math.round(timeDifference / HOUR_IN_MS);
      duration += ((hours < 10) ? (`0` + hours) : hours) + `H `;
      timeDifference = timeDifference % HOUR_IN_MS;
    }

    if (timeDifference > 0) {
      const minutes = Math.round(timeDifference / MIN_IN_MS);
      duration += ((minutes < 10) ? (`0` + minutes) : minutes) + `M`;
    }

    return duration;
  }

  /**
   * Распределяем события по дням. Для этого создаем объект Map, где ключом
   * будет дата в формате yyyy-mm-dd, а значением — массив с событиями.
   *
   * @param  {array} eventList - Массив событий.
   * @return {Map}             - Карта событий, где ключ — дата, а значение — массив
   *                             событий в рамках дня.
   */
  static organizeByDays(eventList) {
    const eventsByDays = new Map();
    eventList.forEach((event) => {
      const eventDate = event.beginTime.toISOString().split(`T`)[0];

      if (!eventsByDays.get(eventDate)) {
        eventsByDays.set(eventDate, []);
      }

      const eventsInDate = eventsByDays.get(eventDate);
      eventsInDate.push(event);
      eventsByDays.set(eventDate, eventsInDate);
    });

    return eventsByDays;
  }
  /**
   * Подсчет стоимости поездки по списку событий (включая доп. опции).
   *
   * @param  {array} eventList - Список событий.
   * @return {int}             - Итоговая стоимость.
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
   * @param  {array} eventList - Список событий.
   * @return {string}          - Строка с датами.
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

}
