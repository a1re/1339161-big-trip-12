import {CITIES, STOPS, TRANSPORTS, TRANSPORT_OFFERS_MAP, STOP_OFFERS_MAP} from "../const.js";
import {getRandomInt} from "../utils.js";

// Отклоенение дня начала путешествия
const TRIP_START_DAYS_GAP = 2;

// Мин. и макс. количество дней путешествия
const TRIP_DURATION_DAYS_MIN = 2;
const TRIP_DURATION_DAYS_MAX = 5;

// Мин. и макс. количество событий
const TRIP_EVENTS_MIN = 15;
const TRIP_EVENTS_MAX = 20;

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

// Мин. и макс. кол-во фотографий
const TRIP_DESC_PHOTOS_MIN = 1;
const TRIP_DESC_PHOTOS_MAX = 5;

// Мин. и макс. кол-во предложений в описании
const TRIP_DESC_SENTENCES_MIN = 1;
const TRIP_DESC_SENTENCES_MAX = 5;

// Рыбный текст для генерации описания
const TRIP_DESC_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. `
  + `Cras aliquet varius magna, non porta ligula feugiat eget. Fusce tristique `
  + `felis at fermentum pharetra. Aliquam id orci ut lectus varius viverra. Nullam `
  + `nunc ex, convallis sed finibus eget, sollicitudin eget ante. Phasellus eros `
  + `mauris, condimentum sed nibh vitae, sodales efficitur ipsum. Sed blandit, `
  + `eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. `
  + `Sed sed nisi sed augue convallis suscipit in sed felis. Aliquam erat volutpat. `
  + `Nunc fermentum tortor ac porta dapibus. In rutrum ac purus sit amet tempus.`;

/**
 * Генерация описания из рыбного текста. Технология простая — берется базовый рыбный
 * текст, делится на предложения с помощью split, затем собирается обратно, выдергивая
 * из массива по случайному предложению и собирается обратно в строку. Есть два бага —
 * может вернуться текст с одинаковыми предложениями (или даже и вовсе состоящий из пяти
 * одинаковых предложенй подряд) и в конце последнего предложения из исходного текста
 * будет оказываться двойная точка. Кажется, это довольно несущественные вещи, чтобы
 * их править в генерации моков.
 *
 * @return {string} - случайное описание.
 */
const generateDescription = () => {
  const sentencesAmount = getRandomInt(TRIP_DESC_SENTENCES_MIN, TRIP_DESC_SENTENCES_MAX);
  const sentencesList = TRIP_DESC_TEXT.split(`. `);
  const sentencesSelected = [];
  for (let i = 0; i < sentencesAmount; i++) {
    sentencesSelected.push(sentencesList[getRandomInt(0, sentencesList.length - 1)] + `.`);
  }

  return sentencesSelected.join(` `);
};

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
 * Генерация случайного набора дополнительных опций для события.
 *
 * @param  {Boolean} isTransfer - Является ли событие трансфером.
 *
 * @return {Object} - Объект в доп. опциями. Такой вид возвращаемого значения
 *                    был выбран для сохранения порядка (при переборе в интерфейсе
 *                    опции будут в одном порядке) и для будущей совместимости с
 *                    получением данных через API (малоероятно, что там на входе
 *                    будет Map).
 */
const generateOffers = (isTransfer = false) => {
  // Простой рандом от 0 до EVENT_OFFERS_MAX значительно уменьшает шансы увидеть
  // событие без доп. опций, поэтому в начале работы функции жеребим возможность
  // увидеть событие без функций как 1 к 1.
  const isNoOffers = getRandomInt(0, 1);
  if (isNoOffers) {
    return {};
  }

  const offersMap = (isTransfer) ? TRANSPORT_OFFERS_MAP : STOP_OFFERS_MAP;
  const offersKeys = Array.from(offersMap.keys()).sort(() => Math.random() - 0.5);
  const offersNum = getRandomInt(EVENT_OFFERS_MIN, Math.min(offersMap.size, EVENT_OFFERS_MAX));
  const offers = {};

  for (let i = 0; i < offersNum; i++) {
    offers[offersKeys[i]] = offersMap.get(offersKeys[i]);
  }

  return offers;
};

export const generateEvents = () => {
  const eventsAmount = getRandomInt(TRIP_EVENTS_MIN, TRIP_EVENTS_MAX); // Общее количество событий
  const tripStart = generateBeginDate(); // Время начало путешествия
  const tripDuration = getRandomInt(TRIP_DURATION_DAYS_MIN, TRIP_DURATION_DAYS_MAX); // Длительность в днях
  const avgEventsPerDay = eventsAmount / tripDuration; // Среднее количество событий в день
  const activeHours = EVENT_HOURS_MAX - EVENT_HOURS_MIN; // Исключение ночных часов для реалистичности

  let currentCity = CITIES[getRandomInt(0, CITIES.length - 1)]; // Изначальная точку маршрута
  let transfersLeft = MAX_TRANSFERS_PER_DAY; // Огранчение трансферов, чтобы на 15 событий не вышло 15 переездов

  const events = [];
  let eventsLeft = eventsAmount;
  for (let day = 0; day < tripDuration; day++) {
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
        const remainedCities = CITIES.filter((element) => !(element === currentCity));
        currentCity = remainedCities[getRandomInt(0, remainedCities.length - 1)];
        type = TRANSPORTS[getRandomInt(0, TRANSPORTS.length - 1)];
        transfersLeft--;
      } else {
        type = STOPS[getRandomInt(0, STOPS.length - 1)];
      }

      const photosAmount = getRandomInt(TRIP_DESC_PHOTOS_MIN, TRIP_DESC_PHOTOS_MAX);
      const photos = [];
      for (let i = 0; i < photosAmount; i++) {
        photos.push(`http://picsum.photos/248/152?r=` + getRandomInt(10, 100));
      }

      // Рандомизация базовой стоимости
      let price = getRandomInt(EVENT_BASIC_PRICE_MIN, EVENT_BASIC_PRICE_MAX, EVENT_BASIC_PRICE_DIV);

      // Итоговый объект
      const eventInfo = {
        city: currentCity,
        type,
        beginTime,
        endTime,
        description: generateDescription(),
        price,
        offers: generateOffers(isTransfer),
        isTransfer,
        isFavorite: false
      };

      events.push(eventInfo);
    }

    eventsLeft -= dayEvents;
    transfersLeft = MAX_TRANSFERS_PER_DAY;
  }

  return events;
};
