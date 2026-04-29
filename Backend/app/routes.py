from flask import request, jsonify
from flask_jwt_extended import create_access_token
from .models import User, Analysis, db
from .engine import BayesianNetwork

def setup_routes(app):
    
    @app.route('/api/register', methods=['POST'])
    def register():
        data = request.get_json()
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({"error": "Utilisateur existe déjà"}), 400
        try:
            new_user = User(username=data['username'], role=data.get('role', 'PATIENT'))
            new_user.set_password(data['password'])
            db.session.add(new_user)
            db.session.commit()
            return jsonify({"msg": "Succès"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data.get('username')).first()
        if user and user.check_password(data.get('password')):
            token = create_access_token(identity={'id': user.id, 'role': user.role})
            return jsonify({"token": token, "user": {"username": user.username, "role": user.role, "id": user.id}}), 200
        return jsonify({"msg": "Erreur"}), 401

   # app/routes.py -> Modifiez la route evaluate

    @app.route('/api/evaluate', methods=['POST'])
    def evaluate():
        try:
            data = request.get_json()
            user_id = data.get('user_id')
            symptoms = data.get('data', {})
            
            prob_value = BayesianNetwork.calculate(symptoms)
            percentage = round(float(prob_value) * 100, 2)

            # LOGIQUE D'AIDE À LA DÉCISION
            suggestion = ""
            if percentage < 20:
                suggestion = "Risque faible. Restez vigilant et respectez les gestes barrières."
            elif percentage < 60:
                suggestion = "Risque modéré. Il est conseillé de s'isoler et de surveiller l'évolution des symptômes."
            else:
                suggestion = "Risque élevé. Contactez un professionnel de santé et effectuez un test PCR rapidement."

            if user_id:
                new_ana = Analysis(probability=percentage, symptoms=symptoms, user_id=user_id)
                db.session.add(new_ana)
                db.session.commit()

            return jsonify({
                "probability": percentage,
                "suggestion": suggestion
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/api/admin/patients', methods=['GET'])
    def get_patients():
        try:
            patients = User.query.filter_by(role='PATIENT').all()
            results = []
            for p in patients:
                # On prend la dernière analyse
                last = Analysis.query.filter_by(user_id=p.id).order_by(Analysis.created_at.desc()).first()
                results.append({
                    "id": p.id,
                    "name": p.username,
                    "last_result": last.probability if last else None,
                    "last_symptoms": last.symptoms if last else None,
                    "date": last.created_at.strftime("%d/%m/%Y à %H:%M") if last else "Jamais"
                })
            return jsonify(results), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/api/history/<int:user_id>', methods=['GET'])
    def get_user_history(user_id):
        try:
            # Récupérer toutes les analyses de l'utilisateur, de la plus récente à la plus ancienne
            history = Analysis.query.filter_by(user_id=user_id).order_by(Analysis.created_at.desc()).all()
            
            results = []
            for ana in history:
                results.append({
                    "id": ana.id,
                    "probability": ana.probability,
                    "date": ana.created_at.isoformat(), 
                    "fever": ana.symptoms.get('fievre', 'Non'),
                    "toux": ana.symptoms.get('toux', 'Aucune'),
                    "anosmia": ana.symptoms.get('anosmie', 'Non'),
                    "contact": ana.symptoms.get('contact', 0),
                    "cluster": ana.symptoms.get('cluster', 0)
                })
            
            return jsonify(results), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500