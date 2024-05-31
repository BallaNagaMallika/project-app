const express = require('express');
const session = require('express-session');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const credentials = require('./Key.json');

admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
const db = admin.firestore();
const PORT = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login',(req,res)=>{
    res.render('login');
});
app.post('/login', async(req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    
    try {
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty){
            return res.status(400).send('User not found');
        }
        const user = userSnapshot.docs[0].data();
        const match = await bcrypt.compare(password, user.password);
        if(match){
            res.redirect('/dashboard');
        } else {
            res.status(500).send('Invalid password or user');
        }
    }
    catch(error){
        res.status(500).send('Error occurred in login:', error);
        
    }
});
app.get('/signup',(req,res)=>{
    res.render('signup');
});
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const Existing = await db.collection('users').where('email', '==', email).get();
        if (!Existing.empty){
            return res.status(400).send('User already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const userdoc = await db.collection('users').add({
            email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch(error){
        res.status(500).send('Error occurred:',error);
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user, novels: [] });
  });

  
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


