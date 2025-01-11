// client.js (быстрый пример без TS)
import net from 'net'
import readline from 'readline'

const HOST = '127.0.0.1';
const PORT = 3000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const client = new net.Socket();
client.connect(PORT, HOST, () => {
  console.log(`Connected to ${HOST}:${PORT}`);
});

client.on('data', (data: { toString: () => any; }) => {
  console.log(data.toString());
});

client.on('close', () => {
  console.log('Connection closed');
  process.exit(0);
});

rl.on('line', (line: any) => {
  client.write(line);
});
