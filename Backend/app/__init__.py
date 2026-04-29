import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Charger les variables d'environnement du fichier .env
load_dotenv()

# Initialisation des extensions (en dehors de create_app pour être accessible partout)
db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    # Nom de l'application mis à jour
    app = Flask("RB-Evaluation")
    
    # Configuration via le fichier .env
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # Autoriser le Frontend (CORS)
    CORS(app)

    # Initialisation des composants avec l'instance de l'app
    db.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        # Importation des modèles ici pour éviter les imports circulaires
        from . import models
        
        # Création automatique des tables dans PostgreSQL
        try:
            db.create_all()
            print("Base de données PostgreSQL connectée et tables vérifiées.")
        except Exception as e:
            print(f"Erreur lors de la connexion à la base de données : {e}")

    # Importation et configuration des routes
    from .routes import setup_routes
    setup_routes(app)

    return app