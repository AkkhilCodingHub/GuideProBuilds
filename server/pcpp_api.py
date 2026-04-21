import sys
import json
import asyncio
from pcpartpicker import API

async def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing part type"}))
        return

    part_type = sys.argv[1]
    region = sys.argv[2] if len(sys.argv) > 2 else "in"
    query = sys.argv[3] if len(sys.argv) > 3 else None

    try:
        api = API(region)
        
        if part_type == "all":
            data = await api.retrieve_all()
        else:
            data = await api.retrieve(part_type)
        
        # Convert to dictionary and filter by query if provided
        result = data.to_dict()
        
        # The library returns a dictionary with metadata and a list of parts
        # Structure varies slightly, but usually it's {'parts': [...]}
        parts = result.get('parts', [])
        
        if query:
            parts = [p for p in parts if query.lower() in p.get('name', '').lower()]
            
        print(json.dumps(parts))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    asyncio.run(main())
