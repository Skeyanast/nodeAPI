var config = require('./config');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var UserModel = require('./mongoose').UserModel;
var ClientModel = require('./mongoose').ClientModel;
var AccessTokenModel = require('./mongoose').AccessTokenModel;
var RefreshTokenModel = require('./mongoose').RefreshTokenModel;

passport.use(new BasicStrategy(
    async (username, password, done) => {
        try {
            const client = await ClientModel.findOne({ clientId: username });
            if (!client) { return done(null, false); }
            if (client.clientSecret != password) { return done(null, false); }

            return done(null, client);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new ClientPasswordStrategy(
    async (clientId, clientSecret, done) => {
        try {
            const client = await ClientModel.findOne({ clientId: clientId });
            if (!client) { return done(null, false); }
            if (client.clientSecret != clientSecret) { return done(null, false); }

            return done(null, client);
        } catch (err) {
            return done(err);
        }
    }
));

passport.use(new BearerStrategy(
    async (accessToken, done) => {
        try {
            const token = await AccessTokenModel.findOne({ token: accessToken });
            if (!token) { return done(null, false); }

            if (Math.round((Date.now() - token.created) / 1000) > config.get('security:tokenLife')) {
                await AccessTokenModel.deleteOne({ token: accessToken });
                return done(null, false, { message: 'Token expired' });
            }

            const user = await UserModel.findById(token.userId);
            if (!user) { return done(null, false, { message: 'Unknown user' }); }

            const info = { scope: '*' }
            done(null, user, info);
        } catch (err) {
            return done(err);
        }
    }
));