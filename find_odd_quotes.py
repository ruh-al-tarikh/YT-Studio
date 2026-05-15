with open('js/app.js', 'r') as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if line.count("'") % 2 != 0:
            # Check if it's potentially escaped or inside other quotes
            # This is a simple check
            print(f"Line {i+1}: {line.strip()}")
