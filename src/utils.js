/**
 * Генерация случайного целого числе с небольшой надстройкой — его можно сделать
 * кратным какому-то другому числу за счет указания третьего параметра divider
 * (по умолчанию 1).
 *
 * @param  {Int} a       - Граница диапазона.
 * @param  {Int} b       - Граница диапазона.
 * @param  {Int} divider - Делитель (по умолчанию 1).
 * @return {Int}         - Случайное число.
 */
export const getRandomInt = (a = 0, b = 1, divider = 1) => {
  const lower = Math.floor(Math.min(a, b));
  const upper = Math.ceil(Math.max(a, b));

  const randomInt = Math.floor(lower + Math.random() * (upper - lower + 1));
  return randomInt - randomInt % divider;
};

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
export const getDuration = (beginTime, endTime) => {
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
};
