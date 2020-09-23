import {getRandomInt} from "../utils/common.js";

const DEFAULT_CITIES = [`Amsterdam`, `Geneva`, `Chamonix`, `Saint Petersburg`];

// Рыбный текст для генерации описания
const TRIP_DESC_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. `
  + `Cras aliquet varius magna, non porta ligula feugiat eget. Fusce tristique `
  + `felis at fermentum pharetra. Aliquam id orci ut lectus varius viverra. Nullam `
  + `nunc ex, convallis sed finibus eget, sollicitudin eget ante. Phasellus eros `
  + `mauris, condimentum sed nibh vitae, sodales efficitur ipsum. Sed blandit, `
  + `eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. `
  + `Sed sed nisi sed augue convallis suscipit in sed felis. Aliquam erat volutpat. `
  + `Nunc fermentum tortor ac porta dapibus. In rutrum ac purus sit amet tempus.`;

// Мин. и макс. кол-во фотографий
const TRIP_DESC_PHOTOS_MIN = 1;
const TRIP_DESC_PHOTOS_MAX = 5;

// Мин. и макс. кол-во предложений в описании
const TRIP_DESC_SENTENCES_MIN = 1;
const TRIP_DESC_SENTENCES_MAX = 5;

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

export const generateDestinations = () => {
  const destinations = [];

  DEFAULT_CITIES.forEach((city) => {
    const photosAmount = getRandomInt(TRIP_DESC_PHOTOS_MIN, TRIP_DESC_PHOTOS_MAX);
    const photos = [];
    for (let i = 0; i < photosAmount; i++) {
      photos.push(`http://picsum.photos/248/152?r=` + getRandomInt(10, 100));
    }
    destinations.push({
      name: city,
      description: generateDescription(),
      photos
    });
  });

  return destinations;
};
