import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def validate_json_files():
    errors = []
    for path in ROOT.rglob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except Exception as e:
            errors.append((str(path.relative_to(ROOT)), str(e)))
    return errors

if __name__ == "__main__":
    errors = validate_json_files()
    if errors:
        print("JSON validation failed:")
        for path, err in errors:
            print(f"- {path}: {err}")
        raise SystemExit(1)
    print("All JSON files are valid.")
