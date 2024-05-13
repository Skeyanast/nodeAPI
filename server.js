const express         = require('express'); // библиотека express.js
const path            = require('path'); // модуль для работы с путями
const favicon         = require('serve-favicon'); // модуль для иконки сайта
const { info, error } = require('./libs/log')(module); // пользовательский модуль логов
const config          = require('./libs/config'); // модуль конфигурационных параметров приложения
const logger          = require('morgan'); // модуль логирования http-запросов
const bodyParser      = require('body-parser'); // модуль для парсинга тела http-запросов
const methodOverride  = require('method-override'); // модуль для поддержки put и delete запросов
const mongoose        = require('./libs/mongoose'); // модуль для работы с mongodb
const ArticleModel    = require('./libs/mongoose').ArticleModel; // модель Mongoose для работы с коллекцией статей
const oauth2          = require('./libs/oauth2'); // модуль для работы с авторизацией
const passport        = require('passport'); // модуль для работы с авторизацией

const app = express(); // создаем экземпляр приложения express

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // подключаем фавиконку
app.use(logger('dev')); // подключаем логирование в режиме разработки
app.use(bodyParser.json()); // анализ тела запроса в формате json как req.body
app.use(bodyParser.urlencoded({ extended: true })); // анализ данных формы, парсит в req.body
app.use(methodOverride('_method')); // поддержка нестандартных методов в запросах
app.use(express.static(path.join(__dirname, 'public'))); // поддержка статических файлов в директории
app.use(passport.initialize());

require('./libs/oauth');

// Создание токена аутентификации
app.post('/oauth/token', oauth2.token);

// Защищенный эндпоинт
app.get('/api/userInfo',
    passport.authenticate('bearer', { session: false }),
    function(req, res) {
        res.json({ user_id: req.user.userId, name: req.user.username, scope: req.authInfo.scope })
    }
);

// Получение всех статей
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await ArticleModel.find();
        res.send(articles);
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
        error(err);
    }
});

// Создание новой статьи
app.post('/api/articles', async (req, res) => {
    const article = new ArticleModel({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        images: req.body.images
    });

    try {
        await article.save();
        info("Article created");
        res.send({ status: 'OK', article });
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(500).send({ error: 'Validation error' });
        }
        else {
            res.status(500).send({ error: 'Server error' });
            error(err);
        }
    }
});

// Получение статьи по ID
app.get('/api/articles/:id', async (req, res) => {
    try {
        const article = await ArticleModel.findById(req.params.id);
        if (!article) {
            res.status(404).send({ error: 'Not found' });
            return;
        }
        res.send({ status: 'OK', article });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
        error(err);
    }
});

// Обновление статьи по ID
app.put('/api/articles/:id', async (req, res) => {
    try {
        const article = await ArticleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!article) {
            res.status(404).send({ error: 'Not found' });
            return;
        }
        info("Article updated");
        res.send({ status: 'OK', article });
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).send({ error: 'Validation error' });
        } else {
            res.status(500).send({ error: 'Server error' });
            error(err);
        }
    }
});

// Удаление статьи по ID
app.delete('/api/articles/:id', async (req, res) => {
    try {
        const article = await ArticleModel.findByIdAndRemove(req.params.id);
        if (!article) {
            res.status(404).send({ error: 'Not found' });
            return;
        }
        info("Article removed");
        res.send({ status: 'OK' });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
        error(err);
    }
});

// Тестовый эндпоинт
app.get('/ErrorExample', function(req, res, next){
    next(new Error('Random error!'));
});

// Тестовый корневой эндпоинт
app.get('/api', function (req, res) {
    res.send('API is running');
});

// Обработка ошибок
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message });
    error(err);
});

// Обработка ошибки 404
app.use((req, res, next) => {
    const err = new Error('Not found');
    err.status = 404;
    next(err);
});

// Прослушивание порта
app.listen(config.get('port'), function(){
    info(`Express server listening on port ${config.get('port')}`);
});