from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os
import random

# KEY = os.urandom(16)
FLAG = ''
FLAG = "PROLOGIN{" + FLAG + "}"
FLAG = FLAG.encode().hex()
ADMIN = True

iv = 'c19b670bf8c0369cb7aea5330c39d22c'
ciphertext = 'cb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'


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


def decrypt(iv, ciphertext_and_key):
    """
    Decrypts a hex ciphertext
    """
    i = 0
    termine = False
    iv = bytes.fromhex(iv)
    coord = list(range(96))
    # print(coord)
    while not termine:
        # sample = random.sample(coord, 32)
        # sample.sort()
        
        # print(sample)
        ciphertext = ''
        KEY = ''
        for i in range(96):
            if i in sample:
                KEY += ciphertext_and_key[i]
            else:
                KEY += ciphertext_and_key[i]
        # ciphertext = ciphertext_and_key[:i] + ciphertext_and_key[i+32:]
        # KEY = ciphertext_and_key[i:i+32]
        i+=1
        try:
            KEY = bytes.fromhex(KEY)
            ciphertext = bytes.fromhex(ciphertext)
            cipher = AES.new(KEY, AES.MODE_CBC, iv)
            decrypted = cipher.decrypt(ciphertext)
            plaintext = unpad(decrypted, 16)
            termine = True
        except ValueError as e:
            termine = False
            # print('no')
            # return {"error": "Cette clé est incorrecte. Tu t'es fait avoir, ça se"
                    # " voit à l'œil nu!"}
    print('sorti')
    if ADMIN:
        return {"plaintext": plaintext.hex()}
    return {"error": "J'ai pu la déchiffrer sans aucun problème. Cependant, je"
            " te la donnerais seulement contre 999,999.58$."}


# PASSWORD = encrypt(FLAG)
print(decrypt(iv, ciphertext))