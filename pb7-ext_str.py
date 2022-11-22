
from dataclasses import dataclass
from typing import List
from math import acos, pi


@dataclass
class Position:
    """description d'une position dans le plan spatio-temporel"""

    x: int  # la coordonnée x dans le plan spatio-temporel
    y: int  # la coordonnée y dans le plan spatio-temporel

epsilon = 10**(-5)  # pour les tests d'égalité

def calc_longueur(A, B):
    return ((A.x - B.x)**2 + (A.y - B.y)**2)**(0.5)

def calc_angle(A, B, C, jarvis = True):
    """Renvoie l'angle (BA, BC) entre 0 et 2 pi

    Args:
        A (Position): ptA
        B (Position): ptB
        C (position): ptC
        jarvis (bool, optional): si on est pas dans le jarvis pour qu'on nous renvoie l'angle normal. Defaults to True.

    Returns:
        float: mesure de l'angle entre les vecteurs
    """
    # Attention il faut déterminer si l'angle est plus grand que pi ou pas. 
    # renvoie les angles entre 0 et 2 pi
    ux = (A.x - B.x)
    uy = (A.y - B.y)
    vx = (C.x - B.x)
    vy = (C.y - B.y)
    ccos = (ux*vx + uy*vy)/(calc_longueur(A,B) * calc_longueur(B,C))
    if ccos >= 1:
        ccos =1
    elif ccos <= -1:
        ccos = -1
    presque_sinus = (A.x-B.x)*(C.y-B.y) - (A.y-B.y)*(C.x-B.x)
    if presque_sinus < 0 and jarvis:
        # print('sin pos')
        return 2*pi - acos(ccos)
    # print(ccos)
    return acos(ccos)

def prochain_sommet(pts_ctl, chemin):
    """Renvoie le prochain sommet de la méthode de Jarvis

    Args:
        pts_ctl (list[Position]): liste des pts
        chemin (list[int]): liste des indice des pts déjà choisis

    Returns:
        int: l'indice du prochain point
    """
    angle_max = 0
    next = 0
    for i in range(len(pts_ctl)):
        if i not in chemin[1:]:
            angle = calc_angle(pts_ctl[chemin[-2]], pts_ctl[chemin[-1]], pts_ctl[i])
            if angle >= angle_max:
                if angle == angle_max:
                    if calc_longueur(pts_ctl[chemin[-1]], pts_ctl[i]) > calc_longueur(pts_ctl[chemin[-1]], pts_ctl[next]):
                        # il est plus loin mais sur la même droite donc on le prend
                        next = i
                        # l'angle ne change pas
                else:
                    next = i
                    angle_max = angle
    # print("pro", next, '(x,y)', pts_ctl[next].x, pts_ctl[next].y, angle_max)
    return next
                        

def jarvis(n, pts_ctl):
    """renvoie l'enveloppe convexe des n points
    ATTENTION : renvoie le premier point au début et à la fin

    Args:
        n (int): nb de pts
        pts_ctl (list[Position]): liste des points

    Returns:
        list[int]: la liste des coordonnées des points de l'enveloppe dans pts_ctl
    """
    
    # on récupère le point le plus à gauche, s'il y en a plusieurs on prend le plus bas
    i_debut = 0
    m = pts_ctl[0].x
    for k in range(len(pts_ctl)):
        if pts_ctl[k].x < m:
            i_debut = k
            m = pts_ctl[k].x
        elif pts_ctl[k].x == m:
            if pts_ctl[k].y < pts_ctl[i_debut].y:
                i_debut = k
                # le x min (m) ne change pas dans ce cas
            
    chemin = [i_debut]
    pt_debut = pts_ctl[i_debut]
    i_premier_point = prochain_sommet(pts_ctl[:] + [Position(pt_debut.x, pt_debut.y-1)], [n, i_debut])
    chemin.append(i_premier_point)
    while chemin[0] != chemin[-1]:
        chemin.append(prochain_sommet(pts_ctl, chemin))
    return chemin

def pente(A,B):
    return (B.y - A.y)/(B.x - A.x)
        
def pt_intersection(A,B,C,D, pts_ctl):
    # calcule les coordonnées du point d'intersection de (AB) \inter (CD)
    # print(A,B,C,D)
    A, B, C, D = pts_ctl[A], pts_ctl[B], pts_ctl[C], pts_ctl[D]
    
    try:
        pa = pente(A, B)
    except ZeroDivisionError:
        pa = None
    
    try:
        pc = pente(C, D)
    except ZeroDivisionError:
        pc = None
    
    if pa == None and pc == None:
        return None
    # print("m", (A, B, C, D))
    if abs(pa - pc) < epsilon:
        # print("paralleles")
        return None
    if pa == None:
        # print("inter vert 1")
        inter = Position(A.x, pc*(A.x-C.x) + C.y)
        # print(inter)
        return inter
    if pc == None:
        # print("inter vert 2")
        inter = Position(C.x, pa*(C.x-A.x) + A.y)
        # print(inter)
        return inter
    # print(pa, pc)
    x = 1/(pa - pc)*(pa*A.x - pc*C.x + C.y - A.y)
    # print("inter K")
    inter = Position(x, pa*(x-A.x)+A.y)
    # print(inter)
    return inter


def aretes_minimales(d: int, n: int, points_de_controles: List[Position]) -> None:
    """
    :param d: le rayon de l'espace-temps connu
    :param n: le nombre de points de contrôle existants (en comptant celui sur lequel vous vous situez actuellement)

    :param points_de_controles: la liste des coordonnées points de contrôle existants
    """
    # TODO Afficher, sur une ligne, le nombre d'arêtes minimal de la zone de
    # sécurité après la création d'un nouveau point de contrôle dans l'espace-
    # temps connu.
    # print(jarvis(n, points_de_controles))
    ORIGINE = Position(0,0)
    envelope_convexe = jarvis(n, points_de_controles)
    envelope_convexe = envelope_convexe[:-1]
    if len(envelope_convexe) == 2:
        return 2
    if len(envelope_convexe) == 3:
        return 3
    # seule l'enveloppe convexe nous intéresse
    intersections = []
    pt = pt_intersection(envelope_convexe[-2], envelope_convexe[-1], envelope_convexe[0], envelope_convexe[1], points_de_controles)
    if pt != None:
        intersections.append(pt)
    pt = pt_intersection(envelope_convexe[-1], envelope_convexe[0], envelope_convexe[1], envelope_convexe[2], points_de_controles)
    if pt != None:
        intersections.append(pt)
    if len(envelope_convexe) == 5:
        for i in range(2):
            pt = pt_intersection(envelope_convexe[i], envelope_convexe[i + 1], envelope_convexe[i + 2], envelope_convexe[i + 3], points_de_controles)
            if pt != None:
                intersections.append(pt)
        pt = pt_intersection(envelope_convexe[-3], envelope_convexe[-2], envelope_convexe[-1], envelope_convexe[0], points_de_controles)
        if pt != None:
            intersections.append(pt)
    vraies_intersections = []
    
    # Les points à supprimer sont ceux qui appartiennent déjà au sommets et ceux qui en sont pas dans le cercle
    
    for i in intersections:
        if calc_longueur(ORIGINE, i) <= d and i not in points_de_controles:
            vraies_intersections.append(i)
    # On n'a plus que des vraies intersections
    # print(intersections)
    # print(vraies_intersections)
    intersections = vraies_intersections[:]
    
    # print("inter", [(i.x, i.y) for i in intersections])
    pts_convexe = [points_de_controles[i] for i in envelope_convexe]
    if len(envelope_convexe) == 4:
        if len(intersections) != 0:
            for i in intersections:
                if len(jarvis(len(envelope_convexe)+1, pts_convexe + [i]))-1==3:
                    return 3
        return 4
    
    # il ne reste que le cas où la base du pentagone est plus grande que le reste donc de 5 on passe à 4

    # print("pts cvx", [(pts_convexe[i].x, pts_convexe[i].y) for i in range(len(pts_convexe))])
    # print(intersections)
    if len(intersections) != 0:
        m = 5
        for i in intersections:
            # print("next a study", i.x, i.y)
            pp = jarvis(len(envelope_convexe)+1, pts_convexe + [i])
            nb = len(pp)-1
            # print(nb, pp)
            if nb == 3:
                return 3
            if nb == 4:
                # print('oui')
                m = 4
        # print('ici')
        return m
    return 5

# rac32 = (3)**(0.5)/2
# print(180/pi*calc_angle(Position(1,0), Position(0,0), Position(-rac32, -0.5)))
# print(pente_angulaire(Position(0,0), Position(0,1)))

if __name__ == "__main__":
    d = int(input())
    n = int(input())
    points_de_controles = [Position(*map(int, input().split())) for _ in range(n)]
    print(aretes_minimales(d, n+1, [Position(0,0)] + points_de_controles))
    
"""
gros diamant

10
4
-2 2
-1 3
1 3
2 2

resultat 4

4sur cercle
5
4
-3 4
3 4
-3 -4
3 -4

attendu 4
"""