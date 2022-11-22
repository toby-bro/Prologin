from typing import List
# aller voir cython pour chercher un optimiseur de python à C
def parcours(cin, redir):
    cinvis = []
    while cin not in cinvis:
        cinvis.append(cin)
        cin = redir[cin-1]
    return len(cinvis)

def trajets_retour(n: int, redirection: List[int]) -> None:
    """
    :param n: le nombre de cinémas
    :param redirection: le lieu de redirection de chaque cinéma
    """
    # TODO Afficher, sur une ligne et séparé par une espace, le nombre de
    # redirections nécessaires en partant de chaque cinéma avant de retomber à
    # nouveau sur un cinéma déjà visité.
    listecherchee = [parcours(i, redirection) for i in range(1,n+1)]
    sortie = ''
    for i in listecherchee:
        sortie += str(i) + ' '
    print(sortie[:-1])
    
if __name__ == "__main__":
    n = int(input())
    redirection = list(map(int, input().split()))
    trajets_retour(n, redirection)