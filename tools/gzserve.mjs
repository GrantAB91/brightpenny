import express from 'express';
import compression from 'compression';
const app = express();
app.use(compression());
app.use(express.static('/Users/grant/BrightPenny/site', { extensions: ['html'] }));
app.use((req, res) => res.status(404).sendFile('/Users/grant/BrightPenny/site/404.html'));
app.listen(8020, () => console.log('gz server on 8020'));
