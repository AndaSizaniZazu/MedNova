"""
Skill Loader
Reads MedNova SKILL.md files and exposes their bodies as system prompts
"""

import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict

logger = logging.getLogger(__name__)

SKILLS_DIR = Path(__file__).resolve().parents[2] / "skills"

# Shared privacy rules that every feature skill must follow
COMPLIANCE_SKILL = "mednova-popia-compliance"


@dataclass(frozen=True)
class Skill:
    """A parsed SKILL.md file"""
    name: str
    description: str
    body: str


def _parse_skill(path: Path) -> Skill:
    """Split YAML frontmatter (name, description) from the markdown body"""
    text = path.read_text(encoding="utf-8")
    meta: Dict[str, str] = {}
    body = text

    if text.startswith("---"):
        _, frontmatter, body = text.split("---", 2)
        for line in frontmatter.strip().splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()

    return Skill(
        name=meta.get("name", path.parent.name),
        description=meta.get("description", ""),
        body=body.strip(),
    )


@lru_cache(maxsize=None)
def load_skills() -> Dict[str, Skill]:
    """Load every skill under backend/skills, keyed by skill name"""
    skills: Dict[str, Skill] = {}
    for path in sorted(SKILLS_DIR.glob("*/SKILL.md")):
        skill = _parse_skill(path)
        skills[skill.name] = skill
    logger.info(f"Loaded {len(skills)} MedNova skills from {SKILLS_DIR}")
    return skills


def get_skill(name: str) -> Skill:
    """Return a skill by name, raising KeyError if it is not installed"""
    skills = load_skills()
    if name not in skills:
        raise KeyError(f"Skill '{name}' not found in {SKILLS_DIR}")
    return skills[name]
