from enum import Enum


class Status(Enum):
    FOUND = 0
    NOT_FOUND = 1
    INCORRECT_PASSWORD = 2
    SUCCESS = 3
    FAIL = 4


class LotType(Enum):
    BUY = 0
    SELL = 1
