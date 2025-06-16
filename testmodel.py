import joblib
import re
import string
import pandas as pd

# Load vectorizer and all models
vectorizer = joblib.load('D:/ai image detect/models/vectorizer.pkl')
lr_model = joblib.load('D:/ai image detect/models/lr_model.pkl')
dtc_model = joblib.load('D:/ai image detect/models/dtc_model.pkl')
gclf_model = joblib.load('D:/ai image detect/models/gclf_model.pkl')
rclf_model = joblib.load('D:/ai image detect/models/rclf_model.pkl')

def wordopt(text):
    text = text.lower()
    text = re.sub('\[.*?\]','',text)
    text = re.sub('[()]','',text)
    text = re.sub('\\W',' ',text)
    text = re.sub('https?://\S+|www\.\S+', '', text)
    text = re.sub('<.*?>+', '', text)
    text = re.sub('[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub('\n', '', text)
    text = re.sub('\w*\d\w*', '', text)
    return text

def predict_news(news):
    # Preprocess
    df = pd.DataFrame({'text': [news]})
    df['text'] = df['text'].apply(wordopt)
    X = vectorizer.transform(df['text'])

    results = {}
    models = {
        "Logistic Regression": lr_model,
        "Decision Tree": dtc_model,
        "Gradient Boosting": gclf_model,
        "Random Forest": rclf_model
    }

    votes = {"Fake News": 0, "Real News": 0}

    for name, model in models.items():
        pred = model.predict(X)[0]
        proba = model.predict_proba(X)[0]
        fake_pct = round(proba[0] * 100, 2)
        real_pct = round(proba[1] * 100, 2)
        label = "Fake News" if pred == 0 else "Real News"
        votes[label] += 1
        results[name] = {
            "label": label,
            "Fake %": fake_pct,
            "Real %": real_pct
        }
    # Majority voting
    if votes["Fake News"] > votes["Real News"]:
        final_result = "FAKE NEWS"
    elif votes["Fake News"] < votes["Real News"]:
        final_result = "REAL NEWS"
    else:
        final_result = "INCONCLUSIVE"

    return results, final_result

# if __name__ == "__main__":
#     print("Enter news text (press Enter twice to finish):")
#     lines = []
#     while True:
#         line = input()
#         if line == "":
#             break
#         lines.append(line)
#     news = "\n".join(lines)
#     results, final_result = predict_news(news)
#     print("\nPrediction Results:")
#     for model, res in results.items():
#         print(f"{model}: {res['label']} (Fake: {res['Fake %']}%, Real: {res['Real %']}%)")
#     print(f"\nFinal verdict after analysing all models: {final_result}")