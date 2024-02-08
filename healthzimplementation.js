import { sequelize } from './database.js';
export const implementHealthCheck = (app) => {
    app.get('/healthz', async (req, res) => {
        try {
            await sequelize.authenticate();
            if (Object.keys(req.query).length !== 0|| Object.keys(req.headers).length >7) {
                return res.status(400).set('Cache-Control', 'no-cache').end();
            }
            res.setHeader('Cache-Control', 'no-cache');
            res.status(200).send('');
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            res.setHeader('Cache-Control', 'no-cache');
            res.status(503).end();
        }
    });
};
