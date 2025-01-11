// src/index.ts
import 'reflect-metadata';
import { TcpServer } from './server';

const PORT = 3000;

const server = new TcpServer(PORT);
server.start();
