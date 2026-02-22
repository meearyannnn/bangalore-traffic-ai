import osmnx as ox
import networkx as nx

def load_road_graph():
    G = ox.graph_from_place(
        "Bangalore, India",
        network_type="drive",
        simplify=True
    )
    return G
