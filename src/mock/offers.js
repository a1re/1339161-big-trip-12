import {getRandomInt, generateId} from "../utils/common.js";

const transportOfferTitles = [`Add luggage`, `Comfort class`, `Add meal`, `Choose seats`, `Travel by train`];
const stopOfferTitles = [`Add breakfast`, `Book tickets`, `Lunch in the city`];

export const generateOffers = () => {
  const offers = [];
  transportOfferTitles.forEach((offer) => {
    offers.push({
      id: generateId(),
      title: offer,
      price: getRandomInt(5, 100),
      isTransport: true
    });
  });
  stopOfferTitles.forEach((offer) => {
    offers.push({
      id: generateId(),
      title: offer,
      price: getRandomInt(5, 100),
      isTransport: false
    });
  });
  return offers;
};
