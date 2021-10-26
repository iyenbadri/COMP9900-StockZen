# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
import socket


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
