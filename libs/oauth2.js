var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var config = require('./config');
var UserModel = require('./mongoose').UserModel;
var ClientModel = require('./mongoose').ClientModel;
var AccessTokenModel = require('./mongoose').AccessTokenModel;
var RefreshTokenModel = require('./mongoose').RefreshTokenModel;

// create OAuth 2.0 server
var server = oauth2orize.createServer();

// Exchange username & password for access token.
server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
    try {
        const user = await UserModel.findOne({ username: username });
        if (!user) { return done(null, false); }
        if (!user.checkPassword(password)) { return done(null, false); }

        await RefreshTokenModel.deleteMany({ userId: user.userId, clientId: client.clientId });
        await AccessTokenModel.deleteMany({ userId: user.userId, clientId: client.clientId });

        const tokenValue = crypto.randomBytes(32).toString('base64');
        const refreshTokenValue = crypto.randomBytes(32).toString('base64');
        const token = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        const refreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        await refreshToken.save();
        const info = { scope: '*' }
        await token.save();
        done(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
    } catch (err) {
        done(err);
    }
}));

// Exchange refreshToken for access token.
server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {
    try {
        const token = await RefreshTokenModel.findOne({ token: refreshToken });
        if (!token) { return done(null, false); }

        const user = await UserModel.findById(token.userId);
        if (!user) { return done(null, false); }

        await RefreshTokenModel.deleteMany({ userId: user.userId, clientId: client.clientId });
        await AccessTokenModel.deleteMany({ userId: user.userId, clientId: client.clientId });

        const tokenValue = crypto.randomBytes(32).toString('base64');
        const refreshTokenValue = crypto.randomBytes(32).toString('base64');
        const newToken = new AccessTokenModel({ token: tokenValue, clientId: client.clientId, userId: user.userId });
        const newRefreshToken = new RefreshTokenModel({ token: refreshTokenValue, clientId: client.clientId, userId: user.userId });
        await newRefreshToken.save();
        const info = { scope: '*' }
        await newToken.save();
        done(null, tokenValue, refreshTokenValue, { 'expires_in': config.get('security:tokenLife') });
    } catch (err) {
        done(err);
    }
}));

// token endpoint
exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
]