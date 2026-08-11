import sys
import json

try:
    from dataclasses import is_dataclass, asdict
except ImportError:
    is_dataclass, asdict = None, None

from pcpartpicker import API

PCPP_TYPE_MAP = {
    "cpu": "cpu",
    "gpu": "video-card",
    "video-card": "video-card",
    "ram": "memory",
    "memory": "memory",
    "storage": "internal-hard-drive",
    "internal-hard-drive": "internal-hard-drive",
    "psu": "power-supply",
    "power-supply": "power-supply",
    "motherboard": "motherboard",
    "case": "case",
    "cooling": "cpu-cooler",
    "cpu-cooler": "cpu-cooler"
}

def to_serializable(obj):
    if isinstance(obj, (str, int, float, bool, type(None))):
        return obj
    if hasattr(obj, 'to_dict') and callable(obj.to_dict):
        return to_serializable(obj.to_dict())
    if is_dataclass and is_dataclass(obj):
        return to_serializable(asdict(obj))
    if hasattr(obj, '__dict__'):
        return {k: to_serializable(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
    if isinstance(obj, dict):
        return {k: to_serializable(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set)):
        return [to_serializable(i) for i in obj]
    return str(obj)

def fetch_parts(part_type, region):
    api = API(region)
    if part_type == "all":
        data = api.retrieve_all()
    else:
        data = api.retrieve(part_type)
    
    raw_list = []
    if hasattr(data, 'parts') and data.parts:
        raw_list = data.parts
    elif hasattr(data, 'to_dict'):
        d = data.to_dict()
        if isinstance(d, dict):
            raw_list = d.get('parts') or d.get('data') or []
        elif isinstance(d, list):
            raw_list = d
    elif isinstance(data, list):
        raw_list = data

    return [to_serializable(p) for p in raw_list]

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing part type"}))
        return

    raw_type = sys.argv[1].lower()
    part_type = PCPP_TYPE_MAP.get(raw_type, raw_type)
    region = sys.argv[2] if len(sys.argv) > 2 else "in"
    query = sys.argv[3] if len(sys.argv) > 3 else None

    try:
        parts = fetch_parts(part_type, region)
        
        if not parts and region != "us":
            parts = fetch_parts(part_type, "us")

        if query and parts:
            parts = [p for p in parts if isinstance(p, dict) and query.lower() in str(p.get('name', '')).lower()]

        print(json.dumps(parts))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
