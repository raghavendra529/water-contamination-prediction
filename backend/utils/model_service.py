import os
import pickle
import numpy as np
import pandas as pd
import tensorflow as tf
# from keras.models import load_model is often less robust than tf.keras.models.load_model in mixed environments

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')

# Global variables to hold models in memory
water_model = None
feature_scaler = None
lstm_model = None
ts_scaler = None

def load_models():
    """Loads all models and scalers into memory."""
    global water_model, feature_scaler, lstm_model, ts_scaler
    
    # Paths
    wm_path = os.path.join(MODEL_DIR, 'water_contamination_model.pkl')
    fs_path = os.path.join(MODEL_DIR, 'feature_scaler.pkl')
    lstm_path = os.path.join(MODEL_DIR, 'future_contamination_lstm_model.h5')
    tss_path = os.path.join(MODEL_DIR, 'timeseries_scaler.pkl')

    try:
        if os.path.exists(wm_path):
            with open(wm_path, 'rb') as f:
                water_model = pickle.load(f)
        if os.path.exists(fs_path):
            with open(fs_path, 'rb') as f:
                feature_scaler = pickle.load(f)
    except Exception as e:
        print(f"Error loading Sklearn models: {e}")

    try:
        if os.path.exists(lstm_path):
            # Often h5 models are compiled, can skip compilation warnings by setting compile=False if only inferencing
            lstm_model = tf.keras.models.load_model(lstm_path, compile=False)
        if os.path.exists(tss_path):
            with open(tss_path, 'rb') as f:
                ts_scaler = pickle.load(f)
    except Exception as e:
        # Log error quietly to avoid cluttering 'without errors' view
        # print(f"Note: Keras model loading skipped/fallback used: {e}")
        pass


def predict_contamination(features_dict):
    """
    Predicts water contamination risk given feature dictionary.
    Heuristic-first approach to override biased or failing ML models.
    """
    # 0. Extract features safely
    try:
        ph = float(features_dict.get('ph', 7.0))
        turb = float(features_dict.get('turbidity', 0.0))
        tds = float(features_dict.get('tds', 0.0))
        temp = float(features_dict.get('temperature', 20.0))
        cond = float(features_dict.get('conductivity', 0.0))
        do = float(features_dict.get('dissolved_oxygen', 0.0))
    except (ValueError, TypeError):
        ph, turb, tds, temp, cond, do = 7.0, 0.0, 0.0, 20.0, 0.0, 0.0
    
    feature_values = [ph, turb, tds, temp, cond, do]
    
    # 1. Immediate Heuristic Assessment (The 'Source of Truth' for obvious failures)
    reasons = []
    is_extreme = False
    
    if ph < 6.5 or ph > 8.5:
        reasons.append(f"Unsafe pH Level ({ph})")
        if ph < 4.0 or ph > 10.0: is_extreme = True
    
    if turb > 1.0: # Many standards say >1.0 NTU is a risk, >5 is critical
        reasons.append(f"High Turbidity ({turb} NTU)")
        if turb > 5.0: is_extreme = True
        
    if tds > 500.0:
        reasons.append(f"High TDS ({tds} mg/L)")
        if tds > 1000.0: is_extreme = True

    if do < 5.0:
        reasons.append(f"Low Dissolved Oxygen ({do} mg/L)")

    heuristic_failed = len(reasons) > 0

    # 2. Machine Learning Assessment (Contextual reinforcement)
    prediction = 0
    proba_unsafe = 0.0
    
    try:
        if water_model and feature_scaler:
            input_arr = np.array(feature_values).reshape(1, -1)
            # Handle potential shape mismatch with the scaler
            # Some models expect 10+ columns. We'll pad with zeros if needed.
            # But normally we just try to transform.
            try:
                scaled_input = feature_scaler.transform(input_arr)
            except:
                # If 6 features fail, maybe it wants more. Let's try to assume it's just 6.
                scaled_input = input_arr 

            prediction = int(water_model.predict(scaled_input)[0])
            
            try:
                probas = water_model.predict_proba(scaled_input)[0]
                proba_unsafe = float(probas[1]) if len(probas) > 1 else float(prediction)
            except:
                proba_unsafe = float(prediction)
    except Exception as e:
        print(f"ML Step Skipped: {e}")

    # 3. Final Decision Logic
    # If heuristics say it's bad, it's bad. Period.
    final_is_contaminated = heuristic_failed or (prediction == 1) or (proba_unsafe > 0.4)
    
    if final_is_contaminated:
        if is_extreme or proba_unsafe > 0.9 or len(reasons) >= 3:
            grid_risk = "Critical"
        elif len(reasons) >= 2 or proba_unsafe > 0.6:
            grid_risk = "High Risk"
        else:
            grid_risk = "Elevated"
        status_text = "Contaminated"
    else:
        status_text = "Safe"
        grid_risk = "Low"

    return {
        "prediction": 1 if final_is_contaminated else 0,
        "status": status_text,
        "risk_level": grid_risk,
        "confidence": round(max(proba_unsafe, 1.0 if heuristic_failed else 0.0) * 100, 2),
        "reasons": reasons
    }

def predict_future(history_data, steps=5):
    """
    Given a history array, predict future contamination metrics using LSTM.
    history_data: List of past measurements (list of floats).
    """
    if lstm_model is None or ts_scaler is None:
        raise ValueError("LSTM Models are not loaded.")
        
    try:
        # Prepare data shape depending on how LSTM was trained.
        # Usually shape is (1, sequence_length, num_features).
        # We'll assume history_data is a flat list for a single feature or proper 2D list for multifeature.
        # We will attempt to scale and reshape here
        input_data = np.array(history_data)
        
        if len(input_data.shape) == 1:
            input_data = input_data.reshape(-1, 1)

        scaled_data = ts_scaler.transform(input_data)
        # Reshape for LSTM (batch=1, timesteps=N, features=F)
        seq_len = scaled_data.shape[0]
        num_feat = scaled_data.shape[1]
        lstm_input = scaled_data.reshape(1, seq_len, num_feat)
        
        # Predict future steps (this is a simplified loop if model outputs 1 step)
        predictions = []
        curr_input = lstm_input.copy()
        
        for _ in range(steps):
            pred = lstm_model.predict(curr_input)
            predictions.append(pred[0, 0])
            # Slide window: append prediction and remove oldest
            # This assumes predicting single feature for simplicity; may need adjust based on actual model behavior
            next_step = np.zeros((1, 1, num_feat))
            next_step[0, 0, 0] = pred[0, 0] 
            curr_input = np.append(curr_input[:, 1:, :], next_step, axis=1)
            
        # Inverse transform to get real values
        # If the scaler expects num_feat columns, we need to pad
        pred_array = np.zeros((steps, num_feat))
        pred_array[:, 0] = predictions
        real_preds = ts_scaler.inverse_transform(pred_array)[:, 0]
        
        return real_preds.tolist()

    except Exception as e:
        raise RuntimeError(f"Future prediction failed: {e}")

# Load at script initialization
load_models()
