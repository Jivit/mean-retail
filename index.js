var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);

var app = express();

app.set('port', process.env.PORT || 3000);

app.use('/api/v1', require('./api')(wagner));

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
