// client.ts
import net from 'net'
import { createInterface } from 'node:readline'
import chalk from 'chalk'

// Настройки подключения к серверу
const HOST = 'localhost' // или '127.0.0.1'
const PORT = 3003

// Создаем интерфейс для чтения из stdin и вывода в stdout
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
})

// Создаем клиентский сокет
const client = new net.Socket()

client.connect(PORT, HOST, () => {
  console.log(
    chalk.greenBright(`\n[✔] You was successfully connected to the server : ${HOST}:${PORT.toString()}\n`),
  )
  console.log(chalk.blue('> Enter message or command (command starts with $), type $help to get help:\n'))
})

// Когда от сервера приходит сообщение — выводим его в консоль
client.on('data', (data) => {
  const message = data.toString()
  // Выводим с разным цветом, в зависимости от содержания
  if (message.startsWith('Error')) {
    console.log(chalk.red(`\n[Server]: ${message}\n`))
  } else if (message.startsWith('Welcome')) {
    console.log(chalk.green(`\n[Server]: ${message}\n`))
  } else {
    console.log(chalk.cyan(`\n[Server]: ${message}\n`))
  }
  // Повторная инструкция
  console.log(chalk.blue('>'))
})

// Если сервер закрыл соединение
client.on('close', () => {
  console.log(chalk.yellow('\n[!] Connection to server was closed.\n'))
  process.exit(0)
})

// Если произошла ошибка
client.on('error', (err) => {
  console.error(chalk.redBright(`\n[Connection error!]: ${err.message}`))
  process.exit(1)
})

// Читаем построчно с консоли и сразу отправляем на сервер
rl.on('line', (line) => {
  client.write(line)
})
