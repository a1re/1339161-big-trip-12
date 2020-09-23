/**
 * Модель пунктов назначения.
 */
export default class DestinationsModel {
  /**
   * Конструктор класса
   *
   * @param  {Array} destinationList - Массив со списком пунктов назначения.
   */
  constructor(destinationList = []) {
    this._destinationList = destinationList.slice();
  }

  /**
   * Получение списка пунктов назначения.
   *
   * @return {Array} Массив пунктов назначения.
   */
  getList() {
    return this._destinationList;
  }

  /**
   * Получение объекта пункта назначения по его названию.
   *
   * @param  {String} name - Имя пункта назначения.
   * @return {Object}      - Объект с информацией о пункте назначения.
   */
  getByName(name) {
    return this._destinationList.find((destination) => destination.name === name);
  }
}
