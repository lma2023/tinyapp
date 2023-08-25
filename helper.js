const getUserByEmail = function(email, database) {
    for (const obj in database) {
      if (email === database[obj].email) {
        console.log(obj);
        return obj;
      }
    }
    return undefined;
  };
  
  module.exports = { getUserByEmail };