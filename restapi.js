import express from 'express';
import bcrypt from 'bcrypt';
import { User } from './database.js';
import logger from './logs.js';
import { Email_verify } from "./database.js";
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub(); 
const topicName = 'verify_email';
async function publishMessageToPubSub(message) {
    try {
        const dataBuffer = Buffer.from(JSON.stringify(message));
        await pubsub.topic(topicName).publish(dataBuffer);
        logger.info('Message published to Pub/Sub topic successfully');
    } catch (error) {
        logger.error('Error publishing message to Pub/Sub topic:', error);
        throw error;
    }
}

const verificationusermodel = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            console.log('Missing or invalid authorization header');
            return res.sendStatus(401);
        }
        // Decode the encoded credentials
        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
          console.log("Received request : username , password:", username, password);
        const verificationRecord = await Email_verify.findOne({ where: { email: username } });

        if (verificationRecord && verificationRecord.verified)
            return next();
        
        // If the user is not verified, send a 403 Forbidden response
        return res.status(403).json({ error: 'Your account has not been verified' });
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
// Middleware to authenticate encoded credentials

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            console.log('Missing or invalid authorization header');
            logger.warn('Missing or invalid authorization header');
            return res.sendStatus(401);
        }
        // Decode the encoded credentials
        const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
          console.log("Received request : username , password:", username, password);
        // Checking if username and password match
        const user = await User.findOne({ where: { username } });
        if (!user) {
            console.log('User not found:', username);
            return res.sendStatus(401);
        }
       const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            console.log('Password mismatch for user:', username);
            logger.warn('Password mismatch for user')
            return res.sendStatus(401);
        }
        console.log('Authentication successful for user:', username);
        req.user = user;
        next();
    } catch (error) {
        console.error('Error during authentication:', error);
        return res.sendStatus(500); // Send a 500 status response for any internal server errors
    }
};

export const implementRestAPI = (app) => {
    app.use(express.json());

    app.use((req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(req.method) && req.path === '/healthz') {
            logger.info("method not found");
            res.status(405).end();
        } else {
            next();
        }
    });

    // Create user endpoint
    app.post('/v1/user', async (req, res) => {
        try {
            const { username, password, firstname, lastname } = req.body;
            console.log('Received user data:', { username, password, firstname, lastname });
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                logger.debug('user already exists');
                return res.status(400).json({ message: 'Username already exists' });
            }
            const hashedPassword = await bcrypt.hashSync(password, 10);
            const user = await User.create({ username, password: hashedPassword, firstname, lastname });
            await publishMessageToPubSub(user);
            let userinfo = user.toJSON();
            delete userinfo.createdAt;
            delete userinfo.updatedAt;
            const EmailVerification = await Email_verify.create({
                userId: user.id,
                email: user.username
                });
            return res.status(201).json({ userinfo });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(400).end();
        }
    });

    // Get user details for the authenticated user
    app.get('/v1/user/self',verificationusermodel, authenticate, async (req, res) => {
        try {
            const user = req.user;
            let userinfo = user.toJSON();
            delete userinfo.password;
            delete userinfo.createdAt;
            delete userinfo.updatedAt;
            logger.info("user info displayed");
            return res.status(200).json({ userinfo });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).end();
        }
    });

    // Update user details for the authenticated user
    app.put('/v1/user/self',verificationusermodel, authenticate, async (req, res) => {
        try {
            const { password, firstname, lastname, ...extraFields } = req.body;

            if (Object.keys(extraFields).length > 0) {
                console.log("cant update these field", extraFields);
                logger.error('password mismatch')
                return res.status(400).json({ message: 'password mismatch' });
            }
            const user = req.user;
            if (password) {
                const hashedPassword = await bcrypt.hashSync(password, 10);
                user.password = hashedPassword;
            }
            if (firstname) user.firstname = firstname;
            if (lastname) user.lastname = lastname;
            await user.save();
            return res.status(204).end();
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(400).end();
        }
    });
    app.get('/verify/:id', async (req, res) => {
        try {
            const User_before = await User;
            const EmailVerification = await Email_verify;
            const { id } = req.params;
            const userme = await User_before.findByPk(id);
    
            if (!userme)
                return res.status(404).send('User not found. Verification link is invalid.');

            const verificationRecord = await EmailVerification.findOne({ where: { userId: id } });
    
            if (!verificationRecord)
                return res.status(404).send('Verification record not found. Link may be invalid.');
    
            if (new Date() - new Date(verificationRecord.sentAt) > 120000)
                return res.status(400).send('Verification link has expired.');
    
            if (verificationRecord.verified)
                return res.status(200).send('User is already verified.');

            await verificationRecord.update({ verified: true });
            res.send('User is verified');
        } catch (error) {
            console.error("Error:", error);
            res.status(500).send('Internal Server Error');
        }
    });
    
};