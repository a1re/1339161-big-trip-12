import {types} from "../utils/types.js";
import {getRandomInt, generateId} from "../utils/common.js";

// Отклоенение дня начала путешествия
const TRIP_START_DAYS_GAP = 2;

// Мин. и макс. количество дней путешествия
const TRIP_DURATION_DAYS_MIN = 2;
const TRIP_DURATION_DAYS_MAX = 5;

// Границы активного времени точек
const POINT_HOURS_MIN = 10;
const POINT_HOURS_MAX = 23;

// Максимальное количество трансферов в день
const MAX_TRANSFERS_PER_DAY = 2;

// Минимальное и максимальное количество доп. опций
const POINT_OFFERS_MIN = 1;
const POINT_OFFERS_MAX = 5;

// Мин., макс. и кратной базовой стоимости точки
const POINT_BASIC_PRICE_MIN = 30;
const POINT_BASIC_PRICE_MAX = 120;
const POINT_BASIC_PRICE_DIV = 5;

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
  // Простой рандом от 0 до POINT_OFFERS_MAX значительно уменьшает шансы увидеть
  // точку без доп. опций, поэтому в начале работы функции жеребим возможность
  // увидеть точку без функций как 1 к 1.
  const isNoOffers = getRandomInt(0, 1);
  if (isNoOffers) {
    return appliedOfferList;
  }

  const avalibleOffers = offerList.find((offer) => offer.type === type).offers;
  const offersAmount = avalibleOffers.length > 0
    ? getRandomInt(POINT_OFFERS_MIN, Math.min(avalibleOffers.length, POINT_OFFERS_MAX))
    : 0;
  avalibleOffers.sort(() => Math.random() - 0.5);

  for (let i = 0; i < offersAmount; i++) {
    appliedOfferList.push(avalibleOffers[i]);
  }

  return appliedOfferList;
};

export const generatePoints = (pointsAmount, offerList, destinationList) => {
  const transports = types.filter((type) => type.isTransport).map((type) => type.id);
  const stops = types.filter((type) => !type.isTransport).map((type) => type.id);

  const tripStart = generateBeginDate(); // Время начало путешествия
  const tripDuration = getRandomInt(TRIP_DURATION_DAYS_MIN, TRIP_DURATION_DAYS_MAX); // Длительность в днях
  const avgPointsPerDay = pointsAmount / tripDuration; // Среднее количество точек в день
  const activeHours = POINT_HOURS_MAX - POINT_HOURS_MIN; // Исключение ночных часов для реалистичности

  let currentCity = destinationList[getRandomInt(0, destinationList.length - 1)]; // Изначальная точка маршрута
  let transfersLeft = MAX_TRANSFERS_PER_DAY; // Огранчение трансферов, чтобы на 15 точек не вышло 15 переездов

  const points = [];
  let pointsLeft = pointsAmount;
  for (let day = 0; day < tripDuration; day++) {
    if (pointsLeft === 0) {
      break;
    }

    // Расчет количества точек в день. Если это последний день, то в него переносятся все
    // оставшиеся точки, если любой дрeгой, то берется среднее кол-во точек в день,
    // округляется и немного рандомизируется (±1).
    const dayPoints = (day === tripDuration - 1) ? pointsLeft : (Math.round(avgPointsPerDay + getRandomInt(-1, 1)));

    // Вычисление даты начала точек в рамках дня.
    const dayDate = new Date(tripStart);
    dayDate.setDate(dayDate.getDate() + day);

    // Максимальное количество времени на каждую точку, чтобы они не пересекались.
    const avgHoursPerPoint = activeHours / dayPoints;

    // Итератор по точкам внутри дня
    for (let pointOfDay = 0; pointOfDay < dayPoints; pointOfDay++) {
      //  Вычисление времени начала точки. Для этого берется активное время в течение дня,
      //  в нем вычисляется промежуток, в котором точка должно состояться, делится пополам
      //  и рандомизируется время начала в первой половине и время окончания во второй. Минуты
      //  делаются кратными POINT_MINUTES_DIV.
      const beginHours = POINT_HOURS_MIN + pointOfDay * avgHoursPerPoint;
      const beginMinutes = Math.floor(beginHours % 1 * 60);
      const beginTimeGap = new Date(dayDate.setHours(Math.floor(beginHours), beginMinutes, 0, 0));

      const endHours = POINT_HOURS_MIN + (pointOfDay + 1) * avgHoursPerPoint;
      const endMinutes = Math.floor(endHours % 1 * 60);
      const endTimeGap = new Date(dayDate.setHours(Math.floor(endHours), endMinutes, 59, 999));

      // Водораздел начала и конца точки (начало строго до midTimestamp, конец строго после)
      const midTimestamp = beginTimeGap.valueOf() + ((endTimeGap.valueOf() - beginTimeGap.valueOf()) / 2);

      // Итоговые начало и конец точки (третье значение getRandomInt — кратность)
      const beginTime = new Date(getRandomInt(beginTimeGap.valueOf(), midTimestamp, 5 * 60 * 1000));
      const endTime = new Date(getRandomInt(midTimestamp, endTimeGap.valueOf(), 5 * 60 * 1000));

      // Если количество трансферов превысило лимит, то isTransfer=false
      const isTransfer = Boolean((transfersLeft > 0) ? getRandomInt(0, 1) : 0);

      // Если текущая точка — трансфер, устанавливается его тип и новый город, если
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
      let price = getRandomInt(POINT_BASIC_PRICE_MIN, POINT_BASIC_PRICE_MAX, POINT_BASIC_PRICE_DIV);

      // Итоговый объект
      const pointInfo = {
        id: generateId(),
        destination: currentCity,
        type,
        beginTime,
        endTime,
        price,
        offers: getAppliedOffers(offerList, type),
        isFavorite: false
      };

      points.push(pointInfo);
    }

    pointsLeft -= dayPoints;
    transfersLeft = MAX_TRANSFERS_PER_DAY;
  }

  return points;
};
