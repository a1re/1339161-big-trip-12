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
