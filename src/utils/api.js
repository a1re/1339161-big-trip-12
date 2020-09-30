import Storage from "./storage.js";
import {nanoid} from "nanoid";

const Method = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  DELETE: `DELETE`
};

const SuccessHTTPStatusRange = {
  MIN: 200,
  MAX: 299
};

export default class Api {
  /**
   * Конструктор класса Api для обмена информацией с удаленным сервером.
   *
   * @param  {String} endPoint      - Адрес удаленного сервера.
   * @param  {String} authorization - Строка авторизации.
   * @param  {Storage} [storage]    - Интерфейс доступа к локальному хранилищу.
   */
  constructor(endPoint, authorization, storage = null) {
    this._endPoint = endPoint;
    this._authorization = authorization;
    this._storage = storage ? new Storage(storage) : null;
  }

  /**
   * Получения данных с удаленного сервере методом GET.
   *
   * @param  {String} url - Часть адреса для запроса после endPoint.
   * @return {Promise}    - Promise с ответотом сервера в формате JSON.
   */
  get(url) {
    if (window.navigator.onLine) {
      return this._load({url})
        .then(Api.toJSON)
        .then((result) => {
          if (this._storage) {
            this._storage.writeAll(url, Storage.convertArray(result, `id`));
          }

          return result;
        });
    }

    return new Promise((resolve) => {
      resolve(this._storage ? Object.values(this._storage.readAll(url)) : []);
    });
  }

  /**
   * Отправка данных на удаленный сервер методом PUT.
   *
   * @param  {String} url         - Часть адреса для запроса после endPoint.
   * @param  {Number} id          - Id ресурса, добавляется в адрес для запроса
   *                                после endPoint и url.
   * @param  {Object} updatedData - Данные в теле запроса.
   * @return {Promise}            - Promise с ответотом сервера в формате JSON.
   */
  put(url, id, updatedData) {
    if (window.navigator.onLine) {
      return this._load({
        url: `${url}/${id}`,
        method: Method.PUT,
        body: JSON.stringify(updatedData)
      })
        .then(Api.toJSON)
        .then(() => {
          if (this._storage) {
            this._storage.set(url, id, updatedData);
          }
        });
    }

    return new Promise((resolve) => {
      this._storage.set(url, id, updatedData);
      resolve(updatedData);
    });
  }

  /**
   * Отправка данных на удаленный сервер методом DELETE.
   *
   * @param  {String} url - Часть адреса для запроса после endPoint.
   * @param  {Number} id  - Id ресурса, добавляется в адрес для запроса
   *                        после endPoint и url.
   * @return {Promise}    - Promise с ответотом сервера в формате JSON.
   */
  delete(url, id) {
    if (window.navigator.onLine) {
      return this._load({
        url: `${url}/${id}`,
        method: Method.DELETE
      })
        .then(() => {
          if (this._storage) {
            this._storage.delete(url, id);
          }
        });
    }

    return new Promise((resolve) => {
      this._storage.delete(url, id);
      resolve();
    });
  }

  /**
   * Отправка данных на удаленный сервер методом POST.
   *
   * @param  {String} url     - Часть адреса для запроса после endPoint.
   * @param  {Object} newData - Данные в теле запроса.
   * @return {Promise}        - Promise с ответотом сервера в формате JSON.
   */
  post(url, newData) {
    if (window.navigator.onLine) {
      return this._load({
        url,
        method: Method.POST,
        body: JSON.stringify(newData)
      })
        .then(Api.toJSON)
        .then((result) => {
          if (this._storage) {
            const id = result.id ? result.id : nanoid();
            this._storage.set(url, id, result);
          }
          return result;
        });
    }

    return new Promise((resolve) => {
      const id = newData.id ? newData.id : nanoid();
      this._storage.set(url, id, newData);
      resolve(Object.assign({}, newData, {id}));
    });
  }

  sync(url) {
    if (window.navigator.onLine) {
      const points = Object.values(this._storage.readAll(url));
      return this._load({
        url: `${url}/sync`,
        method: Method.POST,
        body: JSON.stringify(points)
      })
        .then(Api.toJSON)
        .then((response) => {
          const syncedPoints = [];
          response.updated.forEach((point) => {
            syncedPoints.push(point.payload.point);
          });
          response.created.forEach((point) => {
            syncedPoints.push(point);
          });

          this._storage.writeAll(url, Storage.convertArray(syncedPoints, `id`));
        });
    }

    return Promise.reject(new Error(`Sync data failed`));
  }

  /**
   * Обертка для запроса к серверу через функцию fetch. Добавляет заранее
   * определенную строку авторизации.
   *
   * @param  {String}  options.url     - Адрес для запроса после endPoint.
   * @param  {String}  options.method  - Метод запроса.
   * @param  {String}  options.body    - Тело запроса
   * @param  {Headers} options.headers - Объект заголовков.
   * @return {Promise}                 - Результат выполнения fetch в виде
   *                                     объекта Promise.
   */
  _load({
    url,
    method = Method.GET,
    body = null,
    headers = new Headers()
  }) {
    headers.append(`Authorization`, this._authorization);
    headers.append(`Content-Type`, `application/json`);

    return fetch(
        `${this._endPoint}/${url}`,
        {method, body, headers}
    )
      .then(Api.checkStatus)
      .then(Api.catchError);
  }

  /**
   * Проверка статуса и выброс ошибки в случае, если он имеет код,
   * отличный от 2**.
   *
   * @param  {Promise} response - Объект ответа Promise.
   * @return {Promise}          - Объект ответа Promise.
   */
  static checkStatus(response) {
    if (
      response.status < SuccessHTTPStatusRange.MIN ||
      response.status > SuccessHTTPStatusRange.MAX
    ) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Перевод ответа сервера в объект Javascript.
   *
   * @param  {Promise} response - Объект ответа Promise.
   * @return {Object}           - Данные в формате объекта Javascript.
   */
  static toJSON(response) {
    return response.json();
  }

  /**
   * Перехват ошибки запроса.
   *
   * @param  {String} err - Текст ошибки.
   * @return {String}     - Текст ошибки.
   */
  static catchError(err) {
    return err;
  }
}
