from __future__ import annotations

import base64
import hashlib
from typing import Optional

from Crypto.Cipher import DES
from Crypto.Protocol.KDF import PBKDF2
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad

PASSWORD = b"vl9u1grTnvXA"
ITERATIONS = 1000
KEY_LEN = 8
IV_LEN = 8


def derive_key(iv: bytes) -> bytes:
    """Derive DES key using PBKDF2 with SHA1."""
    return PBKDF2(PASSWORD, iv, dkLen=KEY_LEN, count=ITERATIONS)


def encrypt(plain: str) -> str:
    """Encrypt plain text and return base64 encoded string."""
    iv = get_random_bytes(IV_LEN)
    key = derive_key(iv)
    cipher = DES.new(key, DES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(plain.encode("utf-8"), DES.block_size))
    return base64.b64encode(iv + ct).decode("ascii")


def decrypt(b64_cipher: str) -> str:
    """Decrypt base64 encoded ciphertext."""
    data = base64.b64decode(b64_cipher)
    iv = data[:IV_LEN]
    ct = data[IV_LEN:]
    key = derive_key(iv)
    cipher = DES.new(key, DES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), DES.block_size)
    return pt.decode("utf-8")


def md5_key(raw: str, index: Optional[int] = None) -> str:
    """Generate MD5 key used by SecurePlayerPrefs."""
    if index is not None:
        raw = f"{raw}[{index}]"
    return hashlib.md5(raw.encode("utf-8")).hexdigest().upper()
