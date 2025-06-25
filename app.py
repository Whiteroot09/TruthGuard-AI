import os
import warnings
from flask import Flask, request, jsonify, render_template
from tensorflow.keras.preprocessing import image
import numpy as np
import joblib

from testmodel import predict_news

# Suppress TensorFlow and Python warnings and logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_CPP_MIN_VLOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['ABSL_LOG_LEVEL'] = '4'
warnings.filterwarnings('ignore')

UPLOAD_FOLDER = 'D:/ai image detect/uploaded'
ALLOWED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.bmp')

# Load models
model_paths = [
    'D:/ai image detect/models/xception_deepfake_image.pkl',
    'D:/ai image detect/models/fake_image_model_pkl.pkl'
]
models = [joblib.load(path) for path in model_paths]

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return filename.lower().endswith(ALLOWED_EXTENSIONS)

def voting_predict(models, img_array):
    probs_fake = []
    probs_real = []
    for model in models:    
        pred = model.predict(img_array)
        prob_fake = float(pred[0][0]) * 100
        prob_real = 100 - prob_fake
        probs_fake.append(prob_fake)
        probs_real.append(prob_real)
    avg_prob_fake = np.mean(probs_fake)
    avg_prob_real = np.mean(probs_real)
    if avg_prob_real > 50:
        final_label = 'real'
    elif avg_prob_fake > 50:
        final_label = 'fake'
    else:
        final_label = 'real' if avg_prob_real >= avg_prob_fake else 'fake'
    return final_label, avg_prob_fake, avg_prob_real

@app.route('/')
def index():
    return render_template('Index.html')

# News prediction route test 

@app.route('/post-data', methods=['POST'])
def post_data():
    data = request.json
    message = data.get('message', '') if data else ''
    lines = []
    lines.append(message)
    news = "\n".join(lines)
    results, final_result = predict_news(news)
    print("\nPrediction Results:")
    for model, res in results.items():
        print(f"{model}: {res['label']} (Fake: {res['Fake %']}%, Real: {res['Real %']}%)")
    print(f"\nFinal verdict after analysing all models: {final_result}")
    return jsonify({
        'status': 'success',
        'algorithms': results,
        'final_result': final_result
    })

# analyze image route
@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    save_name = f"uploaded_image{ext}"
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], save_name)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    if os.path.exists(save_path):
        os.remove(save_path)
    file.save(save_path)

    # Predict
    img = image.load_img(save_path, target_size=(128, 128))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0
    label, fake_prob, real_prob = voting_predict(models, img_array)
    return jsonify({
        'prediction': label,
        'fake_prob': round(fake_prob, 2),
        'real_prob': round(real_prob, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)