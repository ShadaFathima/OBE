import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# 1. Load dataset
data = pd.read_csv('./app/data/mock_student_data.csv')
# 2. Select features and target
features = ['CO1', 'CO2', 'CO3', 'CO4', 'CO5', 'CO6', 'CO_Avg']
X = data[features]

# 3. Encode target variable
le = LabelEncoder()
y = le.fit_transform(data['Category'])

# 4. Split into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 5. Train a classifier
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 6. Predict and evaluate
y_pred = clf.predict(X_test)
print("Accuracy:", accuracy_score(y_test, y_pred))
print("Classification Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))

# Optional: Save the model and label encoder for later use
import joblib
joblib.dump(clf, './app/models/student_performance_model.pkl')
joblib.dump(le, './app/models/label_encoder.pkl')