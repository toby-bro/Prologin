#!/usr/bin/env python3
import sys,os
from Crypto.Cipher import AES
from settings import *
mode = AES.MODE_CBC
import requests

# AES CBC decryption 
def decryption(encrypted):
    decryptor = AES.new(key, mode, IV=IV)
    return decryptor.decrypt(encrypted)


# Ckeck validity of PKCS7 padding
def pkcs7_padding(data):
    pkcs7 = True
    last_byte_padding = data[-1]
    if(last_byte_padding < 1 or last_byte_padding > 16):
        pkcs7 = False
    else:
        for i in range(0,last_byte_padding):
            if(last_byte_padding != data[-1-i]):
                pkcs7 = False
    return pkcs7

# Determine if the message is encrypted with valid PKCS7 padding
def oracle(ciphertext_bytes):
    # return pkcs7_padding(decryption(encrypted))
    original_payload = {"iv":"c19b670bf8c0369cb7aea5330c39d22c","ciphertext":"cb4780118ade116aff05ebdc6dcb43654eada2e538334d3b4039e855e0a47957890f1018f2ca0a4f941cee264f44d3b8"}
    payload = {"iv":"c19b670bf8c0369cb7aea5330c39d22c","ciphertext":ciphertext_bytes.hex()}
    headers = {'Host': 'ctf.prologin.org',
                'Accept': 'application/json, text/plain, */*', 
                'Accept-Language': 'en-US,en;q=0.5', 
                'Accept-Encoding': 'gzip, deflate', 
                'Content-Type': 'application/json', 
                'Content-Length': '153', 
                'Origin': 'https://ctf.prologin.org', 
                'DNT': '1', 
                'Connection': 'keep-alive',
                'Referer': 'https://ctf.prologin.org/', 
                'Sec-Fetch-Dest': 'empty', 
                'Sec-Fetch-Mode': 'cors', 
                'Sec-Fetch-Site': 'same-origin', 
                'Sec-GPC': '1',
                'Pragma': 'no-cache', 
                'Cache-Control': 'no-cache',
                'Te': 'trailers', 
                'Connection': 'Close'}
    r = requests.post('https://ctf.prologin.org/password', headers=headers, json=payload)
    # print(r.status_code)
    # print(r.headers)
    # print(r.text)
    # print(r.url)
    # print(r.apparent_encoding)
    # print(r.cookies)
    # print(r.history)
    json_resp = r.json()
    # print(json_resp)
    # print(requests.get('https://api.github.com'))
    if "Tu t'es" in json_resp['error']:
      return False
    return True

