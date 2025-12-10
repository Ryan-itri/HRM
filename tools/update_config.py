
import re
import os

try:
    # Read Deployment ID
    with open(r'backend/deploy_v8.txt', 'r', encoding='utf-16') as f:
        content = f.read()
        match = re.search(r'Deployed\s+([a-zA-Z0-9_-]+)\s+@', content)
        if match:
            deploy_id = match.group(1)
            print(f"Found Deployment ID: {deploy_id}")
        else:
            print("Could not find Deployment ID in deploy_v7.txt")
            exit(1)

    # Read config.ts
    config_path = r'frontend/src/config.ts'
    with open(config_path, 'r', encoding='utf-8') as f:
        config_content = f.read()

    # Replace URL
    new_url = f"https://script.google.com/macros/s/{deploy_id}/exec"
    new_config = re.sub(r"apiUrl:\s*'.*'", f"apiUrl: '{new_url}'", config_content)

    # Write config.ts
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(new_config)
    
    print("Successfully updated config.ts")

except Exception as e:
    print(f"Error: {e}")
    exit(1)
