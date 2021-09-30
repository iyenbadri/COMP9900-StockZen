from enum import Enum


class AuthStatus(Enum):
    LOGIN_SUCCESS = 0
    USER_FOUND = 1
    USER_NOT_FOUND = 2
    INCORRECT_PASSWORD = 3
    USER_ADDED = 4
    USER_NOT_ADDED = 5
