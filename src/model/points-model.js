import Observer from "../utils/observer.js";
import moment from "moment";

/**
 * Модель точек. Для инициализации в конструтор класса необходимо передать
 * массив со списом точек, где каждый элемент — объект со списком свойств
 * точки.
 */
export default class PointsModel extends Observer {
  /**
   * Конструктор класса
   *
   * @param  {Array} pointList - Массив со списком точек.
   * @param  {Array} typeList  - Массив со списком типов точек.
   */
  constructor(pointList = [], typeList) {
    super();
    this._typeList = typeList;
    this._pointList = this._processData(pointList);
  }

  /**
   * Геттер списка точек.
   *
   * @return {Array} - Массив со списком точек.
   */
  get list() {
    return this._pointList.slice();
  }

  /**
   * Обновление точки маршрута. Объект с данными для обновления должен
   * содержать свойство id, которое соответствует id одной из существующих
   * точек в маршруте.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} pointData  - Объект с обновленными данными.
   */
  update(updateMode, pointData) {
    const index = this._pointList.findIndex((point) => point.id === pointData.id);

    if (index === -1) {
      throw new Error(`Can't update unexisting point`);
    }

    const updatedPointList = this._pointList.slice();
    updatedPointList[index] = pointData;

    this._pointList = this._processData(updatedPointList);

    this._notify(updateMode, pointData);
  }

  /**
   * Добавление точки маршрута.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} pointData  - Объект с новой точкой маршрута.
   * @return {void}
   */
  add(updateMode, pointData) {
    this._pointList = this._processData([pointData, ...this._pointList]);

    this._notify(updateMode);
  }

  /**
   * Удаление точки маршрута. Объект с данными для обновления должен
   * содержать свойство id, которое соответствует id одной из существующих
   * точек в маршруте.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} pointData  - Объект с обновленными данными.
   * @return {void}
   */
  delete(updateMode, pointData) {
    const index = this._pointList.findIndex((point) => point.id === pointData.id);

    if (index === -1) {
      throw new Error(`Can't delete unexisting point`);
    }

    this._pointList = [
      ...this._pointList.slice(0, index),
      ...this._pointList.slice(index + 1)
    ];

    this._notify(updateMode);
  }

  /**
   * Обработка исходных данных и добавление необходимых для работы
   * дополнительных флагов и значений.
   *
   * @param  {Array} pointList - Список точек в исходном виде.
   * @return {Array}           - Список точек в подготовленном для работы виде.
   */
  _processData(pointList) {
    if (pointList.length === 0) {
      return [];
    }

    const processedData = [];
    let lastDate = null;
    pointList.sort((pointA, pointB) => pointA.beginTime.valueOf() - pointB.beginTime.valueOf());
    const beginDate = moment(pointList[0].beginTime).startOf(`day`);

    pointList.forEach((point) => {
      const pointDate = moment(point.beginTime).format(`YYYY-MM-DD`);
      if (pointDate !== lastDate) {
        lastDate = pointDate;
      }

      const selectedType = this._typeList.find((type) => type.id === point.type);

      processedData.push(Object.assign({}, point, {
        dayNumber: moment(point.beginTime).startOf(`day`).diff(beginDate, `days`) + 1,
        dayDate: pointDate,
        isTransport: selectedType.isTransport
      }));
    });

    return processedData;
  }
}
