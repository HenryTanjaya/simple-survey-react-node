var localtunnel = require('localtunnel');

localtunnel(5000, { subdomain: 'henrytanjayaweb' }, function(err, tunnel) {
  console.log('LT running')
});
