from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os

KEY = os.urandom(16)
FLAG = ???
FLAG = "PROLOGIN{" + FLAG + "}"
FLAG = FLAG.encode().hex()
ADMIN = False


def encrypt(plaintext: str):
    """
    Encrypts a hex plaintext using AES CBC.
    """
    plaintext = bytes.fromhex(plaintext)
    padded = pad(plaintext, 16)
    iv = os.urandom(16)
    cipher = AES.new(KEY, AES.MODE_CBC, iv)
    try:
        encrypted = cipher.encrypt(padded)
    except ValueError as e:
        return {"error": str(e)}

    return {"iv": iv.hex(), "ciphertext": encrypted.hex()}


def decrypt(iv, ciphertext):
    """
    Decrypts a hex ciphertext
    """
    try:
        iv = bytes.fromhex(iv)
        ciphertext = bytes.fromhex(ciphertext)
        cipher = AES.new(KEY, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(ciphertext)
        plaintext = unpad(decrypted, 16)
    except ValueError as e:
        return {"error": "Cette clé est incorrecte. Tu t'es fait avoir, ça se"
                " voit à l'œil nu!"}

    if ADMIN:
        return {"plaintext": plaintext.hex()}
    return {"error": "J'ai pu la déchiffrer sans aucun problème. Cependant, je"
            " te la donnerais seulement contre 999,999.58$."}


PASSWORD = encrypt(FLAG)
