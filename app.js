import express from 'express';
import mysql from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url'; // Importa fileURLToPath
import session from 'express-session';

const app = express();
const port = 3000;

// Ottieni il percorso della directory corrente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configura Express per servire i file statici dalla directory 'public'
app.use(express.static(path.join(__dirname, 'public')));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'esapp'
});

// Collega al database
connection.connect(err => {
  if (err) {
    console.error('Errore di connessione al database:', err);
    return;
  }
  console.log('Connesso al database');
});

//// SEZIONE SICUREZZA //////

// Middleware
app.use(express.json());

// Configura le sessioni
app.use(session({
  secret: 'MrPaOlOtOp', // Chiave segreta per crittografare il cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Imposta a true se usi HTTPS, altrimenti false
    httpOnly: false, // Il cookie sarà accessibile solo dal server, non da JavaScript lato client
    maxAge: 1000 * 60 * 60 * 24 // Durata del cookie (es. 1 giorno)
  }
}));
// Middleware per verificare l'autenticazione
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
      return next();
  }
  res.status(401).json({ error: 'Non autenticato' });
  res.redirect('/login');
};

// Middleware per controllare il ruolo dell'utente (solo utenti normali)
function isUser(req, res, next) {
  if (req.session && req.session.userRole === 'user') {
      return next();
  } else {
      return res.status(403).json({ error: 'Accesso negato: solo gli utenti possono accedere a questa pagina.' });
  }
}

// Middleware per controllare il ruolo dell'utente (solo admin)
function isAdmin(req, res, next) {
  if (req.session && req.session.userRole === 'admin') {
      return next();
  } else {
      return res.status(403).json({ error: 'Accesso negato: solo gli amministratori possono accedere a questa pagina.' });
  }
}

///////// SEZIONE WEB ////////

// Rotta per la pagina di registrazione
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Rotta per aggiungere un nuovo utente
app.post('/api/users', (req, res) => {
    const { nome, email, password, ruolo } = req.body;
    const query = 'INSERT INTO utenti (nome, email, password, ruolo) VALUES (?, ?, ?, ?)';
    connection.query(query, [nome, email, password, ruolo], (err, results) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: 'Email già esistente' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId, nome, email, ruolo });
    });
});

// Rotta per la pagina della dashboard (solo per utenti normali)
app.get('/dashboard', isAuthenticated, isUser, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Rotta per la pagina di login
app.get('/login', (req, res) => {

  if (req.session.userId) {
    // Se l'utente è già loggato, reindirizza alla dashboard o admin
    if (req.session.userRole === 'admin') {
      return res.redirect('/admin');
    }
    return res.redirect('/dashboard');
  }
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Rotta per il login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT id, nome, ruolo FROM utenti WHERE email = ? AND password = ?';
  connection.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Email o password errati.' });

    // Imposta l'ID e il ruolo dell'utente nella sessione
    req.session.userId = results[0].id;
    req.session.userRole = results[0].ruolo;
    req.session.userName = results[0].nome;

    // Redirige in base al ruolo
    if (results[0].ruolo === 'admin') {
      return res.redirect('/admin');
    } else {
      return res.redirect('/dashboard');
    }
  });
});

// Rotta per la pagina admin (solo per admin)
app.get('/admin', isAuthenticated, isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin.html'));
});

// Rotta per ottenere tutti gli utenti (solo per admin)
app.get('/api/users', isAuthenticated, isAdmin, (req, res) => {
  const query = 'SELECT id, nome FROM utenti';
  connection.query(query, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
  });
});

// Rotta per il logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Errore durante il logout' });
    }
    res.status(200).json({ message: 'Logout avvenuto con successo' });
  });
});


///// SEZIONE OBBIETTIVI ///////

// Rotta per ottenere gli obiettivi di un utente
app.get('/api/users/:id/obiettivi', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM obiettivi WHERE user_id = ?';
  connection.query(query, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
  });
});

// Rotta per ottenere gli obiettivi dell'utente loggato
app.get('/api/users/me/obiettivi', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const query = 'SELECT * FROM obiettivi WHERE user_id = ';
  connection.query(query, [userId], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(results);
  });
});



// Rotta per inserire un nuovo obiettivo per un utente (solo per admin)
app.post('/api/users/:id/obiettivi', isAuthenticated, isAdmin, (req, res) => {
  const { id } = req.params;
  const { nome_obiettivo, descrizione } = req.body;
  const query = 'INSERT INTO obiettivi (user_id, nome_obiettivo, descrizione) VALUES (?, ?, ?)';
  connection.query(query, [id, nome_obiettivo, descrizione], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Obiettivo inserito con successo' });
  });
});

// Rotta per aggiornare lo stato di un obiettivo
app.put('/api/obiettivi/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { stato } = req.body;
  const query = 'UPDATE obiettivi SET stato = ? WHERE id = ?';
  connection.query(query, [stato, id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Obiettivo non trovato' });
    res.status(200).json({ id, stato });
  });
});

// Rotta per eliminare un obiettivo
app.delete('/api/obiettivi/:id', isAuthenticated, isAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM obiettivi WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Obiettivo non trovato' });
    res.status(204).end();
  });
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});

export default app;
