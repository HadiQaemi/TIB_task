import hashlib

def generate_static_id(input_string: str) -> str:   
    hash_object = hashlib.sha256(input_string.encode('utf-8'))
    return hash_object.hexdigest()[:32]