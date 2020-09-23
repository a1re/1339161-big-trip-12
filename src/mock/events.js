import {types} from "../utils/types.js";
import {getRandomInt, generateId} from "../utils/common.js";

// Отклоенение дня начала путешествия
const TRIP_START_DAYS_GAP = 2;

// Мин. и макс. количество дней путешествия
const TRIP_DURATION_DAYS_MIN = 2;
const TRIP_DURATION_DAYS_MAX = 5;

// Границы активного времени событий
const EVENT_HOURS_MIN = 10;
const EVENT_HOURS_MAX = 23;

// Максимальное количество трансферов в день
const MAX_TRANSFERS_PER_DAY = 2;

// Минимальное и максимальное количество доп. опций
const EVENT_OFFERS_MIN = 1;
const EVENT_OFFERS_MAX = 5;

// Мин., макс. и кратной базовой стоимости события
const EVENT_BASIC_PRICE_MIN = 30;
const EVENT_BASIC_PRICE_MAX = 120;
const EVENT_BASIC_PRICE_DIV = 5;

/**
 * Генерация начала путешествия. Выбирает дату относительно текущего момента
 * с небольшим случайным отклонением — ±TRIP_START_DAYS_GAP.
 *
 * @return {Date} - Дата начала путешествия.
 */
const generateBeginDate = () => {
  const daysGap = getRandomInt(-TRIP_START_DAYS_GAP, TRIP_START_DAYS_GAP);
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + daysGap);

  return currentDate;
};

/**
 * Генерация случайного набора дополнительных опций из списка доступных.
 *
 * @param  {Array} offerList - Список доступных опций в виде массива объектов.
 * @param  {String} type     - Тип точки маршрута
 *
 * @return {Array}           - Массив с предложениями
 */
const getAppliedOffers = (offerList, type) => {
  const appliedOfferList = [];
  // Простой рандом от 0 до EVENT_OFFERS_MAX значительно уменьшает шансы увидеть
  // событие без доп. опций, поэтому в начале работы функции жеребим возможность
  // увидеть событие без функций как 1 к 1.
  const isNoOffers = getRandomInt(0, 1);
  if (isNoOffers) {
    return appliedOfferList;
  }

  const avalibleOffers = offerList.find((offer) => offer.type === type).offers;
  const offersAmount = getRandomInt(EVENT_OFFERS_MIN, Math.min(avalibleOffers.length, EVENT_OFFERS_MAX));
  avalibleOffers.sort(() => Math.random() - 0.5);

  for (let i = 0; i < offersAmount; i++) {
    appliedOfferList.push(avalibleOffers[i]);
  }

  return appliedOfferList;
};

export const generateEvents = (eventsAmount, offerList, destinationList) => {
  const transports = types.filter((type) => type.isTransport).map((type) => type.id);
  const stops = types.filter((type) => !type.isTransport).map((type) => type.id);

  const tripStart = generateBeginDate(); // Время начало путешествия
  const tripDuration = getRandomInt(TRIP_DURATION_DAYS_MIN, TRIP_DURATION_DAYS_MAX); // Длительность в днях
  const avgEventsPerDay = eventsAmount / tripDuration; // Среднее количество событий в день
  const activeHours = EVENT_HOURS_MAX - EVENT_HOURS_MIN; // Исключение ночных часов для реалистичности

  let currentCity = destinationList[getRandomInt(0, destinationList.length - 1)]; // Изначальная точку маршрута
  let transfersLeft = MAX_TRANSFERS_PER_DAY; // Огранчение трансферов, чтобы на 15 событий не вышло 15 переездов

  const events = [];
  let eventsLeft = eventsAmount;
  for (let day = 0; day < tripDuration; day++) {
    if (eventsLeft === 0) {
      break;
    }

    // Расчет количества событий в день. Если это последний день, то в него переносятся все
    // оставшиеся события, если любой дрeгой, то берется среднее кол-во событий в день,
    // округляется и немного рандомизируется (±1).
    const dayEvents = (day === tripDuration - 1) ? eventsLeft : (Math.round(avgEventsPerDay + getRandomInt(-1, 1)));

    // Вычисление даты начала событий в рамках дня.
    const dayDate = new Date(tripStart);
    dayDate.setDate(dayDate.getDate() + day);

    // Максимальное количество времени на каждое событие, чтобы они не пересекались.
    const avgHoursPerEvent = activeHours / dayEvents;

    // Итератор по событиям внутри дня
    for (let eventOfDay = 0; eventOfDay < dayEvents; eventOfDay++) {
      //  Вычисление времени начала события. Для этого берется активное время в течение дня,
      //  в нем вычисляется промежуток, в котором событие должно состояться, делится пополам
      //  и рандомизируется время начала в первой половине и время окончания во второй. Минуты
      //  делаются кратными EVENT_MINUTES_DIV.
      const beginHours = EVENT_HOURS_MIN + eventOfDay * avgHoursPerEvent;
      const beginMinutes = Math.floor(beginHours % 1 * 60);
      const beginTimeGap = new Date(dayDate.setHours(Math.floor(beginHours), beginMinutes, 0, 0));

      const endHours = EVENT_HOURS_MIN + (eventOfDay + 1) * avgHoursPerEvent;
      const endMinutes = Math.floor(endHours % 1 * 60);
      const endTimeGap = new Date(dayDate.setHours(Math.floor(endHours), endMinutes, 59, 999));

      // Водораздел начала и конца события (начало строго до midTimestamp, конец строго после)
      const midTimestamp = beginTimeGap.valueOf() + ((endTimeGap.valueOf() - beginTimeGap.valueOf()) / 2);

      // Итоговые начало и конец события (третье значение getRandomInt — кратность)
      const beginTime = new Date(getRandomInt(beginTimeGap.valueOf(), midTimestamp, 5 * 60 * 1000));
      const endTime = new Date(getRandomInt(midTimestamp, endTimeGap.valueOf(), 5 * 60 * 1000));

      // Если количество трансферов превысило лимит, то isTransfer=false
      const isTransfer = Boolean((transfersLeft > 0) ? getRandomInt(0, 1) : 0);

      // Если текущее событие — трансфер, устанавливается его тип и новый город, если
      // нет — остается старый город и тип выбирается из остановок
      let type;
      if (isTransfer) {
        const remainedCities = destinationList.filter((element) => !(element === currentCity));
        currentCity = remainedCities[getRandomInt(0, remainedCities.length - 1)];
        type = transports[getRandomInt(0, transports.length - 1)];
        transfersLeft--;
      } else {
        type = stops[getRandomInt(0, stops.length - 1)];
      }

      // Рандомизация базовой стоимости
      let price = getRandomInt(EVENT_BASIC_PRICE_MIN, EVENT_BASIC_PRICE_MAX, EVENT_BASIC_PRICE_DIV);

      // Итоговый объект
      const eventInfo = {
        id: generateId(),
        destination: currentCity,
        type,
        beginTime,
        endTime,
        price,
        offers: getAppliedOffers(offerList, type),
        isFavorite: false
      };

      events.push(eventInfo);
    }

    eventsLeft -= dayEvents;
    transfersLeft = MAX_TRANSFERS_PER_DAY;
  }

  return events;
};
