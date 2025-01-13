import { Socket } from 'node:net'
import { createInterface } from 'node:readline'

// Настройки подключения к серверу
const HOST = 'localhost'; // или 'localhost'
const PORT = 3000;

// Создаем интерфейс для чтения из stdin и вывода в stdout
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Подключаемся к серверу
const client = new Socket();

client.connect(PORT, HOST, () => {
  console.log(`Подключились к серверу ${HOST}:${PORT}`);
});

// Когда от сервера приходит сообщение — выводим его в консоль
client.on('data', (data) => {
  console.log(data.toString());
});

// Если сервер закрыл соединение
client.on('close', () => {
  console.log('Соединение с сервером закрыто');
  process.exit(0);
});

// Если произошла ошибка
client.on('error', (err) => {
  console.error('Ошибка соединения: ', err.message);
  process.exit(1);
});

// Читаем построчно с консоли и сразу отправляем серверу
rl.on('line', (line) => {
  client.write(line);
});
