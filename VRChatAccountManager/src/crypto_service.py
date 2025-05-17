from __future__ import annotations

from base64 import b64encode, b64decode
from hashlib import md5
from os import urandom

from Crypto.Cipher import DES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Util.Padding import pad, unpad

PASSWORD = b"vl9u1grTnvXA"
ITERATIONS = 1000
KEY_LEN = 8
IV_LEN = 8


def derive_key(iv: bytes) -> bytes:
    """Derive DES key from IV using PBKDF2."""
    return PBKDF2(PASSWORD, iv, dkLen=KEY_LEN, count=ITERATIONS)


def encrypt(plain: str) -> str:
    """Encrypt text and return Base64 string."""
    iv = urandom(IV_LEN)
    key = derive_key(iv)
    cipher = DES.new(key, DES.MODE_CBC, iv)
    padded = pad(plain.encode("utf-8"), DES.block_size)
    ct = cipher.encrypt(padded)
    return b64encode(iv + ct).decode("ascii")


def decrypt(b64_cipher: str) -> str:
    """Decrypt Base64 cipher text."""
    data = b64decode(b64_cipher)
    iv, ct = data[:IV_LEN], data[IV_LEN:]
    key = derive_key(iv)
    cipher = DES.new(key, DES.MODE_CBC, iv)
    plain = unpad(cipher.decrypt(ct), DES.block_size)
    return plain.decode("utf-8")


def md5_key(raw: str, index: int | None = None) -> str:
    """Return 32-character upper hex MD5 for the given key."""
    if index is not None:
        raw = f"{raw}{index}"
    return md5(raw.encode("utf-8")).hexdigest().upper()
