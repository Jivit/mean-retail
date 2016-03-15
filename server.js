var express = require('express');
var wagner = require('wagner-core');

require('./app/models/models')(wagner);
require('./config/dependencies')(wagner);

var app = express();

app.set('port', process.env.PORT || 3000);

wagner.invoke(require('./config/auth'), { app: app });

app.use(express.static(__dirname + "/public"));

app.use('/api/v1', require('./app/api')(wagner));

// frontend routes
app.get('*', function(req, res){
  res.sendFile('./public/index.html');
});

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
