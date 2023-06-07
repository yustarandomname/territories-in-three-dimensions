def main():
    seed_number = int(input("Please enter a four-digit number:\n[####] "))
    number = seed_number
    already_seen = set()
    counter = 0

    while number not in already_seen:
        counter += 1
        already_seen.add(number)
        number = (number * number) % 100000  # zfill adds padding of zeroes
        print(f"#{counter}: {number / 100000}")

    print(f"We began with {seed_number} and"
        f" have repeated ourselves after {counter} steps"
        f" with {number}.")
    
    already_seen = list(already_seen)

    # Amount of numbers between 0 and 10000
    



if __name__ == "__main__":
    main()