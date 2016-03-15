var express = require('express');
var wagner = require('wagner-core');

require('./app/models/models')(wagner);
require('./config/dependencies')(wagner);

var app = express();

app.set('port', process.env.PORT || 3000);

wagner.invoke(require('./config/auth'), { app: app });

app.use('/api/v1', require('./app/api')(wagner));

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
