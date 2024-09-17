import mysql.connector
from mysql.connector import Error

def clear_database(host, user, password, database, tables):
    try:
        # Connessione al database
        connection = mysql.connector.connect(
            host=localhost,
            user=root,
            password=sudohot,
            database=esa_db
        )
        
        if connection.is_connected():
            print("Connesso al database")

            cursor = connection.cursor()
            
            # Disabilita la verifica dei vincoli per eliminare i dati in caso di chiavi esterne
            cursor.execute("SET foreign_key_checks = 0;")
            
            # Elimina i dati dalle tabelle
            for table in tables:
                print(f"Cancellazione dei dati dalla tabella: {table}")
                cursor.execute(f"TRUNCATE TABLE {table};")
            
            # Riabilita la verifica dei vincoli
            cursor.execute("SET foreign_key_checks = 1;")
            
            print("Database pulito con successo")

    except Error as e:
        print(f"Errore: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("Connessione al database chiusa")

# Configurazione del database
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'sudohot',
    'database': 'ESA_db'
}

# Tabelle da pulire
tables_to_clear = ['utenti', 'obiettivi']

# Esecuzione della funzione di pulizia
clear_database(
    host=db_config['host'],
    user=db_config['user'],
    password=db_config['password'],
    database=db_config['database'],
    tables=tables_to_clear
)
