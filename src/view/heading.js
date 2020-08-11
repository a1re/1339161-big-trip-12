export const makeTripHeadingTemplate = (events) => {
  /**
   * Подсчет стоимости поездке по списку событий (включая доп. опции).
   *
   * @param  {array} eventList - Список событий.
   * @return {int}             - Итоговая стоимость.
   */
  const calcPrice = (eventList) => {
    let totalPrice = 0;

    for (let eventDetails of eventList) {
      totalPrice += eventDetails.price;
      const offers = Object.values(eventDetails.offers);
      for (let i = 0; i < offers.length; i++) {
        totalPrice += parseInt(offers[i].price, 10);
      }
    }
    return totalPrice;
  };

  /**
   * Опеределние общего маршрута по списку событий.
   *
   * @param  {array} eventList - Список событий.
   * @return {string}          - Итоговый маршрут.
   */
  const getRoute = (eventList) => {
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
  };

  /**
   * Опеределние дат начала и конца путешествия по списку событий. В случае,
   * если даты остаются в рамках одного месяца, он пишется только один раз,
   * в конце (т.е. `30 MAR - 2 APR` или `28 - 30 MAR`);
   *
   * @param  {array} eventList - Список событий.
   * @return {string}          - Строка с датами.
   */
  const getTiming = (eventList) => {
    const sortedEvents = eventList.sort((a, b) => a.beginTime.valueOf() - b.beginTime.valueOf());
    const dayStart = sortedEvents[0].beginTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthStart = sortedEvents[0].beginTime.toLocaleString(`en-US`, {month: `short`});
    const dayFinish = sortedEvents[sortedEvents.length - 1].endTime.toLocaleString(`en-US`, {day: `numeric`});
    const monthFinish = sortedEvents[sortedEvents.length - 1].endTime.toLocaleString(`en-US`, {month: `short`});

    return `${dayStart}${(monthFinish !== monthStart) ? monthStart : ``}&nbsp;&mdash;&nbsp;${dayFinish} ${monthFinish}`;
  };


  return `<section class="trip-main__trip-info trip-info">
            <div class="trip-info__main">
              <h1 class="trip-info__title">${getRoute(events)}</h1>
              <p class="trip-info__dates">${getTiming(events)}</p>
            </div>
            <p class="trip-info__cost">
              Total: &euro;&nbsp;<span class="trip-info__cost-value">${calcPrice(events)}</span>
            </p>
          </section>`;
};
