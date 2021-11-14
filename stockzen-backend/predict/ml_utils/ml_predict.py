import numpy as np
import torch
from predict.ml_utils import utils
config = {
    "data": {
        "window_size": 20,
        "train_split_size": 0.80,
    },
    "model": {
        "input_size": 1,  # since we are only using 1 feature, close price
        "num_lstm_layers": 2,
        "lstm_size": 32,
        "dropout": 0.2,
    },
    "training": {
        "device": "cpu",  # "cuda" or "cpu"
        "batch_size": 64,
        "num_epoch": 100,
        "learning_rate": 0.01,
        "scheduler_step_size": 60,
    },
}


def prediction(symbols):
    df = utils.fetch_time_series(symbols)
    data_close = np.array(df["Close"])
    # normalize
    scaler = utils.Normalizer()
    normalized_data_close_price = scaler.fit_transform(data_close)
    data_x, data_x_unseen = utils.prepare_data_x(
        normalized_data_close_price, window_size=config["data"]["window_size"]
    )

    new_model = torch.load(f"predict/models/{symbols}.pt")
    new_model.eval()
    x = (
        torch.tensor(data_x_unseen)
        .float()
        .to(config["training"]["device"])
        .unsqueeze(0)
        .unsqueeze(2)
    )  # this is the data type and shape required, [batch, sequence, feature]
    prediction = new_model(x)
    prediction = prediction.cpu().detach().numpy()

    next_closing_pred = scaler.inverse_transform(prediction)[0]
    print(next_closing_pred)
    if next_closing_pred > data_close[-1]:
        return 1
    else: 
        return 0

