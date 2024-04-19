const express         = require('express');
const path            = require('path'); // модуль для парсинга пути
const favicon         = require('serve-favicon');
const log             = require('./libs/log')(module);
const config          = require('./libs/config');
const logger          = require('morgan');
const bodyParser      = require('body-parser');
const methodOverride  = require('method-override');
const mongoose        = require('./libs/mongoose');
const ArticleModel    = require('./libs/mongoose').ArticleModel;
const app = express();

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Обработка ошибки 404
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not found' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({ error: err.message });
});

// Получение всех статей
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await ArticleModel.find();
        res.send(articles);
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
        log.error('Internal error(500):', err.message);
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
        log.info("Article created");
        res.send({ status: 'OK', article });
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(500).send({ error: 'Validation error' });
        }
        else {
            res.status(500).send({ error: 'Server error' });
        }
    }
});

// Получение статьи по ID
app.get('/api/articles/:id', async (req, res) => {
    try {
        const atricle = await ArticleModel.findById(req.params.id);
        if (!article) {
            res.status(404).send({ error: 'Not found' });
            return;
        }
        res.send({ status: 'OK', article });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
        log.error('Internal error(500):', err.message);
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
        log.info("Article updated");
        res.send({ status: 'OK', article });
    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).send({ error: 'Validation error' });
        } else {
            res.status(500).send({ error: 'Server error' });
        }
        log.error('Internal error(500):', err.message);
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
        log.info("Article removed");
        res.send({ status: 'OK' });
    } catch (err) {
        res.status(500).send({ error: 'Server error' });
        log.error('Internal error(500):', err.message);
    }
});

app.get('/ErrorExample', function(req, res, next){
    next(new Error('Random error!'));
});

app.get('/api', function (req, res) {
    res.send('API is running');
});

app.listen(config.get('port'), function(){
    log.info('Express server listening on port ' + config.get('port'));
});