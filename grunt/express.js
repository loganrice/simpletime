var path = require('path');

module.exports = {
   options: {
      port: 9080,
      hostname: 'localhost'
   },
   dev: {
      options: {
         bases: path.resolve('./main'),
         server: path.resolve('./index'),
         livereload: true
      }
   }
};