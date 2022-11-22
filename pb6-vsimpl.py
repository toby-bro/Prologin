
from typing import List

class Chemin:
    def __init__(self, debut, fin, parcours = [], refr_tot = 0) -> None:
        self.debut = debut
        self.fin = fin
        self.parcours = parcours[:]
        self.refr = refr_tot
    
    def ajout_fin(self, noeud, refr):
        self.parcours.append(noeud)
        self.fin = noeud
        self.refr += refr
    
    def ajout_deb(self, noeud, refr):
        self.parcours = [noeud] + self.parcours
        self.debut = noeud
        self.refr += refr
    
    def affiche(self):
        print(f'\n Chemin de {self.refr}', end=' ')
        for noeud in self.parcours:
            print(noeud.id+1, end=' - ')
        print('')

class Noeud:
    def __init__(self, id, dest_avant = [], refr_avant = [], dest_apres = [], refr_apres = []) -> None:
        self.id = id
        # self.nb_tuyaux = nb_tuyaux
        self.dest_avant = dest_avant[:]
        # self.refr_avant = refr_avant
        self.dest_apres = dest_apres[:]
        self.refr_apres = refr_apres[:]
    
    def ajout_avant(self, dest, refr=0):
        self.dest_avant.append(dest)
        # self.refr_avant.append(refr)

    def ajout_apres(self, dest, refr):
        self.dest_apres.append(dest)
        self.refr_apres.append(refr)
    
    def delete_apres(self, dest):
        ind = self.dest_apres.index(dest)
        self.dest_apres.pop(ind)
        self.refr_apres.pop(ind)
    
    def destruct(self):
        tous_les_pts.remove(self)
        for i in self.dest_avant:
            i.delete_apres(self)

def points_atteignables(points_atteints, noeud_etudie):
    # parcours en profondeur par récursivité
    points_atteints.append(noeud_etudie)
    for i in noeud_etudie.dest_apres:
        if i not in points_atteints:
            points_atteints = points_atteignables(points_atteints, i)
    return points_atteints
        


def refroidissement(
    NB_PTS: int, NB_TYX: int, CIBLE: int, PT_DEP: int, PT_AR: int, tous_les_tuyaux: List[List[int]]
) -> None:
    """
    :param NB_PTS: Le nombre de points
    :param NB_TYX: Le nombre de tuyaux
    :param CIBLE: Le nombre de degrés minimum de refroidissement
    :param PT_DEP: Le point de départ
    :param PT_ARR: Le point d'arrivée
    :param tous_les_tuyaux: Les tuyaux orientés (point de départ, point d'arrivée, refroidissement)
    """
    # TODO Afficher le nombre de tuyaux minimal à utiliser pour satisfaire les
    # conditions ou, -1 si ce n'est pas possible.
    
    # premier cas particulier : refroidissement nul demandé, dans ce cas pas besoin de tuyaux...
    if CIBLE == 0 and PT_AR == PT_DEP:
        print(0)
        return
    # print("---- Debut du traitement ----")
    
    global tous_les_pts
    tous_les_pts = []
    tous_les_chemins = []
    
    # Initialisation des listes importantes...
    for i in range(NB_PTS):
        tous_les_pts.append(Noeud(i))
    
    for tuyau in tous_les_tuyaux:
        deb = tous_les_pts[tuyau[0]-1]
        fin = tous_les_pts[tuyau[1]-1]
        deb.ajout_apres(fin, tuyau[2])
        fin.ajout_avant(deb, tuyau[2])
        
    # on va faire un test un peu plus reglo pour determiner si un chemin existe
    pts_atteints = points_atteignables([], tous_les_pts[PT_DEP-1])
    if tous_les_pts[PT_AR-1] not in pts_atteints:
        print(-1)
        return
    # print("test 2 passé")
    
    
    # on va supprimer les chemins inutiles (qui bouclent sur eux-mêmes)
    # for node in tous_les_pts:
    #     if len(node.dest_apres) == 1:
    #         if node.dest_apres.id == node.id:
    #             node.destruct
    
    # on va supprimer tous les nodes qui ne communiquent pas avec l'arrivee:
    node_arrivee = tous_les_pts[PT_AR-1]
    for node in tous_les_pts:
        if node_arrivee not in points_atteignables([], node):
            node.destruct()
    
    # On va commencer par déterminer tous les chemins par bruteforce.
    # On initialise les chemins : ils commencent par le premier point.
    for i in range(len(tous_les_pts[PT_DEP-1].dest_apres)):
        noeud = tous_les_pts[PT_DEP-1].dest_apres[i]
        tous_les_chemins.append(Chemin(tous_les_pts[PT_DEP-1], noeud, [tous_les_pts[PT_DEP-1], noeud], tous_les_pts[PT_DEP-1].refr_apres[i]))

    # Maintenant la boucle la plus importante... : le bruteforce... pitié...
    valide = False
    i = 0
    while i < len(tous_les_chemins) and not valide:
        chemin = tous_les_chemins[i]
        if chemin.debut.id == PT_DEP-1 and chemin.fin.id == PT_AR-1 and chemin.refr >= CIBLE:
            valide = True
        i += 1
    
    while tous_les_chemins != [] and not valide:
        tous_les_chemins_fin = []
        # print(tous_les_chemins)
        
        # On ajoute tous les nouveaux chemins
        for chemin in tous_les_chemins:
            # chemin.affiche()
            noeud_temp = chemin.fin
            for i in range(len(chemin.fin.dest_apres)):
                noeud = noeud_temp.dest_apres[i]
                refr = noeud_temp.refr_apres[i]
                tous_les_chemins_fin.append(Chemin(chemin.debut, noeud, chemin.parcours[:] + [noeud], chemin.refr + refr))
        
        tous_les_chemins = tous_les_chemins_fin
        
        # On elimine les chemins sans avenir ou pas ? non ils vont s'éliminer tous seuls.
        
        # le test de validation:
        i = 0
        while i < len(tous_les_chemins) and not valide:
            chemin = tous_les_chemins[i]
            if chemin.debut.id == PT_DEP-1 and chemin.fin.id == PT_AR-1 and chemin.refr >= CIBLE:
                valide = True
            i += 1
            
    # la variable chemin quand on quitte la boucle est le bon chemin (si valide est vrai)
    if valide:
        # chemin.affiche()
        print(len(chemin.parcours)-1)
    else:
        print(-1)



if __name__ == "__main__":
    n = int(input())
    m = int(input())
    k = int(input())
    a = int(input())
    b = int(input())
    tuyaux = [list(map(int, input().split())) for _ in range(m)]
    refroidissement(n, m, k, a, b, tuyaux)

""" 
9
15
25
1
5
1 2 1
2 4 1
2 5 1
3 7 1
7 6 1
9 1 1
6 8 2
4 8 1
8 5 1
8 9 -1
4 5 2
7 9 1
9 7 1
7 2 1
8 3 1

4
4
5
1
2
1 3 1
1 2 1
3 3 2
3 4 1
4 1 1
4 2 1
"""