import PointSummaryView from "../view/point-summary-view.js";
import PointFormView from "../view/point-form-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";
import {UpdateMode, PointMode} from "../const.js";

export default class PointPresenter {
  /**
   * Конструктор презентера. Заведение экземпляров отображений и установка
   * ключевого узла DOM для рендеринга компонентов.
   *
   * @param  {Node} pointListContainer      - Контейнер для вставки точек.
   * @param  {Object} point                 - Объект с данными точки.
   * @param  {Observer} pointsModel         - Модель для работы с точками.
   * @param  {Object} destinationsModel     - Модель для работы с городами.
   * @param  {Object} typesModel            - Модель для работы с типами точек.
   * @param  {Object} offersModel           - Модель для работы с спец. предложениями.
   * @param  {Function} switchAllPointsMode - Метод переключючения режима всех точек маршрута.
   */
  constructor(pointListContainer, point, pointsModel, destinationsModel, typesModel, offersModel, switchAllPointsMode) {
    this._pointListContainer = pointListContainer;
    this._point = point;

    this._pointsModel = pointsModel;
    this._destinationsModel = destinationsModel;
    this._typesModel = typesModel;
    this._offersModel = offersModel;
    this._switchAllPointsMode = switchAllPointsMode;

    this._mode = PointMode.SUMMARY;

    this._pointSummaryComponent = null;
    this._pointFormComponent = null;
    this._closeFormByEsc = null;

    this._toggleFavorite = this._toggleFavorite.bind(this);
    this._closePointForm = this._closePointForm.bind(this);
    this._submitForm = this._submitForm.bind(this);
    this._delete = this._delete.bind(this);

    render(
        this._pointListContainer,
        this._createElement(PointMode.SUMMARY),
        RenderPosition.BEFOREEND
    );
  }

  /**
   * Перерисовка карточки с новыми данными.
   *
   * @param  {Object} pointData - Объект с новыми данными.
   */
  refresh(pointData) {
    this._point = pointData;

    if (this._mode === PointMode.SUMMARY) {
      const previousPointSummaryComponent = this._pointSummaryComponent;
      this._pointListContainer.replaceChild(
          this._createElement(PointMode.SUMMARY),
          previousPointSummaryComponent.element
      );
      previousPointSummaryComponent.remove();
    }

    if (this._mode === PointMode.EDITING) {
      if (this._closeFormByEsc) {
        this._closeFormByEsc.unbind();
        this._closeFormByEsc = null;
      }
      const previousPointFormComponent = this._pointFormComponent;
      this._pointListContainer.replaceChild(
          this._createElement(PointMode.EDITING),
          previousPointFormComponent.element
      );
      previousPointFormComponent.remove();
    }
  }

  /**
   * Переключает точку в нужный режим (должен соответствовать одному
   * из значений перечисления PointMode).
   *
   * @param  {String} pointMode - Режим отображения.
   */
  switchMode(pointMode) {
    if (this._mode !== pointMode) {
      if (this._mode === PointMode.EDITING) {
        this._closePointForm();
      } else {
        this._pointListContainer.replaceChild(
            this._createElement(pointMode),
            this._pointSummaryComponent.element
        );
      }
    }
  }

  /**
   * Удаление точки с обеими формами представления (сводки и редактрирования).
   */
  destroy() {
    if (this._mode === PointMode.EDITING) {
      this._pointFormComponent.remove();
    }
    if (this._mode === PointMode.SUMMARY) {
      this._pointSummaryComponent.remove();
    }
  }

  /**
   * Создание отображения точки в соответствии с текущим режимом (должен
   * соответствовать одному из значений перечисления PointMode).
   *
   *  Вместе с отображением создается также и обработчики открытия/закрытия
   *  формы редактирования.
   *
   * @param  {String} pointMode - Режим отображения.
   * @return {Node}             - Шаблон в виде DOM-элемента для размещения.
   */
  _createElement(pointMode) {
    if (pointMode === PointMode.EDITING) {
      this._pointFormComponent = new PointFormView(
          this._typesModel.getList(),
          this._offersModel.getList(),
          this._destinationsModel.getList(),
          this._point
      );

      this._closeFormByEsc = new EscHandler(this._closePointForm);
      this._pointFormComponent.closeHandler = this._closePointForm;
      this._pointFormComponent.submitHandler = this._submitForm;
      this._pointFormComponent.deleteHandler = this._delete;
      this._pointFormComponent.toggleFavoriteHandler = this._toggleFavorite;
      this._mode = PointMode.EDITING;

      return this._pointFormComponent.element;
    }

    // По умочанию — режим PointMode.SUMMARY
    this._pointSummaryComponent = new PointSummaryView(
        this._typesModel.getById(this._point.type),
        this._point
    );

    this._pointSummaryComponent.openHandler = () => {
      this._switchAllPointsMode(PointMode.SUMMARY);

      this._pointListContainer.replaceChild(
          this._createElement(PointMode.EDITING),
          this._pointSummaryComponent.element
      );
      this._pointSummaryComponent.remove();
    };

    this._mode = PointMode.SUMMARY;

    return this._pointSummaryComponent.element;
  }

  /**
   * Обработчик закрытия формы регистрации. При закрытии также снимает
   * обработчик нажатия на Esc.
   */
  _closePointForm() {
    this._pointListContainer.replaceChild(
        this._createElement(PointMode.SUMMARY),
        this._pointFormComponent.element
    );
    this._pointFormComponent.remove();
    this._closeFormByEsc.unbind();
    this._closeFormByEsc = null;
  }

  /**
   * Обработчик нажатия на кнопку «Добавить в избранное».
   */
  _toggleFavorite() {
    this._point = Object.assign({}, this._point,
        {
          isFavorite: !this._point.isFavorite
        }
    );

    this._pointsModel.update(UpdateMode.PATCH, Object.assign({}, this._point));
  }

  /**
   * Cохранение данных формы
   *
   * @param  {Object} pointData - Данные формы для сохранения.
   */
  _submitForm(pointData) {
    this._closePointForm();

    this._pointsModel.update(UpdateMode.MINOR, Object.assign({}, this._point,
        {
          type: pointData.type,
          city: pointData.city,
          beginTime: pointData.beginTime,
          endTime: pointData.endTime,
          price: parseInt(pointData.price, 10),
          offers: pointData.offers
        }
    ));
  }

  /**
   * Удаение точки.
   */
  _delete() {
    this._closePointForm();

    this._pointsModel.delete(UpdateMode.MINOR, this._point);
  }
}
