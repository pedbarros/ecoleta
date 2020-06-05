import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errors } from 'celebrate';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet({
  frameguard: false
}));
app.use(errors());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));


app.listen(3333);