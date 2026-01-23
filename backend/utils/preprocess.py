import pandas as pd

def preprocess_input(data: dict):
    """
    Converts incoming JSON into model-ready DataFrame
    """
    df = pd.DataFrame([data])

    df['hour'] = int(df['hour'])
    df['weekday'] = int(df['weekday'])
    df['Traffic Volume'] = float(df['Traffic Volume'])
    df['Average Speed'] = float(df['Average Speed'])

    return df[['hour', 'weekday', 'Traffic Volume', 'Average Speed']]
