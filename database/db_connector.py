import MySQLdb
import os
from dotenv import load_dotenv, find_dotenv

# load env variables from the .env file in the project root
load_dotenv(find_dotenv())

# set the variables in our application with those env variables
host = os.environ.get("DBHOST")
user = os.environ.get("DBUSER")
passwd = os.environ.get("DBPW")
db = os.environ.get("DBNAME")

def connect_to_database(host = host, user = user, passwd = passwd, db = db):
    '''
    Connects to a database and returns a database objects
    '''
    db_connection = MySQLdb.connect(host,user,passwd,db)
    return db_connection

def execute_query(db_connection = None, query = None, query_params = ()):
    '''
    Executes a given SQL query on the given db connection and returns a Cursor object

    db_connection: DB connection info created by connect_to_database()
    query: SQL query as a string

    returns: DB return object of SQL query
    '''

    if db_connection is None:
        return None

    if query is None or len(query.strip()) == 0:
        return None

    # create a cursor to execute query
    cursor = db_connection.cursor(MySQLdb.cursors.DictCursor)  # will return DB info as list of dicts
    cursor.execute(query, query_params)
	
    # commit changes to the database
    db_connection.commit();
    return cursor
