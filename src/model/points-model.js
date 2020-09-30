import moment from "moment";
import Observer from "../utils/observer.js";
import {UpdateMode, Datatype} from "../const.js";

/**
 * Модель точек. Для инициализации в конструтор класса необходимо передать
 * массив со списом точек, где каждый элемент — объект со списком свойств
 * точки.
 */
export default class PointsModel extends Observer {
  /**
   * Конструктор класса.
   *
   * @param  {Api} api         - Объект API для доступа к данным.
   * @param  {Array} typeList  - Массив со списком типов точек.
   */
  constructor(api, typeList) {
    super();
    this._api = api;
    this._typeList = typeList;
    this._isDelivered = false;
    this._isLoading = false;
    this._pointList = [];
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
   * Получение статуса данных.
   *
   * @return {Boolean} - True - если данные загружены,
   *                     False - если не грузились.
   */
  get isDelivered() {
    return this._isDelivered;
  }

  /**
   * Получение статуса загрузки данных.
   *
   * @return {Boolean} - True - если данные еще грузятся,
   *                     False - если уже загружены.
   */
  get isLoading() {
    return this._isLoading;
  }

  /**
   * Загрузка данных с сервера.
   *
   * @return {Promise} - Объект Promise после запроса через fetch.
   */
  loadData() {
    this._isLoading = true;
    return this._api.get(Datatype.POINTS).
      then((pointList) => {
        this._pointList = this._addLocalValues(
            pointList.map((point) => this._adaptPointToClient(point))
        );
        this._isLoading = false;
        this._isDelivered = true;
        this._notify(UpdateMode.MAJOR);
      });
  }

  /**
   * Обновление точки маршрута. Объект с данными для обновления должен
   * содержать свойство id, которое соответствует id одной из существующих
   * точек в маршруте.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} pointData  - Объект с обновленными данными.
   * @return {Promise}           - Объект Promise после запроса через fetch.
   */
  update(updateMode, pointData) {
    const index = this._pointList.findIndex((point) => point.id === pointData.id);

    if (index === -1) {
      throw new Error(`Can't update unexisting point`);
    }

    const adaptedPointData = this._adaptPointToServer(pointData);
    return this._api.put(Datatype.POINTS, pointData.id, adaptedPointData)
      .then(() => {
        const updatedPointList = this._pointList.slice();
        updatedPointList[index] = pointData;

        this._pointList = this._addLocalValues(updatedPointList);
        this._notify(updateMode, pointData);
      });
  }

  /**
   * Добавление точки маршрута.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} pointData  - Объект с новой точкой маршрута.
   * @return {Promise}           - Объект Promise после запроса через fetch.
   */
  add(updateMode, pointData) {
    const adaptedPointData = this._adaptPointToServer(pointData);

    return this._api.post(Datatype.POINTS, adaptedPointData)
      .then((newPointData) => {
        this._pointList = this._addLocalValues([
          this._adaptPointToClient(newPointData),
          ...this._pointList
        ]);
        this._notify(updateMode);
      });
  }

  /**
   * Удаление точки маршрута. Объект с данными для обновления должен
   * содержать свойство id, которое соответствует id одной из существующих
   * точек в маршруте.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} pointData  - Объект с данными точки для удаления
   * @return {Promise}           - Объект Promise после запроса через fetch.
   */
  delete(updateMode, pointData) {
    const index = this._pointList.findIndex((point) => point.id === pointData.id);

    if (index === -1) {
      throw new Error(`Can't delete unexisting point`);
    }

    return this._api.delete(Datatype.POINTS, pointData.id)
      .then(() => {
        this._pointList = [
          ...this._pointList.slice(0, index),
          ...this._pointList.slice(index + 1)
        ];

        this._notify(updateMode);
      });
  }

  /**
   * Синхронизация между локальными данными и данными сервера. Шорткат для
   * метода API с указанием url.
   */
  sync() {
    this._api.sync(Datatype.POINTS)
      .then(() => {
        this._notify(UpdateMode.MINOR);
      }).catch((err) => {
        console.log(err); //eslint-disable-line
      });
  }

  /**
   * Обработка исходных данных и добавление необходимых для работы
   * дополнительных флагов и значений.
   *
   * @param  {Array} pointList - Список точек в исходном виде.
   * @return {Array}           - Список точек в подготовленном для работы виде.
   */
  _addLocalValues(pointList) {
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

  /**
   * Адаптация точки под формат клиента.
   *
   * @param  {Object} serverPoint - Объект точки в формате, предоставленном
   *                                сервером.
   * @return {Object}             - Объект в формате клиентской модели.
   */
  _adaptPointToClient(serverPoint) {
    const adaptedPoint = Object.assign({}, serverPoint, {
      beginTime: new Date(serverPoint[`date_from`]),
      endTime: new Date(serverPoint[`date_to`]),
      price: parseInt(serverPoint[`base_price`], 10),
      isFavorite: serverPoint[`is_favorite`]
    });

    delete adaptedPoint.date_from;
    delete adaptedPoint.date_to;
    delete adaptedPoint.is_favorite;

    return adaptedPoint;
  }

  /**
   * Адаптация точки под формат сервера.
   *
   * @param  {Object} clientPoint - Объект точки из клиентской модели.
   * @return {Object}             - Объект в соответствие с протоколом сервера.
   */
  _adaptPointToServer(clientPoint) {
    const adaptedPoint = Object.assign({}, clientPoint, {
      "date_from": clientPoint.beginTime.toISOString(),
      "date_to": clientPoint.endTime.toISOString(),
      "base_price": clientPoint.price,
      "is_favorite": clientPoint.isFavorite
    });

    delete adaptedPoint.beginTime;
    delete adaptedPoint.endTime;
    delete adaptedPoint.isFavorite;
    delete adaptedPoint.price;
    delete adaptedPoint.isTransport;
    delete adaptedPoint.dayNumber;
    delete adaptedPoint.dayDate;

    return adaptedPoint;
  }
}
