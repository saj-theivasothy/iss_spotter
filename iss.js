const request = require('request');

const fetchMyIp = (callback) => {
  request('https://api.ipify.org?format=json', (error, header, ip) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (header.statusCode !== 200) {
      const msg = `Status Code ${header.statusCode} when fetching IP. Response: ${ip}`;
      callback(Error(msg), null);
      return;
    }
    
    const parsedIp = JSON.parse(ip).ip;
    callback(null, parsedIp);
  });
};

const fetchCoordsByIP = (ip, callback) => {
  request(`https://ipvigilante.com/${ip}`, (error, header, body) => {
    if (error) {
      callback(error, body);
      return;
    }
    if (header.statusCode !== 200) {
      const msg = `Status Code ${header.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const { latitude, longitude } = JSON.parse(body).data;
    callback(null, ({ latitude, longitude }));
    
  });
};

const fetchISSFlyOverTimes = (coords, callback) => {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, header, body) => {
    if (error) {
      callback(error, null);
    }

    if (header.statusCode !== 200) {
      const msg = `Status Code ${header.statusCode} when fetching Flyover times. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const parsedData = JSON.parse(body).response;
    callback(null, parsedData);
  });
  
};

const nextISSTimesForMyLocation = (callback) => {
  fetchMyIp((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(coords, (error, time) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, time);
      });
    });
  });
  
};

module.exports = { nextISSTimesForMyLocation };