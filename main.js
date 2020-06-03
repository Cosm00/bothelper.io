var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express');
    path = require('path');

var port = 443;

var options = {
    key: fs.readFileSync('./329084ew890fjkldslkjfdkjlsjkfscxnrewr890ew/private.key'),
    cert: fs.readFileSync('./329084ew890fjkldslkjfdkjlsjkfscxnrewr890ew/certificate.crt'),
};

var app = express();

var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

app.all("*", function (req, resp, next) {
    console.log(`[${req.connection.remoteAddress}] [${req.url}]`);
    next();
 });

 app.get('/', async function (req, res){
     res.sendFile(path.join(__dirname + '/htmlFiles/splashPage.html'))
 })

 app.get('/converter', async function (req, res){
     res.sendFile(path.join(__dirname + '/htmlFiles/profileConverter.html'))
 })

app.get('/bootstrap/:fileName', function (req, res){
    res.sendFile(path.join(__dirname + '/bootstrap/' + req.params.fileName))
})

var httpApp = express();
var httpRouter = express.Router();
httpApp.use('*', httpRouter);
httpRouter.get('*', function(req, res){
    var host = req.get('Host');
    host = host.replace(/:\d+$/, ":"+app.get('port'));
    var destination = ['https://', host, req.url].join('');
    return res.redirect(destination);
});
var httpServer = http.createServer(httpApp);
httpServer.listen(80);