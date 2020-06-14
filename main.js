var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express');
    path = require('path');
    url = require('url');
    axios = require('axios');
    qs = require('querystring');

var port = 443;

var options = {
    key: fs.readFileSync('PRIVATEKEYHERE'),
    cert: fs.readFileSync('CERTIFICATEHERE'),
};

var app = express();

var server = https.createServer(options, app).listen(port, function () {
    console.log("Express server listening on port " + port);
});

app.all("*", function (req, resp, next) {
    console.log(`[${req.ip.split(':').pop()}] [${req.url}]`);
    next();
});

app.get('/', async function (req, res) {
    res.sendFile(path.join(__dirname + '/htmlFiles/splashPage.html'))
})

app.get('/converter', async function (req, res) {
    var host = req.get('Host');
    host = host.replace(/:\d+$/, ":" + app.get('port'));
    if (req.headers['referer'] == ('https://' + host + '/') || req.headers['referer'] == ('https://' + host)){
        res.sendFile(path.join(__dirname + '/htmlFiles/profileConverter.html'))
    } else {
        res.redirect('/')
    }
})

app.get('/delay', async function (req, res) {
    res.sendFile(path.join(__dirname + '/htmlFiles/delayCalculator.html'))
})

app.get('/recap', async function (req, res) {
    res.sendFile(path.join(__dirname + '/htmlFiles/recapCalculator.html'))
})

app.get('/interpretScore', async function (req, res) {
    var q = url.parse(req.url, true).query;
    var token = q.token
    var score = 'Error'
    var timestamp = 'Error'
    await axios({
        method: "post",
        url: "https://www.google.com/recaptcha/api/siteverify",
        data: qs.stringify({
            "secret" : "SECRETKEYHERE",
            "response" : token,
            "ipaddress" : req.ip.split(':').pop()
        })
    }).then(function (response){
        score = response['data']['score']
        timestamp = response['data']['challenge_ts']
    }).catch(function (error){
    })

    fs.readFile(__dirname + '/htmlFiles/recapInterpreter.html', (err, data) => {
        res.send(data.toString().replace('IPADDRESSHERE',req.ip.split(':').pop()).replace('TIMESTAMPHERE', timestamp).replace('RECAPTCHASCORE', score));
     });
})

app.get('/bootstrap/:fileName', function (req, res) {
    res.sendFile(path.join(__dirname + '/bootstrap/' + req.params.fileName))
})

app.get('/robots.txt', function (req, res) {
    res.sendFile(path.join(__dirname + '/htmlFiles/robots.txt'))
})

app.get('/sitemap.xml', function (req, res) {
    res.sendFile(path.join(__dirname + '/htmlFiles/sitemap.xml'))
})

var httpApp = express();
var httpRouter = express.Router();
httpApp.use('*', httpRouter);
httpRouter.get('*', function (req, res) {
    var host = req.get('Host');
    host = host.replace(/:\d+$/, ":" + app.get('port'));
    var destination = ['https://', host, req.baseUrl].join('');
    return res.redirect(destination);
});
var httpServer = http.createServer(httpApp);
httpServer.listen(80);