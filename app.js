require('dotenv').config();

const mcache = require('memory-cache');
const express = require('express')
const winston = require('winston');
const expressWinston = require('express-winston');
const twig = require('twig');
const app = express()


var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

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

app.get('/webcams/lorica', cache(10), (req, res, next) => {

  let Client = require('ssh2-sftp-client');
  let sftp = new Client();

  sftp.connect({
    host: process.env.SILA_SFTP_HOST,
    port: process.env.SILA_SFTP_PORT || '22',
    username: process.env.SILA_SFTP_USER,
    password: process.env.SILA_SFTP_PASS
  }).then(() => {
    return sftp.get('/.lorica-last-screenshot');
  }).then(data => {
    return {
      "name": data.toString().trim().split('/').reverse()[0],
      "data": sftp.get(data.toString().trim())
    };
  }).then(data => {
    res.set({
      'Cache-Control': 'private, max-age=0, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': 'Sat, 26 Jul 1997 05:00:00 GMT',
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'inline; filename="' + data.name + '"'
    });
    return data.data
  }).then(data => {
    res.send(data)
  }).catch(err => {
    console.log(err, 'catch error');
  });
})



app.use(function(req, res, next) {
  res.status(404);
  // default to plain-text. send()
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
