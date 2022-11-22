
from typing import List
from random import randint, random
from time import time
from copy import deepcopy
# from math import pi, sqrt, exp

def calc_stab(accr, P):
    # Calcule la stabilité de accr
    return P - (max(accr)-min(accr))**2

def best_stab_individuel(libres, p):
    """renvoie l'indice de la première accroche libre permettant d'avoir la meilleure stabilité individuelle possible

    Args:
        libres (list[int]): liste des accroches libres
        p (int): le p de la stabilité parfaite

    Returns:
        int: indice de l'accroche de la meilleure stabilité pour le stabilisateur
    """
    # On initialise
    accr = libres[:4]
    indice_max = 0
    stab_max = calc_stab(accr, p)
    if libres != None:
        # On va chercher la position de stabilité maximale en parcourant la liste
        for i in range(4,len(libres)):
            # On change de postion (de 1) et on calcule la nouvelle stabilité 
            accr = accr[1:]
            accr.append(libres[i])
            stab = calc_stab(accr, p)
            
            if stab > stab_max:
                # c'est donc un meilleur emplacement que celui qu'on avait jusque là
                indice_max = i-3
                stab_max = stab
    return indice_max, stab_max

def init_par_le_bas(nb_stab, accroches):
    """Une autre méthode pour initialiser notre tableau des positions des 
    stabilisateurs, où on ne va que placer les stabilisateurs les uns au dessus des autres

    Args:
        nb_stab (int): le nombre de stabilisateurs
        accroches (list[int]): la liste de toutes les accroches existantes

    Returns:
        (list[list[int]], list[int]): la liste des accroches occupées, la liste des accroches libres
    """
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
    tic_tri = time()
    i = 1
    while i < len(tableau):
        j = i
        while tableau[j-1][0]>tableau[j][0] and j>0:
            j-=1
        tableau[i], tableau[j] = tableau[j], tableau[i]
        i+=1
    if time()- tic_tri > 10**(-4):
        print('tri trop long')
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
    print(4/0)
    print('entre dans recentre')
    for ind_stab in range(len(tableau)):
        mmin = min(tableau[ind_stab])
        mmax = max(tableau[ind_stab])
        poss = []
        if mmin != mmax:
            for i in range(mmin, mmax):
                if i in accr_libres:
                    poss.append(i)
            if poss != []:
                print('poss != 0')
                old_stab = calc_stab(tableau[ind_stab], p)
                ssstableau, new_stab, libres = placement_naif(1, poss + tableau[ind_stab], p)
                print('placnaif')
                # on a recentré on met à jour les différentes infos
                for i in range(len(accr_libres)):
                    if accr_libres[i] in libres:
                        libres.remove(accr_libres[i])
                    else:
                        accr_libres[i] = libres[0]
                        libres = libres[1:]
                tableau[ind_stab] = ssstableau[0][:]
                print('onpc')
                # on recalcule la nouvelle stabilité
                stab_tot = stab_tot - old_stab + new_stab
    return tableau, accr_libres, stab_tot
                    
                    
def stab_sans_intersections_naif(tableau, stab, p, accr_libres):
    """
    si on commence avec la méthode où tout n'a été qu'empilé alors puisque
    logiquement si on ne veut pas d'une stabilité pourrie il faut qu'il n'y ait aucun recouvrement
    alors on va se contenter de juste décaler progressivement tous les stabilisateurs pour
    tenter de trouver la meilleure solution. Pour ne pas être en train de bruteforce on va
    tenter de voir, si quand on place un stabilisateur, si la position optimale est collé à un autre,
    est ce qu'il n'y a pas un meilleur équilibre pour l'ensemble des deux...
    """
    pass

def stab_par_prune(tableau: list, stab: int, p: int, accr_libres: list):
    # procedure : on fait varier on calcule la nouvelle stabilité si elle est plus faible on la retient
    # on va se servir de la méthode du recuit simulé
    # print('entré')
    nb_accr = len(tableau)
    tableau_max, stab_max = deepcopy(tableau), stab
    effectue = False
    tableau = correction_du_tri(tableau)
    while tableau != tableau_max or not effectue:
        # print(tableau, tableau_max, stab, stab_max)
        if stab > stab_max:
            tableau_max = deepcopy(tableau)
            stab_max = stab
        # print('commence')
        # print("permut", tableau)
        for i_stab in range(len(tableau)):
            # on va chercher tous les stabilisateurs avec qui il est en intersection et optimiser un par un
            for j_stab in range(i_stab):
                # on sait donc que j_stab est plus petit que i_stab : on va chercher
                # les intersections avec les stab avant pour avancer petit à petit.
                if tableau[j_stab][3] > tableau[i_stab][0]:
                    # dans ce cas le plus grand de l'un est plus petit que l'autre
                    # on va optimiser l'ensemble 
                    # il est forcément plus optimal (à cause des carrés) d'échanger tous ceux qui s'intersectent
                    # on détermine à partir de quand il faut échanger
                    k = 0
                    while tableau[j_stab][3-k] > tableau[i_stab][k] and k < 4:
                        k -= 1
                    old_tiny_stab = calc_stab(tableau[i_stab], p) + calc_stab(tableau[j_stab], p)
                    tableau[j_stab][3-k :], tableau[i_stab][:k] =  tableau[i_stab][:k], tableau[j_stab][3-k :]
                    new_tiny_stab = calc_stab(tableau[i_stab], p) + calc_stab(tableau[j_stab], p)
                    stab = stab - old_tiny_stab + new_tiny_stab
        # print('1 fois')
        # tableau, accr_libres, stab = recentre(tableau, accr_libres, p, stab)
        # print('1 fois toujours')
        
        effectue = True
    # print('sorti')
    return tableau_max, stab_max
                    
                    
def stab_par_permut(tableau: list, stab: int, p: int, accr_libres: list):
    # procedure : on fait varier on calcule la nouvelle stabilité si elle est plus faible on la retient
    # on va se servir de la méthode du recuit simulé
    proba = 1
    print("permut")
    print(4/0)
    nb_accr = len(tableau)
    tableau_max, stab_max = [], 0
    # print(tableau)
    while tableau != tableau_max:
        print('stab permut', stab, stab_max)
        tableau_max = deepcopy(tableau[:])
        stab_max = stab
        # print("permut", tableau)
        for i_stab in range(len(tableau)):
            proba = random()
            # print(proba)
            cible = None
            # print(proba, i_stab)
            if proba < 0.18:
                # print(0.18)
                if i_stab > 1:
                    # print(True)
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
            # print(cible)
            if cible != None:
                a,b = randint(0,2), randint(1,3)
                old_tiny_stab = calc_stab(tableau[cible], p) + calc_stab(tableau[i_stab], p)
                if cible < i_stab:
                    tableau[cible][b], tableau[i_stab][a] = tableau[cible][a], tableau[i_stab][b]
                new_tiny_stab = calc_stab(tableau[cible], p) + calc_stab(tableau[i_stab], p)
                print('stab' ,stab, end=' ')
                if p*random()*new_tiny_stab/old_tiny_stab < 0.5:
                    tableau[cible][b], tableau[i_stab][a] = tableau[cible][a], tableau[i_stab][b]
                else:
                    stab = stab - old_tiny_stab + new_tiny_stab
        p * 0.99
        # print('une permut de plus')
        # tableau, accr_libres, stab = recentre(tableau, accr_libres, p, stab)
    
    tableau_max = tableau
    stab_max = stab
    return tableau_max, stab_max
            
            


def stabilite_maximale(n: int, k: int, p: int, accroches: List[int], algo) -> None:
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
        if algo == 1:
            tableau, stab = stab_par_prune(tableau, stab, p, accr_libres)
        else:
            tableau, stab = stab_par_permut(tableau, stab, p, accr_libres)
        # print("fin pour ", nb_stab," avec ", tableau, stab)
        if stab > best_stab:
            best_stab = stab
            best_tableau = tableau
    # print(best_tableau)
    return best_stab, best_tableau


if __name__ == "__main__":
    n = int(input()) # nombre d'accroches
    k = int(input()) # nombre de stabilisateurs
    p = int(input()) # indice de stabilité parfaite
    accroches = list(map(int, input().split())) # les positions des accroches
    ok = True
    # accroches = []
    nb = 1
    mieux = 0
    while ok and nb <2:
        # print('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Nouveau test>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        # n = randint(1, 12)
        # k = randint(1, n)
        # n= 12
        # k=3
        # p = randint(1, 100000)
        # accroches = []
        # for _ in range(n):
        #     accroches.append(randint(1, 10**9))
        # print(n, '\n', k, '\n', p, '\n', accroches)
        # print("DEBUT ALGORITHMES")
        start = time()
        # stab_1, tab_1 = stabilite_maximale(n, k, p, accroches, 2)
        # end1 = time() - start
        stab_2, tab_2 = stabilite_maximale(n, k, p, accroches, 1)
        end2 = time() - start
        # if stab_1 != stab_2:
        #     print("1 : ", stab_1, tab_1)
        #     print("2 : ", stab_2, tab_2)
        #     ok = False
        # elif nb % 10**3 ==0:
        #     print(nb//3, end=' ')
        # if end2 < end1:
        #     mieux += 1
        nb += 1
        
    print(stab_2, tab_2)

""" 
12
 3
 43903
 [76819398, 161426164, 213800363, 696678577, 744243362, 790506377, 812230556, 813984524, 825971325, 834652200, 835922586, 848389452] 
 """