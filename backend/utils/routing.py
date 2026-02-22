import networkx as nx
import osmnx as ox

def get_route(G, source, destination):
    source_node = ox.distance.nearest_nodes(
        G, source[1], source[0]
    )
    dest_node = ox.distance.nearest_nodes(
        G, destination[1], destination[0]
    )

    route = nx.shortest_path(
        G,
        source_node,
        dest_node,
        weight="weight"
    )

    return route
