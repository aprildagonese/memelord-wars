# Install OS, JSON, and OpenAI libraries.
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set your DigitalOcean serverless inference endpoint and access key
do_endpoint = os.getenv("DO_ENDPOINT")
model_access_key = os.getenv("MODEL_ACCESS_KEY")
model_name = os.getenv("MODEL_NAME")

if __name__ == "__main__":
    client = OpenAI(
        base_url=do_endpoint,
        api_key=model_access_key,
    )

    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user", "content": "What is the capital of France? Please respond in JSON format."}],
        temperature=0.7,
        max_tokens=100
    )

# Prints response's content
    for choice in response.choices:
        print(choice.message.content)
    
    # Print full response details
    print("\nFull response details:")
    print(json.dumps(response.to_dict(), indent=2))