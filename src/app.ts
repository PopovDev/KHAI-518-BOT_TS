import express from 'express';
import { PORT, BOT_TOKEN, MONGO_STRING   } from './config';

const app = express()


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  return console.log(`Express is listening at http://localhost:${PORT}`);
});

