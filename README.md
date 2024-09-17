# ESApp (Alpha)

**Stato attuale**: Fase Alpha

## Funzionalità attuali:
- **Registrazione utenti**: Gli utenti possono registrarsi con nome, email e password.
- **Gestione obiettivi**: L'amministratore può assegnare obiettivi agli utenti e monitorarne il completamento.

## Da migliorare:
- **Impaginazione**: Ottimizzare la struttura e l'aspetto delle pagine.
- **Funzionalità utente**: Gli utenti non riescono a visualizzare e marcare gli obiettivi come completati.
- **Sicurezza**: Migliorare la protezione delle informazioni.
- **Design**: Implementare uno stile più accattivante e user-friendly.

## Installazione
1. **Prerequisiti**:
   - **Windows**: Installa [XAMPP](https://www.apachefriends.org/index.html)
   - **Linux**: Installa Apache, MariaDB e phpMyAdmin `sudo apt install apache2 mysql-server phpmyadmin`
   - **Node.js**: Assicurati di avere [Node.js](https://nodejs.org/) installato `sudo apt install nodejs npm`

2. **Configurazione del database**:
   - Crea il database `esapp` e le seguenti tabelle:
     ```sql
     CREATE DATABASE esapp;
     USE esapp;

     CREATE TABLE utenti (
         id INT AUTO_INCREMENT PRIMARY KEY,
         nome VARCHAR(50),
         email VARCHAR(100) UNIQUE,
         password VARCHAR(255),
         ruolo ENUM('user', 'admin') DEFAULT 'user'
     );

     CREATE TABLE obiettivi (
         id INT AUTO_INCREMENT PRIMARY KEY,
         user_id INT,
         nome_obiettivo VARCHAR(100),
         descrizione TEXT,
         stato ENUM('non completato', 'completato') DEFAULT 'non completato',
         data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
         data_completamento TIMESTAMP NULL,
         FOREIGN KEY (user_id) REFERENCES utenti(id) ON DELETE CASCADE
     );
     ```

3. **Esecuzione dell'app**:
   - Posizionati nella cartella principale dell'app tramite il terminale.
   - Esegui il comando:
     ```
     node app.js
     ```
   - Accedi all'app da un browser visitando `http://localhost:3000`
