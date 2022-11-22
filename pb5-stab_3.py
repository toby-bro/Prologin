from typing import List
from random import randint, random
# from time import time
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
    # tic_tri = time()
    i = 1
    while i < len(tableau):
        j = i
        while tableau[j-1][0]>tableau[j][0] and j>0:
            j-=1
        tableau[i], tableau[j] = tableau[j], tableau[i]
        i+=1
    # if time()- tic_tri > 10**(-4):
        # print('tri trop long')
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


def stab_par_prune(tableau: list, stab: int, p: int, accr_libres: list):
    # procedure : on fait varier on calcule la nouvelle stabilité si elle est plus faible on la retient
    # on va se servir de la méthode du recuit simulé
    # print('entré')
    nb_accr = len(tableau)
    tableau = correction_du_tri(tableau)
    tableau_max, stab_max = deepcopy(tableau), stab
    effectue = False

    nnb = 0
    while (tableau != tableau_max or not effectue):
        nnb += 1
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
                        k += 1
                    old_tiny_stab = calc_stab(tableau[i_stab], p) + calc_stab(tableau[j_stab], p)
                    tableau[j_stab][3-k+1 :], tableau[i_stab][:k] =  tableau[i_stab][:k], tableau[j_stab][3-k+1 :]
                    new_tiny_stab = calc_stab(tableau[i_stab], p) + calc_stab(tableau[j_stab], p)
                    tableau[i_stab].sort()
                    tableau[j_stab].sort()
                    stab = stab - old_tiny_stab + new_tiny_stab
                    # print('permutation', i_stab, j_stab, k)
        effectue = True
    # print('sorti')
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
    best_tableau = []
    best_stab = 0 # si on ne mets aucun stabilisateur
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
        # print("fin pour ", nb_stab," avec ", tableau, stab)
        if stab > best_stab:
            best_stab = stab
            best_tableau = tableau
    # print(best_tableau)
    return best_stab, best_tableau


if __name__ == "__main__":
    # n = int(input()) # nombre d'accroches
    # k = int(input()) # nombre de stabilisateurs
    # p = int(input()) # indice de stabilité parfaite
    # accroches = list(map(int, input().split())) # les positions des accroches
    ok = True
    accroches = []
    nb = 1
    mieux = 0
    while ok:
        print('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Nouveau test>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        n = randint(1, 12)
        k = randint(1, n)
        p = randint(1, 100000)
        accroches = []
        for _ in range(n):
            accroches.append(randint(1, 6))
        accroches.sort()
        print(n)
        print(k)
        print(p)
        for i in accroches:
            print(i, end=' ')
        print()
        
        print("DEBUT ALGORITHMES")
        # start = time()
        stab_1, tab_1 = stabilite_maximale(n, k, p, accroches, 1)
        print(stab_1, end=' ')
        # end1 = time() - start
        stab_2, tab_2 = stabilite_maximale(n, k, p, accroches, 2)
        # end2 = time() - start
        print(stab_2)
        if stab_1 != stab_2:
            print("1 : ", stab_1, tab_1)
            print("2 : ", stab_2, tab_2)
            ok = False
        else:
            print('-----------------------------TEST VALIDE----------------------------------')
        # elif nb % 10**3 ==0:
        #     print(nb//3, end=' ')
        # if end2 < end1:
        #     mieux += 1
        nb += 1
        
    # print(stab_2, tab_2)
