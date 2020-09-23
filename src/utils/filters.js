import moment from "moment";

export const filters = [
  {id: `everything`, title: `Everything`, isDefault: true, callback: () => true},
  {id: `future`, title: `Future`, isDefault: false, callback: (point) => moment() < moment(point.beginTime)},
  {id: `past`, title: `Past`, isDefault: false, callback: (point) => moment() > moment(point.beginTime)}
];
