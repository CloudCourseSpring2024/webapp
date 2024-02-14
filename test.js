import axios from 'axios';
import { exec } from 'child_process';
axios.defaults.timeout = 5000;

// the server before running the tests
let serverProcess;

before((done) => {
    serverProcess = exec('node server.js');
    // Handle server startup errors
    serverProcess.on('error', (err) => {
        console.error('Error starting server:', err);
        done(err);
    });

    // Wait for the server to start
    serverProcess.stdout.on('data', (data) => {
        if (data.includes('Server is running')) {
            console.log('Server started');
            setTimeout(() => {
                done();
            }, 5000);
        }
    });
});

async function makePostRequest(url, data) {
    try {
        const response = await axios.post(url, data);
        if (!response.status === 200) {
            throw new Error('issue with post');
        }
        return response;
    } catch (error) {
        console.error('Error:', error.message);
        throw error; // Rethrow the error for handling at a higher level
    }
}
async function makeGetRequest(url, username, password) {

    // Create basic auth header
    const authHeader = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

    try {
        return await axios.get(url, {
            headers: {
                Authorization: authHeader
            }
        });

    } catch (error) {
        throw error;
    }

}
async function makePutRequest(url, username, password, data) {
    // Create auth header
    const authHeader = 'Basic ' + Buffer.from(username + ':' + password).toString('base64');
    try {
        return await axios.put(url, data, {
            headers: {
                Authorization: authHeader
            }
        });
    } catch (error) {
        throw error;
    }
}

// Define test cases
describe('User APIs', () => {

    it('get user details', async () => {
        const userData = {
            username: Math.random().toString(36).substring(7)+'@gmail.com',
            password: '1234567',
            firstname: 'Hasini',
            lastname: 'Muvva'
        };
        await makePostRequest('http://127.0.0.1:3000/v1/user', userData);

        const res = await makeGetRequest('http://127.0.0.1:3000/v1/user/self', userData.username, userData.password);
        console.assert(res.status,200);
        console.assert(res.data.userinfo.username,userData.username);
        console.assert(res.data.userinfo.firstname,userData.firstname);
        console.assert(res.data.userinfo.lastname,userData.lastname);
    });

    it('updates user details', async () => {

        // Create new user
        const userData = {
            username: Math.random().toString(36).substring(7)+'@gmail.com',
            password: '123456',
            firstname: 'Test',
            lastname: 'User'
        };

        await makePostRequest('http://127.0.0.1:3000/v1/user', userData);

        // Update details
        const updatedData = {
            firstname: 'Updated',
            lastname: 'Updated',
            password: 'abcd',
        };

        const re = await makePutRequest('http://127.0.0.1:3000/v1/user/self', userData.username, userData.password, updatedData);

        // Assert update status
        console.assert(re.status, 204);

        // Fetch user
        const res = await makeGetRequest('http://127.0.0.1:3000/v1/user/self', userData.username, updatedData.password);

        // Assert updated details
        console.assert(res.data.userinfo.firstname,updatedData.firstname);
        console.assert(res.data.userinfo.lastname,updatedData.lastname);
    });
});

// Stop the server after running the tests
after((done) => {
    serverProcess.kill('SIGINT'); // Send SIGINT signal to gracefully stop the server
    console.log('Server stopping...');
    
    // Wait for the server to stop
    serverProcess.on('exit', (code, signal) => {
        console.log(`Server stopped with code ${code} and signal ${signal}`);
        done();
    });
});