#!/usr/bin/env node

import * as http from 'http';
import * as fs from 'fs';

import * as parseArgs from 'minimist';
import * as yaml from 'js-yaml';
import * as ws from 'ws';
import * as rpc from '@sourcegraph/vscode-ws-jsonrpc';
import * as rpcServer from '@sourcegraph/vscode-ws-jsonrpc/lib/server';

const argv = parseArgs(process.argv.slice(2));

if (argv.help || !argv.languageServers) {
  console.log(`Usage: server.js --port 3010 --languageServers config.yml`);
  process.exit(1);
}

const serverPort : number = parseInt(argv.port) || 3000;

let languageServers: string[];

try {
  const parsed = yaml.safeLoad(fs.readFileSync(argv.languageServers), 'utf8');
  if (!parsed.langservers) {
    console.log('Your langservers file is not a valid format, see README.md');
    process.exit(1);
  }
  languageServers = parsed.langservers;
} catch (e) {
  console.error(e);
  process.exit(1);
}

const wss : ws.Server = new ws.Server({
  port: serverPort,
  perMessageDeflate: false
}, () => {
  console.log(`Listening to http and ws requests on ${serverPort}`);
});

function toSocket(webSocket: ws): rpc.IWebSocket {
  return {
      send: content => webSocket.send(content),
      onMessage: cb => webSocket.onmessage = event => {
        // On converti le paramètre "code" en int pour éviter que le serveur de langage plante
        var result = JSON.parse(event.data.toString());
        if(result['method'] === "textDocument/codeAction" ){
            result['params']['context']['diagnostics'].forEach((value, index, array) => {
                array[index]['code'] = parseInt(value['code']);
            });
        }
        cb(JSON.stringify(result));
      },
      onError: cb => webSocket.onerror = event => {
          if ('message' in event) {
              cb((event as any).message)
          }
      },
      onClose: cb => webSocket.onclose = event => cb(event.code, event.reason),
      dispose: () => webSocket.close()
  }
}

wss.on('connection', (client : ws, request : http.IncomingMessage) => {
  let langServer : string[];

  Object.keys(languageServers).forEach((key) => {
    if (request.url === '/' + key) {
      langServer = languageServers[key];
    }
  });
  if (!langServer || !langServer.length) {
    console.error('Invalid language server', request.url);
    client.close();
    return;
  }

  const localConnection = rpcServer.createServerProcess('Example', langServer[0], langServer.slice(1));
  console.log(langServer[0]);
  const socket : rpc.IWebSocket = toSocket(client);
  const connection = rpcServer.createWebSocketConnection(socket);
  rpcServer.forward(connection, localConnection);
  console.log(`Forwarding new client`);
  socket.onClose((code, reason) => {
    console.log('Client closed', reason);
    localConnection.dispose();
  });
});
