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
   * @param  {string} endPoint      - Адрес удаленного сервера.
   * @param  {string} authorization - Строка авторизации.
   */
  constructor(endPoint, authorization) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  /**
   * Получения данных с удаленного сервере методом GET.
   *
   * @param  {String} url - Часть адреса для запроса после endPoint.
   * @return {Object}     - Ответ сервера в формате JSON.
   */
  get(url) {
    return this._load({url})
      .then(Api.toJSON);
  }

  /**
   * Отправка данных на удаленный сервер методом PUT.
   *
   * @param  {String} url         - Часть адреса для запроса после endPoint.
   * @param  {Number} id          - Id ресурса, добавляется в адрес для запроса
   *                                после endPoint и url.
   * @param  {Object} updatedData - Данные в теле запроса.
   * @return {Object}             - Ответ сервера в формате JSON.
   */
  put(url, id, updatedData) {
    return this._load({
      url: url + `/` + id,
      method: Method.PUT,
      body: JSON.stringify(updatedData)
    }).then(Api.toJSON);
  }

  /**
   * Отправка данных на удаленный сервер методом DELETE.
   *
   * @param  {String} url         - Часть адреса для запроса после endPoint.
   * @param  {Number} id          - Id ресурса, добавляется в адрес для запроса
   *                                после endPoint и url.
   * @return {Object}             - Ответ сервера в формате JSON.
   */
  delete(url, id) {
    return this._load({
      url: url + `/` + id,
      method: Method.DELETE
    });
  }

  /**
   * Отправка данных на удаленный сервер методом POST.
   *
   * @param  {String} url         - Часть адреса для запроса после endPoint.
   * @param  {Object} updatedData - Данные в теле запроса.
   * @return {Object}             - Ответ сервера в формате JSON.
   */
  post(url, updatedData) {
    return this._load({
      url,
      method: Method.POST,
      body: JSON.stringify(updatedData)
    }).then(Api.toJSON);
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
