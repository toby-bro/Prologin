from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os
import string
from random import randint

# KEY = os.urandom(16)
# print(KEY.hex())
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
        return {"plaintext": plaintext.decode('utf-8')}
    return {"error": "J'ai pu la déchiffrer sans aucun problème. Cependant, je"
            " te la donnerais seulement contre 999,999.58$."}


# PASSWORD = encrypt(FLAG)
iv = 'c19b670bf8c0369cb7aea5330c39d22c'
ciphertext = 'cb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'

# char = string.ascii_lowercase
char = string.hexdigits[:16]
# for i in range(10):
#     char += str(i)

# print(pad(bytes.fromhex('11111111'), 10).hex())

# for i in range(3):
#     key_base = ciphertext[-32+i:]
#     print(i)
#     # print(key_base)
#     # On va supposer que tous les characteres de la clef sont des characteres alphanumeriques
#     for k in range(16**i):
#         a = k
#         KEY = key_base[:]
#         for _ in range(i):
#             KEY = char[a % 16] + KEY
#             a = a // 16
#         # print(KEY)
#         # KEY = char[randint(0,len(char)-1)] + KEY
#         KEY = bytes.fromhex(KEY)
#         try:
#             res = decrypt(iv, ciphertext)
#             # print(res)
#             if "error" not in res:
#                 print(KEY.hex(), res)
#         except UnicodeDecodeError:
#             pass
#         # print(res)
#         # if "error" not in res:
#         #     print(res)