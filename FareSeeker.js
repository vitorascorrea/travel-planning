const _ = require('lodash');
const moment = require('moment');
const request = require('request-promise');

const accountSid = 'AC03b011234a190a23ab73bb6e3259e575';
const authToken = '374792f9eccf64f4286b4e19f3658d13';

const client = require('twilio')(accountSid, authToken);

class FareSeeker {
  constructor(options) {
    this.options = options;
    this.best_current_fare = null;
    this.current_diff = 0;
  }

  getFares() {
    request(this.options)
    .then((response) => {
      const best_price_date = FareSeeker.getLowestFare(response);
      if (best_price_date) {
        const local_fare = (best_price_date.BestPrices[0].Value + best_price_date.BestPrices[0].Tax + best_price_date.BestPrices[0].Fee);

        this.best_current_fare = FareSeeker.updateBestFare(this.best_current_fare, local_fare);
        this.current_diff = FareSeeker.getDiff(local_fare, this.best_current_fare);

        console.log(FareSeeker.logFares(best_price_date, this.best_current_fare, local_fare, this.current_diff, true));

        if (this.best_current_fare < 1500 || this.current_diff < -25) {
          sendSMS(FareSeeker.logFares(best_price_date, this.best_current_fare, local_fare, this.current_diff, false));
        }
      }
    })
    .catch((e) => {
      console.log(e);
    })
    .finally(() => {
    });
  }

  static updateBestFare(best_current_fare, local_fare) {
    if (best_current_fare && local_fare < best_current_fare) {
      return local_fare;
    } else if (best_current_fare) {
      return best_current_fare;
    } else if (!best_current_fare) {
      return local_fare;
    }
  }

  static getLowestFare(response) {
    let best_price_value = 9999;
    let best_price_date;
    _.forEach(response.PricesDates, (price_date) => {
      const best_local_price = price_date.BestPrices[0];
      if (best_local_price.Value + best_local_price.Tax + best_local_price.Fee < best_price_value) {
        best_price_date = price_date;
        best_price_value = best_local_price.Value + best_local_price.Tax + best_local_price.Fee;
      }
    });
    return best_price_date;
  }

  static logFares(best_price_date, best_current_fare, local_fare, current_diff, beautify) {
    return `
    ${moment().format('DD/MM/YYYY HH:mm')} - Menor preço: ${local_fare.toFixed(2)} (${beautify ? FareSeeker.beautifyDiff(current_diff) : current_diff + '%'})
    Ida: ${moment(best_price_date.Departure).format('DD/MM/YYYY')}
    Volta: ${moment(best_price_date.Arrival).format('DD/MM/YYYY')}
    `;
  }

  static getDiff(local_fare, best_current_fare) {
    const diff = best_current_fare - local_fare;
    const percentage = (diff * 100) / best_current_fare;
    return percentage;
  }

  static beautifyDiff(diff) {
    if (diff > 0) {
      return '\x1b[31m +' + diff + '% \x1b[0m';
    } else if (diff === 0) {
      return diff + '%';
    } else {
      return '\x1b[32m -' + diff + '% \x1b[0m';
    }
  }

  static sendSMS(body) {
    client.messages
    .create({
      to: '+5511996374013',
      from: '+14243321605',
      body,
    })
    .then(() => console.log('\x1b[32m SMS enviado com sucesso! \x1b[0m'));
  }
}

module.exports = FareSeeker;
