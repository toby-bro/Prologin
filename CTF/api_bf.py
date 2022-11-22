from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os

KEY = os.urandom(16)
print(KEY)
FLAG = ''
FLAG = "PROLOGIN{" + FLAG + "}"
FLAG = FLAG.encode().hex()
ADMIN = True


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
    managed = False
    iv = bytes.fromhex(iv)
    ciphertext = bytes.fromhex(ciphertext)
    while not managed:
        while not managed:
            try:
                KEY = os.urandom(16)
                cipher = AES.new(KEY, AES.MODE_CBC, iv)
                decrypted = cipher.decrypt(ciphertext)
                plaintext = unpad(decrypted, 16)
                managed = True
            except ValueError as e:
                managed = False
                print(e)
                # return {"error": "Cette clé est incorrecte. Tu t'es fait avoir, ça se"
                        # " voit à l'œil nu!"}
                pass
        print('sorti')
        if ADMIN:
            try:
                return {"plaintext": bytes.fromhex(plaintext.hex()).decode('utf-8')}
            except UnicodeDecodeError:
                managed = False
        else:
            return {"error": "J'ai pu la déchiffrer sans aucun problème. Cependant, je"
                " te la donnerais seulement contre 999,999.58$."}


PASSWORD = encrypt(FLAG)

iv = 'c19b670bf8c0369cb7aea5330c39d22c'
ciphertext = 'cb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'

print(decrypt(iv, ciphertext))