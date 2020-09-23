import AbstractView from "./abstract-view.js";
import Chart from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

const BAR_HEIGHT = 55;

export default class StatsView extends AbstractView {
  /**
   * Конструктор класса отображения статистики.
   *
   * @param  {Map} moneySpendingMap   - Карта денежных затрат.
   * @param  {Map} transportUsageMap  - Карта использования транспорта.
   * @param  {Map} timeConsumptionMap - Карта потраченного времени.
   */
  constructor(moneySpendingMap, transportUsageMap, timeConsumptionMap) {
    super();
    this._moneySpendingMap = moneySpendingMap;
    this._transportUsageMap = transportUsageMap;
    this._timeConsumptionMap = timeConsumptionMap;

    this._setCharts();
  }

  /**
   * Геттер шаблона меню
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    return `<section class="statistics">
          <h2 class="visually-hidden">Trip statistics</h2>

          <div class="statistics__item statistics__item--money">
            <canvas class="statistics__chart  statistics__chart--money" width="900"></canvas>
          </div>

          <div class="statistics__item statistics__item--transport">
            <canvas class="statistics__chart  statistics__chart--transport" width="900"></canvas>
          </div>

          <div class="statistics__item statistics__item--time-spend">
            <canvas class="statistics__chart  statistics__chart--time" width="900"></canvas>
          </div>
        </section>`;
  }

  /**
   * Рендер диаграммы потраченных денег.
   *
   * @param  {Node} ctx - Объект канваса для отрисовки диаграммы.
   * @return {Chart}    - Объект диаграммы.
   */
  _renderMoneySpendingChart(ctx) {
    ctx.height = BAR_HEIGHT * this._moneySpendingMap.size;

    return new Chart(ctx, this._makeChartSettings(
        `MONEY`,
        [...this._moneySpendingMap.keys()],
        [...this._moneySpendingMap.values()],
        (val) => `€ ${val}`
    ));
  }

  /**
   * Рендер диаграммы использования видов транспорта.
   *
   * @param  {Node} ctx - Объект канваса для отрисовки диаграммы.
   * @return {Chart}    - Объект диаграммы.
   */
  _renderTransportUsageChart(ctx) {
    ctx.height = BAR_HEIGHT * this._transportUsageMap.size;

    return new Chart(ctx, this._makeChartSettings(
        `TRANSPORT`,
        [...this._transportUsageMap.keys()],
        [...this._transportUsageMap.values()],
        (val) => `${val}x`
    ));
  }

  /**
   * Рендер диаграммы затраченного времени.
   *
   * @param  {Node} ctx - Объект канваса для отрисовки диаграммы.
   * @return {Chart}    - Объект диаграммы.
   */
  _renderTimeConsumtionChart(ctx) {
    ctx.height = BAR_HEIGHT * this._timeConsumptionMap.size;

    return new Chart(ctx, this._makeChartSettings(
        `TIME SPENT`,
        [...this._timeConsumptionMap.keys()],
        [...this._timeConsumptionMap.values()],
        (val) => `${val}H`
    ));
  }

  /**
   * Подготовка массива настроек для вывода диаграммы.
   *
   * @param  {String} title      - Название диаграммы.
   * @param  {Array} labels      - Заголовки линейных графиков.
   * @param  {Array} values      - Значения  линейных графиков.
   * @param  {Funcion} formatter - Функция форматирование значения столбца.
   * @return {Object}            - Массив настроек для объекта Chart.
   */
  _makeChartSettings(title, labels, values, formatter) {
    return {
      plugins: [ChartDataLabels],
      type: `horizontalBar`,
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: `#ffffff`,
          hoverBackgroundColor: `#ffffff`,
          anchor: `start`,
          minBarLength: 50,
          barThickness: 44
        }]
      },
      options: {
        plugins: {
          datalabels: {
            font: {size: 13},
            color: `#000000`,
            anchor: `end`,
            align: `start`,
            formatter
          }
        },
        title: {
          display: true,
          text: title,
          fontColor: `#000000`,
          fontSize: 23,
          position: `left`
        },
        scales: {
          yAxes: [{
            ticks: {fontColor: `#000000`, padding: 5, fontSize: 13},
            gridLines: {display: false, drawBorder: false}
          }],
          xAxes: [{
            ticks: {display: false, beginAtZero: true},
            gridLines: {display: false, drawBorder: false},
          }],
        },
        legend: {display: false},
        tooltips: {enabled: false}
      }
    };
  }

  _setCharts() {
    const moneyCtx = this.element.querySelector(`.statistics__chart--money`);
    this._moneySpendingChart = this._renderMoneySpendingChart(moneyCtx);

    const transportCtx = this.element.querySelector(`.statistics__chart--transport`);
    this._transportUsageChart = this._renderTransportUsageChart(transportCtx);

    const timeCtx = this.element.querySelector(`.statistics__chart--time`);
    this._timeConsumptionChart = this._renderTimeConsumtionChart(timeCtx);
  }
}
