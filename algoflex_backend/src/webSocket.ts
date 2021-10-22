import * as WebSocket from 'ws';
import { BuildListener } from './listeners/build_listener';
import server from './httpServer';

const wss = new WebSocket.Server({server, path: '/ws'});

wss.on('connection', (ws: WebSocket) => {

    let buildListener: BuildListener | null = null;

    const removeDocker = () => {
        if(buildListener != null){
            buildListener.destroyDocker();
            buildListener = null;
        }
    }

    ws.on('message', async (data: string) => {
        if(buildListener == null){
            const buildData = JSON.parse(data);
            buildListener = await BuildListener.create(buildData.code);

            ws.send(JSON.stringify({state:1, executeLink: buildListener.getExecuteLink(), compileLink: buildListener.getCompileLink()}));
            const hasCompiled = await buildListener.build();

            ws.send(JSON.stringify({state:2, hasCompiled}))

            if(hasCompiled && buildData.execute){
                await buildListener.execute();
                ws.send(JSON.stringify({state:3, hasExecuted: buildListener.isExecuted()}))
            }
            removeDocker();
        }
    });

    ws.on('close', () => {
        removeDocker();
    });
});

export default wss;