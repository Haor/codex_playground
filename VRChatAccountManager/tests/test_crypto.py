import sys, pathlib
sys.path.append(str(pathlib.Path(__file__).resolve().parents[2]))
import random
import string
from VRChatAccountManager.src import crypto_service as cs


def random_text():
    length = random.randint(1, 64)
    return ''.join(random.choice(string.ascii_letters + string.digits) for _ in range(length))


def test_round_trip():
    for _ in range(100):
        text = random_text()
        enc = cs.encrypt(text)
        dec = cs.decrypt(enc)
        assert dec == text


def test_md5_key():
    assert cs.md5_key('username') == '14C4B06B824EC593239362517F538B29'
