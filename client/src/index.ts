// client.ts
import net from 'net'
import readline from 'readline'
import chalk from 'chalk'

// Настройки подключения к серверу
const HOST = 'localhost' // или '127.0.0.1'
const PORT = 3003

// Создаем интерфейс для чтения из stdin и вывода в stdout
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// Создаем клиентский сокет
const client = new net.Socket()

client.connect(PORT, HOST, () => {
  console.log(
    chalk.greenBright(`\n[✔] Успешно подключились к серверу: ${HOST}:${PORT.toString()}\n`),
  )
  console.log(chalk.blue('> Введите сообщение или команду:'))
})

// Когда от сервера приходит сообщение — выводим его в консоль
client.on('data', (data) => {
  const message = data.toString().trim()
  // Выводим с разным цветом, в зависимости от содержания
  if (message.startsWith('Ошибка')) {
    console.log(chalk.red(`\n[Сервер]: ${message}\n`))
  } else if (message.startsWith('Добро пожаловать')) {
    console.log(chalk.green(`\n[Сервер]: ${message}\n`))
  } else {
    console.log(chalk.cyan(`\n[Сервер]: ${message}\n`))
  }
  // Повторная инструкция
  console.log(chalk.blue('>'))
})

// Если сервер закрыл соединение
client.on('close', () => {
  console.log(chalk.yellow('\n[!] Соединение с сервером закрыто\n'))
  process.exit(0)
})

// Если произошла ошибка
client.on('error', (err) => {
  console.error(chalk.redBright(`\n[Ошибка соединения]: ${err.message}`))
  process.exit(1)
})

// Читаем построчно с консоли и сразу отправляем на сервер
rl.on('line', (line) => {
  // Можно, например, окрашивать сами вводимые команды/сообщения
  console.log(chalk.gray(`Вы: ${line}`))
  client.write(line.trim())
})
