from app import create_app

app = create_app()

if __name__ == '__main__':
    print("Serveur de la Plateforme d'Orientation démarré sur http://localhost:5000")
    app.run(debug=True, port=5000)