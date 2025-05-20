import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pandas as pd
from services.analysis import preprocess_excel, create_performance_labels
from app.services.train import train_model   

def main():
    raw_df = pd.read_excel('app/data/marks.xlsx')
    pivot_df = preprocess_excel(raw_df)
    labeled_df = create_performance_labels(pivot_df)

    # Save training data
    labeled_df.to_csv('app/data/train.csv', index=False)
    print("Training data saved to app/data/train.csv")

    # Train model
    train_model()
if __name__ == '__main__':
    main()
