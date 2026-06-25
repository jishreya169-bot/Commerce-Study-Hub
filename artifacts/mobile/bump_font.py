import os
import re

directories = ['app', 'components']
regex = re.compile(r'fontSize:\s*(\d+)')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    def replace_func(match):
        current_size = int(match.group(1))
        new_size = current_size + 5
        return f'fontSize: {new_size}'

    new_content = regex.sub(replace_func, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for d in directories:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))
