import express from 'express';
import bcrypt from 'bcrypt';
import { User } from './database.js';
import { v4 as uuidv4 } from 'uuid';
import { UUID } from 'sequelize';

// generate UUIDs using uuidv4()
const myUUID = uuidv4();


// Middleware to authenticate encoded credentials
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(authHeader);
        return res.sendStatus(401);
    }

    // Decode the  encoded credentials
    console.log(authHeader);
    console.log(authHeader.split(' ')[1]);
    const token = authHeader.split(' ')[1];
    console.log(token);

    // Checking if username and password match
    const user = await User.findOne({
        where: { token: token },
        attributes: { exclude: ['token','createdAt','updatedAt'] }
      });
    if (!user) {
        return res.sendStatus(403);
    }

    req.user = user;
    next();
};

// Generate a random token
const generateToken = () => {
    return Math.random().toString(36); 
};

export const implementRestAPI = (app) => {
    app.use((req, res, next) => {
        if (['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].includes(req.method) && req.path === '/healthz') {
            res.status(405).end();
        } else {
            next();
        }
    });

    // Create user endpoint
    app.post('/v1/user', async (req, res) => {
        try {
            const id= myUUID;
            const { username, password, firstname, lastname } = req.body;
            const existingUser = await User.findOne({ where: { username } });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const token = generateToken(); // Generate a random token
            const user = await User.create({id, username, password: hashedPassword, firstname, lastname, token: token });
            let userinfo = user.toJSON();
            delete userinfo.password;
            delete userinfo.createdAt;
            delete userinfo.updatedAt;         
            return res.status(201).json({ userinfo}); // Send the token back in the response
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(400).end();
        }
    });

    // Get user details for the authenticated user
    app.get('/v1/user/self', authenticate, async (req, res) => {
        try { 
            return res.status(200).json({ user: req.user });
        } catch (error) {
            console.error('Error fetching user:', error);
            return res.status(500).end();
        }
        
    });

    // Update user details for the authenticated user
    app.put('/v1/user/self', authenticate, async (req, res) => {
        try {
            const { username, password, firstname, lastname } = req.body;
            const user = req.user;
            if(password) user.password = password;
            if(firstname) user.firstname = firstname;
            if(lastname) user.lastname = lastname;
            if(username) return res.status(400).end();
            await user.save();        
            return res.status(204).end();
        } catch (error) {
            console.error('Error updating user:', error);
            return res.status(400).end();
        }
    });
};
