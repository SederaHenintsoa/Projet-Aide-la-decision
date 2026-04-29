# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Probabilités extraites de Santé Publique France 2021 [cite: 7, 226]
PROBS = {
    'infection_prior': {
        '00': 0.02, # Ni contact, ni zone cluster [cite: 85, 228]
        '01': 0.15, # Zone cluster seule [cite: 85, 228]
        '10': 0.40, # Contact seul [cite: 85, 228]
        '11': 0.70  # Double exposition [cite: 85, 228]
    },
    'symptoms': {
        'fever':   {'oui': 0.85, 'non': 0.03}, # [cite: 170, 177]
        'anosmia': {'oui': 0.65, 'non': 0.01}, # [cite: 170, 186]
        'cough':   {'oui': 0.70, 'non': 0.10}  # [cite: 170, 194]
    },
    'severe': {
        '11': 0.25, # Infecté ET Comorbidité [cite: 199, 225]
        '10': 0.05, # Infecté sans Comorbidité [cite: 199, 219]
        '01': 0.005,# Non infecté mais Comorbidité [cite: 199, 212]
        '00': 0.001 # Risque minimal [cite: 199, 204]
    }
}
# Simulation d'une base de données de diagnostics pour le tableau admin
stats_historiques = [
    {"id": 1, "date": "2026-04-20", "risque_inf": 85.4, "forme_grave": 25.0, "statut": "Alerte"},
    {"id": 2, "date": "2026-04-21", "risque_inf": 12.1, "forme_grave": 0.5, "statut": "Sain"},
]

@app.route('/api/admin/stats', methods=['GET'])
def get_stats():
    return jsonify(stats_historiques)

@app.route('/api/admin/config', methods=['POST'])
def update_config():
    # Permet au médecin de modifier le taux d'incidence national (P_IC_prior)
    new_config = request.json
    # Logique pour mettre à jour les constantes PROBS...
    return jsonify({"status": "success"})

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    
    # 1. Risque initial basé sur l'exposition [cite: 82, 83]
    key_exp = f"{int(data['contact'])}{int(data['cluster'])}"
    p_infected = PROBS['infection_prior'][key_exp]

    # 2. Inférence Bayésienne pour les symptômes [cite: 168, 174]
    symptoms_input = [
        ('fever', data['fever']),
        ('anosmia', data['anosmia']),
        ('cough', data['cough'])
    ]

    for name, is_present in symptoms_input:
        # P(S|IC=Oui) et P(S|IC=Non) [cite: 168, 170]
        p_s_pos = PROBS['symptoms'][name]['oui'] if is_present else (1 - PROBS['symptoms'][name]['oui'])
        p_s_neg = PROBS['symptoms'][name]['non'] if is_present else (1 - PROBS['symptoms'][name]['non'])
        
        # Mise à jour de la probabilité d'infection (Théorème de Bayes)
        numerator = p_s_pos * p_infected
        denominator = numerator + (p_s_neg * (1 - p_infected))
        p_infected = numerator / denominator

    # 3. Risque de Forme Grave [cite: 195, 196]
    # On considère le patient infecté pour le calcul de gravité si p_infected > 50%
    is_positive = 1 if p_infected > 0.5 else 0
    key_sev = f"{is_positive}{int(data['comorbidity'])}"
    p_severe = PROBS['severe'][key_sev]

    return jsonify({
        "infection_probability": round(p_infected * 100, 2),
        "severe_risk": round(p_severe * 100, 2)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)