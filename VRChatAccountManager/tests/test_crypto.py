import os
import random
import string

import pytest

from VRChatAccountManager.src import crypto_service as cs


def random_text(length: int) -> str:
    return "".join(random.choice(string.ascii_letters) for _ in range(length))


def test_round_trip_multiple():
    for _ in range(100):
        plain = random_text(random.randint(1, 32))
        enc = cs.encrypt(plain)
        dec = cs.decrypt(enc)
        assert dec == plain
        assert isinstance(enc, str)
        assert len(enc) > 0


def test_md5_key_index():
    assert cs.md5_key("username") == cs.md5_key("username", None)
    with_index = cs.md5_key("username", 1)
    assert with_index != cs.md5_key("username")
    assert len(with_index) == 32
    assert with_index.isupper()
