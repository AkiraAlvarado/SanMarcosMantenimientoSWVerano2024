import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as http from 'http';
import errorHandler from 'errorhandler';

// routes
import { UserRoute } from './api/User';
import { LoginRoute } from './api/Login';
import { PlaceRoute } from './api/Place';
import { FavoritesRoute } from './api/Favorites';
import { DateRoute } from './api/Date';
import userRoutes from './api/routes/user.routes';

// middlewares
import {
  requestLogger, unknownEndpoint,
} from './middlewares';
import bodyParser from 'body-parser';

export class Server {
  private express: express.Express;
  private port: number;
  private httpServer?: http.Server;

  constructor(port: number) {
    this.port = port;
    this.express = express();
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(requestLogger);

    const router = Router();
    router.use(errorHandler());
    this.express.use(router);
    
    // Registrando las rutas de la API V1
    this.express.use('/api/v1/dates', DateRoute);
    this.express.use('/api/v1/favorites', FavoritesRoute);
    this.express.use('/api/v1/placeinfo', PlaceRoute);
    this.express.use('/api/v1/auth/register', UserRoute);
    this.express.use('/api/v1/auth/login', LoginRoute);

    // Registrando las rutas de la API V2
    this.express.use('/api/v2/auth/register', userRoutes);

    this.express.use('/ping', (req, res) => res.send('pong!'));
    this.express.use('/', (req, res) => res.send('Hi!'));

    router.use((error: Error, req: Request, res: Response, next: Function) => {
      console.error(error);
      res.status(500).send(error.message);
    })
  }

  async listen(): Promise<void> {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('mongo connected from mongoose')
    return new Promise((resolve) => {
      this.httpServer = this.express.listen(this.port, () => {
        console.log(`API is running on http://localhost:${this.port}`)
      })
      resolve();
    })


  }

  getHttpServer() {
    return this.httpServer;
  }
}