import numpy as np
import torch.nn as nn
from torch.utils.data import Dataset
from datetime import datetime
from pandas.core.frame import DataFrame
import os
import inspect
import yfinance as yf

def debug_exception(error, suppress=False):
    if os.environ.get("FLASK_ENV") == "development":
        print(
            f"{type(error).__name__} at line {error.__traceback__.tb_lineno} of {inspect.stack()[1].filename }: {error}"
        )
    if not suppress:
        raise error



def fetch_time_series(
    sym: str,
    period: str = "max",
    interval: str = "1d",
    actions: bool = False,
    start: datetime = None,
    end: datetime = None,
) -> DataFrame:
    """Fetch Time Series for symbol asked"""
    try:
        stock = yf.Ticker(sym)
        return stock.history(
            period=period, interval=interval, start=start, end=end, actions=actions
        )
    except Exception as e:
        debug_exception(e, suppress=True)


def prepare_data_x(x, window_size):

    # perform windowing
    n_row = x.shape[0] - window_size + 1
    output = np.lib.stride_tricks.as_strided(
        x, shape=(n_row, window_size), strides=(x.strides[0], x.strides[0])
    )
    return output[:-1], output[-1]


def prepare_data_y(x, window_size):

    # use the next day as label
    output = x[window_size:]
    return output

class Normalizer:
    def __init__(self):
        self.mu = None
        self.sd = None

    def fit_transform(self, x):
        self.mu = np.mean(x, axis=(0), keepdims=True)
        self.sd = np.std(x, axis=(0), keepdims=True)
        normalized_x = (x - self.mu) / self.sd
        return normalized_x

    def inverse_transform(self, x):
        return (x * self.sd) + self.mu

class TimeSeriesDataset(Dataset):
    def __init__(self, x, y):
        x = np.expand_dims(
            x, 2
        )  # in our case, we have only 1 feature, so we need to convert `x` into [batch, sequence, features] for LSTM
        self.x = x.astype(np.float32)
        self.y = y.astype(np.float32)

    def __len__(self):
        return len(self.x)

    def __getitem__(self, idx):
        return (self.x[idx], self.y[idx])


class LSTMModel(nn.Module):
    def __init__(
        self, input_size=1, hidden_layer_size=32, num_layers=2, output_size=1, dropout=0.2
    ):
        super().__init__()
        self.hidden_layer_size = hidden_layer_size

        self.linear_1 = nn.Linear(input_size, hidden_layer_size)
        self.relu = nn.ReLU()
        self.lstm = nn.LSTM(
            hidden_layer_size,
            hidden_size=self.hidden_layer_size,
            num_layers=num_layers,
            batch_first=True,
        )
        self.dropout = nn.Dropout(dropout)
        self.linear_2 = nn.Linear(num_layers * hidden_layer_size, output_size)

        self.init_weights()

    def init_weights(self):
        for name, param in self.lstm.named_parameters():
            if "bias" in name:
                nn.init.constant_(param, 0.0)
            elif "weight_ih" in name:
                nn.init.kaiming_normal_(param)
            elif "weight_hh" in name:
                nn.init.orthogonal_(param)

    def forward(self, x):
        batchsize = x.shape[0]

        # layer 1
        x = self.linear_1(x)
        x = self.relu(x)

        # LSTM layer
        lstm_out, (h_n, c_n) = self.lstm(x)

        # reshape output from hidden cell into [batch, features] for `linear_2`
        x = h_n.permute(1, 0, 2).reshape(batchsize, -1)

        # layer 2
        x = self.dropout(x)
        predictions = self.linear_2(x)
        return predictions[:, -1]


def accuracy_score(y_true, y_pred):
    # Compute accuracy
    return (y_true == y_pred).sum()