import type { IpcMainEvent } from 'electron'
import {
  app,
  BrowserWindow,
  ipcMain,
} from 'electron'
import * as path from 'path'
import * as net from 'net'

let mainWindow: BrowserWindow | null = null
let clientSocket: net.Socket | null = null

function createWindow(): Promise<void> {
  return new Promise((resolve, reject) => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })

    mainWindow
      .loadFile(path.join(__dirname, './public/index.html'))
      .then(() => {
        mainWindow?.on('closed', () => {
          mainWindow = null
        })
        resolve()
      })
      .catch((error: unknown) => {
        reject(new Error(String(error)))
      })
  })
}

function connectToServer(host: string, port: number): void {
  clientSocket = new net.Socket()

  clientSocket.connect(port, host, () => {
    console.log(`Connected to ${host}:${port.toString()}`)
    mainWindow?.webContents.send('system-message', `Connected to ${host}:${port.toString()}`)
  })

  clientSocket.on('data', (data) => {
    const msg = data.toString()
    mainWindow?.webContents.send('chat-message', msg)
  })

  clientSocket.on('close', () => {
    mainWindow?.webContents.send('system-message', 'Connection closed by server')
    clientSocket = null
  })

  clientSocket.on('error', (err) => {
    mainWindow?.webContents.send('system-message', `Error: ${err.message}`)
  })
}

function sendMessageToServer(text: string): void {
  if (clientSocket) {
    clientSocket.write(text)
  } else {
    mainWindow?.webContents.send('system-message', 'Not connected')
  }
}

/*
// 1) Waiting fot app.whenReady()
// 2) Then call createWindow()
// 3) Then configure IPC
// 4) On error -> catch
*/

app
  .whenReady()
  .then(() => createWindow())
  .then(() => {
    // When window is created, configuring IPC
    ipcMain.on(
      'connect-to-server',
      (_event: IpcMainEvent, payload: { host: string; port: number }) => {
        connectToServer(payload.host, payload.port)
      },
    )

    ipcMain.on('send-message', (_event: IpcMainEvent, text: string) => {
      sendMessageToServer(text)
    })
  })
  .catch((err: unknown) => {
    console.error('Error in main process:', err)
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
