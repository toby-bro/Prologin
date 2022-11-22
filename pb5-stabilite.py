
from typing import List
from random import randint, random
# from math import pi, sqrt, exp

def calc_stab(accr, P):
    return P - (max(accr)-min(accr))**2

def best_stab_individuel(libres, p):
    accr = libres[:4]
    # # print("accr", accr)
    indice_max = 0
    stab_max = calc_stab(accr, p)
    if libres != None:
        for i in range(4,len(libres)):
            accr = accr[1:]
            accr.append(libres[i])
            stab = calc_stab(accr, p)
            # # print("accr2", accr, i, stab, indice_max)
            if stab > stab_max:
                indice_max = i-3
                stab_max = stab
    return indice_max, stab_max

def init_par_le_bas(nb_stab, accroches):
    return [accroches[4*i:4*i+4] for i in range(nb_stab)], accroches[4*nb_stab+4:]

def moyenne_place(accr):
    s = 0
    for i in accr:
        s+=i
    return s/4

def correction_du_tri(tableau):
    """trie le tableau 

    Args:
        tableau (list[list]): les pos des stab

    Returns:
        list: le tableau trié
    """
    i = 1
    while i < len(tableau):
        j = i
        while moyenne_place(tableau[j-1])>moyenne_place(tableau[j]) and j>0:
            j-=1
        tableau[i], tableau[j] = tableau[j], tableau[i]
        i+=1
    return tableau


def placement_naif(nb_stab, accroches, p):
    """genere un premier placement naif

    Args:
        nb_stab (int): nombre de stabilisateurs
        accroches (list): liste des accroches
        p (int): indice de stab parfaite

    Returns:
        list: places occupées par les stab
        int: indice de stabilité de l'ensemble
        list: enesemble des accroches libres
    """
    accroches_libres = accroches[:]
    stab_totale = 0
    places_occupees=[] # liste de listes contenant pour chaque stabilisateur ses accroches
    for _ in range(nb_stab):

        indice_max, stab_max = best_stab_individuel(accroches_libres, p)
        places_occupees.append(accroches_libres[indice_max:indice_max+4])
        accroches_libres = accroches_libres[:indice_max] + accroches_libres[indice_max+4:]
        stab_totale += stab_max
        
        # # print("ppo", places_occupees)
    # on va trier la liste par moyenne d'accroches utilisées
    places_occupees = correction_du_tri(places_occupees)
    # # print("po", places_occupees, stab_totale, accroches_libres)
    return places_occupees, stab_totale, accroches_libres
    
# def proba_normale(cible, mu, sigma):
#     return 1/(sigma*sqrt(2*pi))*exp(-1/2*((cible-mu)/2)**2)

def recentre(tableau, accr_libres, p, stab_tot):
    for ind_stab in range(len(tableau)):
        mmin = min(tableau[ind_stab])
        mmax = max(tableau[ind_stab])
        poss = []
        if mmin != mmax:
            for i in range(mmin, mmax):
                if i in accr_libres:
                    poss.append(i)
            if poss != []:
                old_stab = calc_stab(tableau[ind_stab], p)
                ssstableau, new_stab, libres = placement_naif(1, poss + tableau[ind_stab], p)
                # on a recentré on met à jour les différentes infos
                for i in range(len(accr_libres)):
                    if accr_libres[i] in libres:
                        libres.remove(accr_libres[i])
                    else:
                        accr_libres[i] = libres[0]
                        libres = libres[1:]
                tableau[ind_stab] = ssstableau[0]
                # on recalcule la nouvelle stabilité
                stab_tot = stab_tot - old_stab + new_stab
    return tableau, accr_libres, stab_tot
                    
                    
                    
                    
def stab_par_permut(tableau: list, stab: int, p: int, accr_libres: list):
    # procedure : on fait varier on calcule la nouvelle stabilité si elle est plus faible on la retient
    # on va se servir de la méthode du recuit simulé
    proba = 1
    nb_accr = len(tableau)
    tableau_max, stab_max = tableau[:], stab
    while tableau != tableau_max:
        # print("permut", tableau)
        for i_stab in range(len(tableau)):
            proba = random
            cible = None
            if proba < 0.18:
                if i_stab > 1:
                    cible = i_stab - 2
            elif proba < 0.5:
                if i_stab > 0:
                    cible = i_stab - 1
            elif proba < 0.82:
                if i_stab < nb_accr - 1:
                    cible = i_stab + 1
            else:
                if i_stab < nb_accr - 2:
                    cible = i_stab + 2
            if cible != None:
                a,b = randint(0,2), randint(1,3)
                old_tiny_stab = calc_stab(tableau[cible], p) + calc_stab(tableau[i_stab], p)
                if cible < i_stab:
                    tableau[cible][b], tableau[i_stab][a] = tableau[cible][a], tableau[i_stab][b]
                new_tiny_stab = calc_stab(tableau[cible], p) + calc_stab(tableau[i_stab], p)
                if p*random*new_tiny_stab/old_tiny_stab < 0.5:
                    tableau[cible][b], tableau[i_stab][a] = tableau[cible][a], tableau[i_stab][b]
                else:
                    stab = stab - old_tiny_stab + new_tiny_stab
        p * 0.999
        tableau, accr_libres, stab = recentre(tableau, accr_libres, p, stab)
        if stab > stab_max:
            tableau_max = tableau[:]
            stab_max = stab
    return tableau_max, stab_max
            
            


def stabilite_maximale(n: int, k: int, p: int, accroches: List[int]) -> None:
    """
    :param n: nombre d'accroches
    :param k: nombre de stabilisateurs
    :param p: indice de stabilité parfaite
    :param accroches: hauteur de chaque accroche
    """
    # TODO Afficher l'indice de stabilité maximal obtenable.
    
    # méthode employée (sans bruteforce) on va positionner un stabilisateur et calculer la stabilité
    # on va aussi déterminer le nombre maximal de stabilisateurs posables, puis on va tenter des
    # permutations entre les accroches et chercher une solution optimale.
    # on va d'ailleurs les placer intelligemment, et ne déplacer les stab que d'une pate vers le haut
    # ou le bas.
    accroches.sort()
    stab = 0
    N_max = n//4
    if N_max < k:
        k = N_max
    # # print(k)
    best_stab = 0
    best_tableau = []
    for nb_stab in range(1,k+1):
        # print("on commence pour n = ", nb_stab)
        tableau, stab, accr_libres = placement_naif(nb_stab, accroches, p)
        tab_bas, accr_libres_bas = init_par_le_bas(nb_stab, accroches)
        stab_bas = 0
        for i in tab_bas:
            stab_bas += calc_stab(i, p)
        # # print(stab_bas, stab, tableau, tab_bas)
        if stab_bas > stab:
            tableau = tab_bas
            stab = stab_bas
            accr_libres = accr_libres_bas
        # print("meilleur stab avec", tableau, stab)
        # on a initialisé avec une configuration de base, on va maintenant étudier la stab des permutations
        # # print(tableau, stab, p, accroches, accr_libres)
        tableau, stab = stab_par_permut(tableau, stab, p, accr_libres)
        # print("fin pour ", nb_stab," avec ", tableau, stab)
        if stab > best_stab:
            best_stab = stab
            best_tableau = tableau
    # print(best_tableau)
    print(best_stab)


if __name__ == "__main__":
    n = int(input()) # nombre d'accroches
    k = int(input()) # nombre de stabilisateurs
    p = int(input()) # indice de stabilité parfaite
    accroches = list(map(int, input().split())) # les positions des accroches
    stabilite_maximale(n, k, p, accroches)
