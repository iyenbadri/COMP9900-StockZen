# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
import socket
from datetime import datetime

from app import db
from app.models.schema import StockPage


# network blocker for no-connection tests
class block_network(socket.socket):
    def __init__(self, *args, **kwargs):
        raise Exception("Network call blocked")


initial_socket = socket.socket


def ordering(*id_order_tuples):
    order_list = []
    for id, order in id_order_tuples:
        order_list.append({"id": id, "order": order})
    return order_list


def net_blocker(block=True):
    if block:
        socket.socket = block_network
    else:
        socket.socket = initial_socket


# Add mock top performing stocks to db
def populate_top_stocks():
    changes = [1, 2, 3, 4, 5, 6]
    expected_res = []  # need to return expected response
    for i in range(len(changes)):
        stock_page = StockPage(
            code=i,
            stock_name=f"test_{i}",
            price=i * 1000.0,
            perc_change=changes[i],
            last_updated=datetime.now(),
        )
        db.session.add(stock_page)
        db.session.commit()
        expected_res.append(
            {
                "stockPageId": stock_page.id,
                "symbol": str(i),
                "price": float(i * 1000),
                "change": float(changes[i]),
            }
        )

    # sort high to low
    expected_res = sorted(expected_res, key=lambda dict: dict["change"], reverse=True)
    expected_res.pop()  # remove extra stock
    return expected_res
