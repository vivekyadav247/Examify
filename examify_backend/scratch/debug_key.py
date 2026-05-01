import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GROQ_API_KEY")
if key:
    print(f"Key length: {len(key)}")
    print(f"Starts with gsk_: {key.startswith('gsk_')}")
    print(f"Contains spaces: {' ' in key}")
    print(f"Ends with newline or space: {key.endswith('\n') or key.endswith(' ')}")
else:
    print("GROQ_API_KEY not found in environment.")
