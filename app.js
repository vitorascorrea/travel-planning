const FareSeeker = require('./FareSeeker');

const options = {
  method: 'POST',
  uri: 'https://pricing-api.viajanet.com.br/price/prices-matrix',
  body: {
    Departure: '2018-08-17',
    DepartureRangeDays: 3,
    Arrival: '2018-09-07',
    ArrivalRangeDays: 3,
    Destination: 'ORL',
    IsRoundTrip: true,
    Origin: 'SAO',
    Partner: {
      Token: 'p0C6ezcSU8rS54+24+zypDumW+ZrLkekJQw76JKJVzWUSUeGHzltXDhUfEntPPLFLR3vJpP7u5CZZYauiwhshw==',
      Key: 'OsHQtrHdMZPme4ynIP4lcsMEhv0=',
      Id: '52',
      ConsolidatorSystemAccountId: '80',
      TravelAgencySystemAccountId: '80',
      Name: 'B2C'
    }
  },
  json: true
};

const fare_seeker = new FareSeeker(options);

setInterval(() => fare_seeker.getFares(), 180000);
