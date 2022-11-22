from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os

# KEY = os.urandom(16)
FLAG = '1234567890123456789'
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
    print(len(encrypted.hex()))
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
        print(e)
        return {"error": "Cette clé est incorrecte. Tu t'es fait avoir, ça se"
                " voit à l'œil nu!"}

    if ADMIN:
        return {"plaintext": plaintext.hex()}
    return {"error": "J'ai pu la déchiffrer sans aucun problème. Cependant, je"
            " te la donnerais seulement contre 999,999.58$."}


# PASSWORD = encrypt(FLAG)
# print(PASSWORD)
iv = 'c19b670bf8c0369cb7aea5330c39d22c'
ciphertext = 'cb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'
KEY = ciphertext[:32]
ciphertext = ciphertext[32:]
KEY = bytes.fromhex(KEY)
print(len(KEY), len(ciphertext), len(iv))
print(decrypt(iv, ciphertext))