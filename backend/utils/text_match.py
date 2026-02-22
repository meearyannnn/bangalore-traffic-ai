from difflib import get_close_matches

def normalize(text: str) -> str:
    if not text:
        return ""
    return (
        text.lower()
        .replace(".", "")
        .replace(",", "")
        .replace("(", "")
        .replace(")", "")
        .strip()
    )

def fuzzy_match(query: str, choices: list[str], cutoff: float = 0.6):
    return get_close_matches(query, choices, n=5, cutoff=cutoff)
