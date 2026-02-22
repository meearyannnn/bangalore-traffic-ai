import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os
from collections import Counter

# ----------------------------
# Load dataset
# ----------------------------
data_path = os.path.join("data", "smart_mode_training.csv")
df = pd.read_csv(data_path)

print("\n📊 Original Class Distribution:")
print(Counter(df["best_mode"]))

# ----------------------------
# Split features & target
# ----------------------------
X = df.drop("best_mode", axis=1)
y = df["best_mode"]

# ----------------------------
# Train/Test split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y   # IMPORTANT: preserve class ratio
)

# ----------------------------
# Compute Smart Class Weights
# ----------------------------
class_counts = Counter(y)

# Inverse frequency weighting
total = sum(class_counts.values())
class_weights = {
    cls: total / (len(class_counts) * count)
    for cls, count in class_counts.items()
}

print("\n⚖️ Computed Class Weights:")
print(class_weights)

# ----------------------------
# Create Balanced Model
# ----------------------------
model = RandomForestClassifier(
    n_estimators=400,
    max_depth=14,
    random_state=42,
    class_weight=class_weights,   # 🔥 KEY FIX
    min_samples_split=5,
    min_samples_leaf=3
)

# ----------------------------
# Train Model
# ----------------------------
model.fit(X_train, y_train)

# ----------------------------
# Evaluate
# ----------------------------
accuracy = model.score(X_test, y_test)

print("\n✅ Model Accuracy:", round(accuracy, 4))

print("\n📈 Classification Report:")
print(classification_report(y_test, model.predict(X_test)))

# ----------------------------
# Save Model
# ----------------------------
os.makedirs("models", exist_ok=True)
model_path = os.path.join("models", "smart_mode_model.pkl")

joblib.dump(model, model_path)

print("\n💾 Model saved at:", model_path)
