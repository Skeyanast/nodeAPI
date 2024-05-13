## Примеры запросов к серверу server.js:
### Добавить статью (POST):
http://localhost:1337/api/articles
testbody:
{
    "title": "TestArticle",
    "author": "John Doe",
    "description": "lorem ipsum dolar sit amet",
    "images": [
        {
            "kind": "thumbnail",
            "url": "http://habrahabr.ru/images/write-topic.png"
        },
        {
            "kind": "detail",
            "url": "http://habrahabr.ru/images/write-topic.png"
        }
    ]
}

### Получить все статьи (GET):
http://localhost:1337/api/articles

### Получить статью по id (GET):
http://localhost:1337/api/articles/66427c775e5ebfeb8ed59efa

### Обновить статью по id (PUT):
http://localhost:1337/api/articles/66427c775e5ebfeb8ed59efa
testbody:
{
  "title": "TestArticle2",
  "author": "John Doe",
  "description": "lorem ipsum dolar sit amet",
  "images": [
    {
      "kind": "thumbnail",
      "url": "http://habrahabr.ru/images/write-topic.png"
    },
    {
      "kind": "detail",
      "url": "http://habrahabr.ru/images/write-topic.png"
    }
  ]
}

### Удалить статью по id (DELETE):
http://localhost:1337/api/articles/66427c775e5ebfeb8ed59efa

## Примеры запросов к защищенному эндпоинту:
### Создание токена (POST):
http://localhost:1337/oauth/token
testbody:
{
  "grant_type": "password",
  "client_id": "mobileV1",
  "client_secret": "abc123456",
  "username": "andrey",
  "password": "simplepassword"
}

### Обновление токена (POST):
http://localhost:1337/oauth/token
testbody:
{
  "grant_type": "refresh_token",
  "client_id": "mobileV1",
  "client_secret": "abc123456",
  "refresh_token": "TOKEN"
}

### Посмотреть информацию о пользователе (нужен токен) (GET):
http://localhost:1337/api/userinfo 
headers:
Authorization:'Bearer TOKEN'