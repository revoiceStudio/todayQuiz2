const request = require("request");
const { promisify } = require('util');
const getRequestAsnc = promisify(request.get).bind(request);

getGoogleUser = (accessToken) => {
    return new Promise(async (resolve, reject) => {
        try {
            const googleUserInfo = await getRequestAsnc(process.env.GOOGLE + accessToken);
            console.log(`googleUserInfo : ${googleUserInfo.body}`);
            return resolve(JSON.parse(googleUserInfo.body));
        } catch (err) {
            return reject(err);
        }
    });
}

module.exports = { getGoogleUser };