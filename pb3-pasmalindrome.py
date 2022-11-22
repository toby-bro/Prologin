
from typing import List

def extracteur(mdp: str):
    minu = []
    maju = []
    chif = []
    chiffres = [str(i) for i in range(10)]
    for i in mdp:
        if i.islower():
            minu.append(i)
        elif i.isupper():
            maju.append(i)
        elif i in chiffres:
            chif.append(i)
    return minu, maju, chif

def is_palindrome(char):
    n = len(char)
    i = 0
    while i<n-1-i:
        if char[i] == char[n-1-i]:
            i+=1
        else:
            return False
    return True
    
def nb_pas_malin_drome(n: int, mots: List[str]) -> None:
    """
    :param n: Le nombre de mots de passe contenus dans le fichier de mots de passe de Raphaël
    :param mots: La liste des mots de passe à décoder
    """
    # TODO Afficher le nombre de pas malin-dromes situés dans le fichier de
    # mots de passe de Raphaël
    nb_pasmal = 0
    for mdp in mots:
        minu, maju, chif = extracteur(mdp)
        if is_palindrome(minu) and is_palindrome(maju) and is_palindrome(chif):
            # print("valide", mdp, minu, maju, chif)
            nb_pasmal+=1
    print(nb_pasmal)


if __name__ == "__main__":
    n = int(input())
    mots = [input() for _ in range(n)]
    nb_pas_malin_drome(n, mots)
