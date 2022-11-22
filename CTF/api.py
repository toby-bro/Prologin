from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import os

# KEY = os.urandom(16)
FLAG = 'ME'
FLAG = "PROLOGIN{" + FLAG + "}"
FLAG = FLAG.encode().hex()
ADMIN = True

# print(FLAG)

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
    # print('hex decode', bytes.fromhex(ciphertext).decode())
    iv = bytes.fromhex(iv)
    ciphertext = bytes.fromhex(ciphertext)
    print(len(ciphertext), len(iv))

    cipher = AES.new(KEY, AES.MODE_CBC, iv)
    decrypted = cipher.decrypt(ciphertext)
    print(decrypted)
    plaintext = unpad(decrypted, 16)
    # except ValueError as e:
    #     return {"error": "Cette clé est incorrecte. Tu t'es fait avoir, ça se"
                # " voit à l'œil nu!"}

    if ADMIN:
        return {"plaintext": plaintext.hex()}
    return {"error": "J'ai pu la déchiffrer sans aucun problème. Cependant, je"
            " te la donnerais seulement contre 999,999.58$."}


# PASSWORD = encrypt(FLAG)
# print(PASSWORD)
clef = 'c19b670bf8c0369cb7aea5330c39d22ccb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'
# print(len(bytes.fromhex(clef)))
i = 0
# iv = 'cb4780118ade116aff05ebdc6dcb4365'
# iv = 'c19b670bf8c0369cb7aea5330c39d22c'
# cyphertext = '4eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'

iv = 'c19b670bf8c0369cb7aea5330c39d22c'
cyphertext = 'cb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'
KEY = bytes.fromhex('cb4780118ade116aff05ebdc6dcb4365')
# while len(bytes.fromhex(clef[:i])) != 32:
#     i += 2
# iv = clef[:i]
# cyphertext = clef[i:]
print(iv)

print(decrypt(iv, cyphertext))
clef = 'c19b670bf8c0369cb7aea5330c39d22ccb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8'