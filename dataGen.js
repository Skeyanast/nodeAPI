const { info, error }   = require('./libs/log')(module);
const mongoose          = require('./libs/mongoose').mongoose;
const UserModel         = require('./libs/mongoose').UserModel;
const ClientModel       = require('./libs/mongoose').ClientModel;
const AccessTokenModel  = require('./libs/mongoose').AccessTokenModel;
const RefreshTokenModel = require('./libs/mongoose').RefreshTokenModel;
const Chance            = require('chance');

const chance = new Chance();

async function createUsers() {
  try {
    await UserModel.deleteMany({});

    const user = new UserModel({ username: "andrey", password: "simplepassword" });
    await user.save();
    info("New user - %s:%s", user.username, user.password);

    const promises = [];
    for (let i = 0; i < 4; i++) {
      const user = new UserModel({ username: chance.name().toLowerCase(), password: chance.word() });
      promises.push(user.save());
    }
    const savedUsers = await Promise.all(promises);
    savedUsers.forEach(user => {
      info("New user - %s:%s", user.username, user.password);
    });
  } catch (err) {
    error(err);
  }
}

async function createClients() {
  try {
    await ClientModel.deleteMany({});

    const client = new ClientModel({ name: "OurService iOS client v1", clientId: "mobileV1", clientSecret: "abc123456" });
    await client.save();
    info("New client - %s:%s", client.clientId, client.clientSecret);
  } catch (err) {
    error(err);
  }
}

async function clearTokens() {
  try {
    await AccessTokenModel.deleteMany({});
    await RefreshTokenModel.deleteMany({});
  } catch (err) {
    error(err);
  }
}

async function main() {
  await createUsers();
  await createClients();
  await clearTokens();
  mongoose.disconnect();
}

main().catch(error);