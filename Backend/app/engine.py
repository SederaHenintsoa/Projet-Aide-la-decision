# app/engine.py

PROBS = {
    'infection_prior': {
        '00': 0.02, '01': 0.15, '10': 0.40, '11': 0.70
    },
    'symptoms': {
        'fever':   {'oui': 0.85, 'non': 0.03},
        'anosmia': {'oui': 0.65, 'non': 0.01},
        'cough':   {'oui': 0.70, 'non': 0.10}
    }
}

class BayesianNetwork:
    @staticmethod
    def calculate(data):
        """
        Calcule la probabilité d'infection basée sur les symptômes.
        """
        # 1. Gestion des données d'exposition (par défaut à 0 si absent)
        contact = int(data.get('contact', 0))
        cluster = int(data.get('cluster', 0))
        key_exp = f"{contact}{cluster}"
        
        p_infected = PROBS['infection_prior'].get(key_exp, 0.02)

        # 2. Mapping des symptômes reçus du Front 
        mapping = {
            'fievre': 'fever',
            'toux': 'cough',
            'anosmie': 'anosmia'
        }

        # 3. Inférence Bayésienne
        for front_key, engine_key in mapping.items():
            val = data.get(front_key, 'Non')
            is_present = (val == 'Oui' or val == 'Sèche' or val == 'Grasse')
            
            p_s_pos = PROBS['symptoms'][engine_key]['oui']
            p_s_neg = PROBS['symptoms'][engine_key]['non']

            if is_present:
                # P(I|S) = (P(S|I) * P(I)) / P(S)
                numerator = p_s_pos * p_infected
                denominator = (p_s_pos * p_infected) + (p_s_neg * (1 - p_infected))
            else:
                # P(I|non S)
                numerator = (1 - p_s_pos) * p_infected
                denominator = ((1 - p_s_pos) * p_infected) + ((1 - p_s_neg) * (1 - p_infected))
            
            p_infected = numerator / denominator

        return p_infected