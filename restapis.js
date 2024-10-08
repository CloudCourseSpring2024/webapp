import express from 'express';
import bcrypt from 'bcrypt';
import { User } from './database.js';

export const authenticate = async (req, res, next) => {
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
        // Checking if username and password match
        const user = await User.findOne({ where: { username } });
        if (!user) {
            console.log('User not found:', username);
            return res.sendStatus(401);
        }
       const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) {
            console.log('Password mismatch for user:', username);
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
            res.status(405).end();
        } else {
            next();
        }
    });

    // Create user endpoint
    app.post('/v10/user', async (req, res) => {
        try {
            const { username, password, firstname, lastname } = req.body;
            console.log('Received user data:', { username, password, firstname, lastname });
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            const hashedPassword = await bcrypt.hashSync(password, 10);
            const user = await User.create({ username, password: hashedPassword, firstname, lastname });
            let userinfo = user.toJSON();
            delete userinfo.createdAt;
            delete userinfo.updatedAt;
            return res.status(201).json({ userinfo });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(400).end();
        }
    });

    // Get user details for the authenticated user
    app.get('/v10/user/self', authenticate, async (req, res) => {
        try {
            const user = req.user;
            let userinfo = user.toJSON();
            delete userinfo.password;
            delete userinfo.createdAt;
            delete userinfo.updatedAt;
            return res.status(200).json({ userinfo });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).end();
        }
    });

    // Update user details for the authenticated user
    app.put('/v10/user/self', authenticate, async (req, res) => {
        try {
            const { password, firstname, lastname, ...extraFields } = req.body;

            if (Object.keys(extraFields).length > 0) {
                console.log("cant update these field", extraFields);
                return res.status(400).end();
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
};