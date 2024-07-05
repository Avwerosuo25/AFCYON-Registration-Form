import secrets
import string

def generate_unique_code(chaplaincy_abbr, code_length=7):
    characters = string.ascii_letters + string.digits
    code = chaplaincy_abbr + ''.join(secrets.choice(characters) for _ in range(code_length - len(chaplaincy_abbr)))
    return code

def save_code_to_file(user_info, code, filename='codes.txt'):
    with open(filename, 'a') as file:
        file.write(f"Name: {user_info['name']}, Age: {user_info['age']}, Gender: {user_info['gender']}, "
                   f"Health Issues: {user_info['health_issues']}, Chaplaincy: {user_info['chaplaincy']}, Code: {code}\n")

if __name__ == "__main__":
    chaplaincies = {
        1: ('St. Mathew\'s Boricamp', 'SMB'),
        2: ('Stella Maris Pathfinder', 'SMP'),
        3: ('St Michael\'s Onne', 'SMO'),
        4: ('St John Paul Effurun', 'SJP'),
        5: ('St. Bernard Abak', 'SBA'),
        6: ('Queen of Apostle Airforce', 'QAC'),
        7: ('St. Gregory Elele', 'SGE')
    }

    user_info = {}
    
    user_info['name'] = input("Enter your full name: ")
    user_info['age'] = input("Enter your age: ")

    while True:
        gender = input("Enter your gender (male/female): ").strip().lower()
        if gender in ['male', 'female']:
            user_info['gender'] = gender
            break
        else:
            print("Invalid Gender. Please enter either 'male' or 'female'.")

    health_issues = input("Any underlying health issues? (yes/no): ").strip().lower()
    if health_issues == 'yes':
        user_info['health_issues'] = input("Please state the underlying health issues: ")
    else:
        user_info['health_issues'] = 'None'

    while True:
        print("Choose your chaplaincy from the list below:")
        for key, value in chaplaincies.items():
            print(f"{key}. {value[0]}")
        
        try:
            chaplaincy_choice = int(input("Enter the number corresponding to your chaplaincy: "))
            if chaplaincy_choice in chaplaincies:
                chaplaincy_name, chaplaincy_abbr = chaplaincies[chaplaincy_choice]
                user_info['chaplaincy'] = chaplaincy_name
                code = generate_unique_code(chaplaincy_abbr)
                break
            else:
                print("Error: Invalid chaplaincy number. Please enter a valid number.")
        except ValueError:
            print("Error: Invalid input. Please enter a valid number.")
    
    print(f"Generated code: {code}")
    
    save_to_file = input("Do you want to save the code to a file? (yes/no): ").strip().lower()
    if save_to_file == 'yes':
        save_code_to_file(user_info, code)
        print("Code has been saved to 'codes.txt'.")
