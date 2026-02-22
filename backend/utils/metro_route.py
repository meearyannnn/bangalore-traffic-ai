from data.bmrcl_metro import METRO_LINES, INTERCHANGES

def find_route(source: str, destination: str):
    # Same line case
    for line, stations in METRO_LINES.items():
        if source in stations and destination in stations:
            i, j = stations.index(source), stations.index(destination)
            path = stations[min(i,j):max(i,j)+1]
            if i > j:
                path.reverse()
            return {
                "lines": [line],
                "stations": path,
                "interchange": None
            }

    # Interchange case (Majestic)
    if source != destination:
        for inter in INTERCHANGES:
            for l1 in INTERCHANGES[inter]:
                for l2 in INTERCHANGES[inter]:
                    if l1 != l2:
                        if source in METRO_LINES[l1] and destination in METRO_LINES[l2]:
                            path1 = METRO_LINES[l1]
                            path2 = METRO_LINES[l2]

                            p1 = path1[path1.index(source):path1.index(inter)+1]
                            p2 = path2[path2.index(inter)+1:path2.index(destination)+1]

                            return {
                                "lines": [l1, l2],
                                "stations": p1 + p2,
                                "interchange": inter
                            }

    return None
