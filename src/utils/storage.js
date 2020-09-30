import {STORAGE_PREFIX, STORAGE_VER} from "../const.js";
import {nanoid} from "nanoid";

export default class Storage {
  /**
   * Конструктор объекта Storage, упрощающий интерфейс к чтению и записи
   * локальных данных.
   *
   * @param  {Storage} storage - Объект хранилища (напр., localStorage).
   */
  constructor(storage) {
    this._storage = storage;
  }

  /**
   * Запись значения в хранилище.
   *
   * @param {String} suffix - Идентификатор кешируемой группы данных (как
   *                          правило, url после END_POINT).
   * @param {String} key    - Ключ.
   * @param {*} value       - Значение.
   */
  set(suffix, key, value) {
    let items = this.readAll(suffix);
    items[key] = value;
    this.writeAll(suffix, items);
  }

  /**
   * Чтение значения из хранилища.
   *
   * @param  {String} suffix - Идентификатор кешируемой группы данных (как
   *                           правило, url после END_POINT).
   * @param  {String} key    - Ключ.
   * @return {*}             - Значение.
   */
  get(suffix, key) {
    const items = this.readAll(suffix);
    if (items.hasOwnProperty(key)) {
      return items[key];
    }
    return undefined;
  }

  /**
   * Удаление значения из хранилища.
   *
   * @param  {String} suffix - Идентификатор кешируемой группы данных (как
   *                           правило, url после END_POINT).
   * @param  {String} key    - Ключ.
   */
  delete(suffix, key) {
    let items = this.readAll(suffix);
    if (items.hasOwnProperty(key)) {
      delete items[key];
      this.writeAll(suffix, items);
    }
  }

  /**
   * Метод записи всех значений в виде объекта, который переводится в строку
   * в формате JSON.
   *
   * @param  {String} suffix   - Идентификатор кешируемой группы данных (как
   *                             правило, url после END_POINT).
   * @param  {Object} itemsObj - Объект с данными.
   */
  writeAll(suffix, itemsObj) {
    this._storage.setItem(
        this._getKey(suffix),
        JSON.stringify(itemsObj)
    );
  }

  /**
   * Метод чтения всех значений из объекта в хранилище. Если хранилище нет
   * объекта, возвращаяется пустой объект, ошибка перехватывается.
   *
   * @param  {String} suffix - Идентификатор кешируемой группы данных (как
   *                           правило, url после END_POINT).
   * @return {Object}        - Объект с данными.
   */
  readAll(suffix) {
    try {
      return JSON.parse(this._storage.getItem(this._getKey(suffix))) || {};
    } catch (err) {
      return {};
    }
  }

  /**
   * Вычисление ключа для хранения данных в локальном хранилище.
   *
   * @param  {String} suffix - Идентификатор кешируемой группы данных (как
   *                           правило, url после END_POINT).
   * @return {String}        - Ключ для харенеия объекта с
   */
  _getKey(suffix) {
    return `${STORAGE_PREFIX}-${suffix}-${STORAGE_VER}`;
  }

  /**
   * Статическая функция конвертации массива в объект для хранения.
   * Используется для подготовки данных перед передачи в метод writeAll().
   *
   * @param  {Array} arr             - Исходный массив
   * @param  {String} idPropertyName - Имя свойства в объекте, которое должно
   *                                   стать ключем.
   * @return {Object}                - Получившийся объект.
   */
  static convertArray(arr, idPropertyName) {
    const resultObject = {};
    arr.forEach((item) => {
      const id = item[idPropertyName] ? item[idPropertyName] : nanoid();
      resultObject[id] = item;
    });
    return resultObject;
  }
}
