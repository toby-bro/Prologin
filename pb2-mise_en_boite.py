
from traceback import print_tb
from typing import List


def mise_en_boite(n: int, restes: List[int], boites: List[int]) -> None:
    """
    :param n: Le nombre de boîtes et de restes
    :param restes: Liste des volumes des restes
    :param boites: Liste des volumes des boîtes
    """
    # TODO Afficher sur une ligne le nombre maximum de restes que l'on peut
    # mettre en boîte.
    
    # On va remplir en prenant les plus petits restes en premiers... 
    # pour rentrer le plus grand nombre d'aliments dans des boites
    # est ce qu'on trie la liste ? non ! trop complexe
    
    grosse_boite = max(boites)
    restes_poss = []
    for i in restes:
        if i<=grosse_boite:
            restes_poss.append(i)
    # print(restes_poss)
    restes = restes_poss[:]
    restes_poss.clear()
    # print(restes)
    if len(restes)==0:
        print(0)
    else:
        ireste = 0
        iboite = 0
        restes.sort()
        boites.sort()
        # print(restes, boites)
        while ireste < len(restes) and iboite<len(boites):
            if restes[ireste]<=boites[iboite]:
                ireste += 1
                iboite += 1
            else:
                iboite += 1
        print(ireste)
        


if __name__ == "__main__":
    n = int(input())
    restes = list(map(int, input().split()))
    boites = list(map(int, input().split()))
    mise_en_boite(n, restes, boites)
