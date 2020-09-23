export const sortings = [
  {id: `event`, title: `Event`, isGrouped: true, isDefault: true, callback: (pointA, pointB) => {
    return pointA.beginTime.valueOf() - pointB.beginTime.valueOf();
  }},
  {id: `time`, title: `Time`, isGrouped: false, isDefault: false, callback: (pointA, pointB) => {
    const durationA = pointA.endTime.valueOf() - pointA.beginTime.valueOf();
    const durationB = pointB.endTime.valueOf() - pointB.beginTime.valueOf();
    return durationB - durationA;
  }},
  {id: `price`, title: `Price`, isGrouped: false, isDefault: false, callback: (pointA, pointB) => {
    return pointB.price - pointA.price;
  }}
];
