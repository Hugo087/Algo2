import errorHandler from 'errorhandler';
import app from './app';

const config = require('config').get(process.env.NODE_ENV || 'development');

if (process.env.NODE_ENV === "development") {
    app.use(errorHandler());
}

const http = require('http').Server(app);

const server = http.listen(config.port, () => {
    console.log(
        "  App is running at http://localhost:%d in %s mode",
        config.port,
        config.mode
    );
    console.log("  Press CTRL-C to stop\n");
});

app.listen(4200);

export default server