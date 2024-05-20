import secrets
import string

def generate_unique_codes(num_codes, code_length, prefix='', suffix=''):
    characters = string.ascii_letters + string.digits
    unique_codes = set()
    
    while len(unique_codes) < num_codes:
        code = prefix + ''.join(secrets.choice(characters) for _ in range(code_length)) + suffix
        unique_codes.add(code)
    
    return list(unique_codes)

if __name__ == "__main__":
    num_codes = int(input("Enter the number of codes to generate: "))
    code_length = int(input("Enter the length of each code: "))
    prefix = input("Enter a prefix for the codes (optional): ")
    
    codes = generate_unique_codes(num_codes, code_length, prefix)
    
    print("Generated codes:")
    for code in codes:
        print(code)
