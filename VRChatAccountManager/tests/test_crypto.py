from src import crypto_service as cs


def test_roundtrip():
    for _ in range(10):
        plain = "hello world"
        enc = cs.encrypt(plain)
        assert cs.decrypt(enc) == plain


def test_md5_key():
    assert cs.md5_key("username") == "14C4B06B824EC593239362517F538B29"
