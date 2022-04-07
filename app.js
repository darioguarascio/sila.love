require('dotenv').config();

const moment = require('moment');
moment.locale('it');

const axios = require('axios');
const mcache = require('memory-cache');
const express = require('express')
const winston = require('winston');
const expressWinston = require('express-winston');
const twig = require('twig');
const app = express()

// let momentDate = moment('2022.01.01-11.11', 'YYYY.MM.DD-HH.mm');
// console.log(momentDate.fromNow())

app.set("twig options", {
    allow_async: true, // Allow asynchronous compiling
    strict_variables: false
});

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  meta: false, // optional: control whether you want to log the meta data about the request (default to true)
  msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}));


app.get('/', (req, res, next) => {
  res.render('index.twig', {
    // message : "Hello World"
  });
});

app.get('/webcams/lorica/meta', (req, res, next) => {
  if (!mcache.get('image-name')) {
    getimg().then( (data) => {
      respobject().then( (data) => {
        res.send(data)
      })
    });
  } else {
    respobject().then( (data) => {
      res.send(data)
    })
  }
})

app.get('/webcams/lorica', (req, res, next) => {
  res.set({
    'Cache-Control': 'private, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': 'Sat, 26 Jul 1997 05:00:00 GMT',
    'Content-Type': 'image/jpeg',
  });
  let data = mcache.get('image-buf')
  if (!data) {
    getimg().then( (data) => {

      res.set({
        'Content-Disposition': 'inline; filename="' + data.name + '"'
      });
      res.send(data.data)
    });
  } else {
    res.set({
      'Content-Disposition': 'inline; filename="' + mcache.get('image-name') + '"'
    });
    res.send(data);
  }
})


async function respobject() {
  let url  = `https://api.openweathermap.org/data/2.5/onecall?lat=${process.env.LAT}&lon=${process.env.LNG}&exclude=minutely,hourly,daily,alerts&units=metric&lang=${process.env.LOCALE}&appid=${process.env.SILA_OPENWEATHER_API}`;
  return await axios.get(url)
    .then(function (response) {
      let fn = mcache.get('image-name').split('/').reverse()[0].replace('.jpg','')
      let momentDate = moment(fn, 'YYYY.MM.DD-HH.mm');
      response.data.current.temp = Math.round(response.data.current.temp);
      return {
        "t": momentDate.format('x'),
        "now": (new Date()).getTime(),
        "rel": momentDate.fromNow(),
        "abs": momentDate.format('LLLL'),
        "name": fn,
        "weather": response.data.current,
        "image": "https://sila.love/webcams/lorica",

        "text": {
          "message": `A lorica c'è ${response.data.current.weather[0].description} e ci sono ${response.data.current.temp} gradi.`,
          "update": `L'ultima immagine e' di ${momentDate.fromNow()}.`
        }

      };
    })
}


async function getimg() {


  let Client = require('ssh2-sftp-client');
  let sftp = new Client();

  let name;
  return await sftp.connect({
    host: process.env.SILA_SFTP_HOST,
    port: process.env.SILA_SFTP_PORT || '22',
    username: process.env.SILA_SFTP_USER,
    password: process.env.SILA_SFTP_PASS
  }).then(() => {
    return sftp.get('/.lorica-last-screenshot');
  }).then(data => {
    let file = data.toString().trim();

    name = data.toString().trim().split('/').reverse()[0];
    return sftp.get(data.toString().trim());
  }).then(data => {
    mcache.put('image-name', name);
    mcache.put('image-buf', data, 5*60*1000);
    return {
      name,
      data
    }
  });
}



app.use(function(req, res, next) {
  res.status(404);
  res.type('txt').send('Not found');
});

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
