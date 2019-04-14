require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const graphQlHttp = require('express-graphql');
const graphQlSchema = require('./graphql/shema/index');
const graphQlResolvers = require('./graphql/resolvers/index');
const mongoose = require('mongoose');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(isAuth);

app.use(
  '/graphql',
  graphQlHttp({
    schema: graphQlSchema,
    rootValue: graphQlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${
      process.env.MONGO_URL
    }/${process.env.MONGO_DB}?retryWrites=true`
  )
  .then(() => {
    const portNumber = 8000;
    console.info('Connected to Database.');
    console.info(`Server is listening port: ${portNumber}`);
    app.listen(portNumber);
  })
  .catch(err => {
    console.log(`🔰 Error:`, err);
  });
