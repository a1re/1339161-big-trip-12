import moment from "moment";
import {AUTH_STRING_LENGTH} from "../const.js";

/**
 * Генерация случайного целого числе с небольшой надстройкой — его можно сделать
 * кратным какому-то другому числу за счет указания третьего параметра divider
 * (по умолчанию 1).
 *
 * @param  {Number} a       - Граница диапазона.
 * @param  {Number} b       - Граница диапазона.
 * @param  {Number} divider - Делитель (по умолчанию 1).
 * @return {Number}         - Случайное число.
 */
export const getRandomInt = (a = 0, b = 1, divider = 1) => {
  const lower = Math.floor(Math.min(a, b));
  const upper = Math.ceil(Math.max(a, b));

  const randomInt = Math.floor(lower + Math.random() * (upper - lower + 1));
  return randomInt - randomInt % divider;
};

/**
 * Класс для создаения и удалениея обработчика нажатия на кнопку Esc. C помощью
 * конструктора обработчик создается, с помощью метода unbbind() — удаляется.
 *
 * constructor:
 * @param  {Function} callback - Функция, которая должна вызываться при нажатии на
 *                               Esc.
 */
export class EscHandler {
  constructor(callback) {
    this._callback = this._bindToEsc(callback);
    document.addEventListener(`keydown`, this._callback);
  }

  _bindToEsc(callback) {
    const onEscKeyDown = (keyEvent) => {
      if (keyEvent.key === `Escape` || keyEvent.key === `Esc`) {
        keyEvent.preventDefault();
        callback();
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };
    return onEscKeyDown;
  }

  unbind() {
    document.removeEventListener(`keydown`, this._callback);
  }
}

/**
 * Проверяет дату на корректность в соответствие с форматом.
 *
 * @param  {String} datetime - Дата в формате объекта Date или строки.
 * @param  {String} format   - Требуемый формат даты в соответствие с API moment.
 * @return {Boolean}         - True, если дата корректна, False — если нет.
 */
export const isValidDate = (datetime, format) => {
  return moment(datetime, format).isValid();
};

/**
 * Форматирует дату при помощи библиотеки moment. Если дата некорректна,
 * то возвращается пустая строка.
 *
 * @param  {String/Date} datetime - Дата в формате объекта Date или строки.
 * @param  {String} format        - Формат даты в соответствие с API moment.
 * @return {String}               - Форматированная дата, либо пустая строка,
 *                                  если распознать дату не удалось.
 */
export const formatDate = (datetime, format) => {
  const dateObj = moment(datetime);

  if (!dateObj.isValid()) {
    return ``;
  }

  return dateObj.format(format);
};

/**
 * Парсит дату, создавая объект Date из строки при помощи библиотеки moment.
 *
 * @param  {String} datetime - Дата для парсинга
 * @param  {String} format   - Формат-подсказка для парсинга (не обязателен)
 * @return {Date}            - Объект Date или false, если не удалось
 *                             распарсить дату.
 */
export const parseDate = (datetime, format = ``) => {
  return moment(datetime, format).toDate();
};

/**
 * Генерация строки для авторизации.
 *
 * @return {String}        - Строка заданной длины.
 */
export const getAuthString = () => {
  let authString = ``;
  const words = `0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM`;
  const maxPosition = words.length - 1;
  for (let i = 0; i < AUTH_STRING_LENGTH; i++) {
    const position = Math.floor(Math.random() * maxPosition);
    authString = authString + words.substring(position, position + 1);
  }
  return `Basic ` + authString;
};
