const bcrypt = require('bcrypt');

const password = 'admin123';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('HASH:', hash);
  })
  .catch(err => {
    console.error(err);
  });
