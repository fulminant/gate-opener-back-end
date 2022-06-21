const axios = require('axios')

module.exports.getSecrets = async () => {
  const response = await axios.get(`https://${process.env.DOPPLER_TOKEN}@api.doppler.com/v3/configs/config/secrets/download?format=json`);
  return response.data;
}
