from typing import List

def parcours(cin, redir, listecherchee):
    cinvis = []
    while cin not in cinvis:
        cinvis.append(cin)
        cin = redir[cin-1]
    return len(cinvis), cinvis

def trajets_retour(n: int, redirection: List[int]) -> None:
    """
    :param n: le nombre de cinémas
    :param redirection: le lieu de redirection de chaque cinéma
    """
    # TODO Afficher, sur une ligne et séparé par une espace, le nombre de
    # redirections nécessaires en partant de chaque cinéma avant de retomber à
    # nouveau sur un cinéma déjà visité.
    # listecherchee = [parcours(i, redirection) for i in range(1,n+1)]
    listecherchee = [0 for _ in range(n)]
    cin = 1
    while cin < n+1:
        if listecherchee[cin-1] == 0:
            # print("on entre", cin, listecherchee)
            # nb_redir, trajet = parcours(i, redirection)
            trajet = []
            cin_visite = cin
            while cin_visite not in trajet and listecherchee[cin_visite-1]==0:
                trajet.append(cin_visite)
                cin_visite = redirection[cin_visite-1]
            if listecherchee[cin_visite-1] != 0:
                nb_redir = len(trajet) + listecherchee[cin_visite-1]
                compteur = 0
                for i in trajet:
                    listecherchee[i-1] = nb_redir - compteur
                    compteur += 1
            
            else:
                nb_redir = len(trajet)
                trajet.append(cin_visite)
                # print("trajet ", trajet)
                # listecherchee.append(nb_redir)
                # listecherchee[i] = nb_redir
                
                # trajet[-1] est le cinema sur lequel on a boucle, on va donc traiter 
                # tous les cinemas internes à cette boucle et les mettre à part, car
                # dès qu'on tombe sur un tel cinema alors on sait forcement combien il
                # reste d'iterations à faire.
                
                # la boucle commence quand apparait trajet[-1] pour la permiere fois
                
                debut = trajet.index(trajet[-1])
                # print("debut, ", debut)
                longueur = len(trajet) - debut - 1
                for i in trajet[debut: -1]:
                    listecherchee[i-1] = longueur
                compteur = 0
                for i in trajet[:debut]:
                    listecherchee[i-1] = nb_redir - compteur
                    compteur += 1
        cin += 1
    
    sortie = ''
    for i in listecherchee:
        sortie += str(i) + ' '
    print(sortie[:-1])
    
if __name__ == "__main__":
    n = int(input())
    redirection = list(map(int, input().split()))
    trajets_retour(n, redirection)