import express from 'express';
import routes from './routes';
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"),
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
    next()
  });

app.use('/api', routes);

export default app;