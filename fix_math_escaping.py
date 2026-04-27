#!/usr/bin/env python3
"""
Fix single-backslash LaTeX commands inside JSX template literals.

Inside a JS/TSX backtick template literal, `\t` is a tab, `\f` is form-feed, etc.
LaTeX commands must use double backslashes: \\frac, \\tau, \\EE, etc.

Strategy:
  - Find all template-literal content between backticks that is passed to
    InlineMath or BlockMath (i.e., inside {`...`} in JSX).
  - Within those strings, replace single \X with \\X where X is a LaTeX command char.

We do this with a careful regex that:
  1. Finds template literals: content between {` and `}
  2. Within each, replaces `\X` (single backslash) with `\\X` where it is not already \\
"""

import re
import sys
import os

# Files to fix (relative to the site directory)
FILES = [
    "components/detailed/DetailedAct3_clean.tsx",
    "components/detailed/DetailedAct4.tsx",
    "components/detailed/DetailedAct5.tsx",
    "components/detailed/DetailedAct6.tsx",
    "components/detailed/DetailedAct7.tsx",
    "components/detailed/DetailedAct8.tsx",
    "components/detailed/DetailedAct9.tsx",
    "components/detailed/DetailedAct11.tsx",
    "components/detailed/DetailedAct12.tsx",
    "components/detailed/DetailedAct13.tsx",
    "components/detailed/DetailedAct14.tsx",
]

# LaTeX command characters that follow a backslash
# We want to fix \alpha, \beta, \frac, \EE, \tau, etc.
# But NOT already-doubled \\alpha (those are fine).
# We match a single backslash NOT preceded by another backslash.
# Use negative lookbehind: (?<!\\)\\(?!\\)  → a backslash not preceded or followed by backslash

def fix_template_literal(match):
    """Fix single backslashes inside a template literal string."""
    content = match.group(0)
    # content is everything between (and including) the backticks: `...`
    # We need to fix single backslashes inside the string content.
    # A "single backslash" = a backslash not part of \\
    # Replace: single \ followed by a letter/{ with \\ followed by same
    # Pattern: (?<!\\)\\(?!\\) → backslash not preceded/followed by backslash
    fixed = re.sub(r'(?<!\\)\\(?!\\)', r'\\\\', content)
    return fixed

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    # Find all template literals in JSX: {`...`}
    # These are the math strings passed to InlineMath/BlockMath
    # Pattern: \{`(content)`\}  where content can span lines
    # We use a non-greedy match

    # We'll process the file looking for template literals inside JSX expressions
    # Pattern: {`...`} where ... may contain newlines
    # Use re.DOTALL to match across newlines

    def fix_jsx_template(m):
        inner = m.group(1)  # content between backticks
        # Fix single backslashes (not already doubled)
        fixed = re.sub(r'(?<!\\)\\(?!\\)', r'\\\\', inner)
        if fixed != inner:
            return '{`' + fixed + '`}'
        return m.group(0)

    # Match {`...`} (JSX template literal expressions), non-greedy, dotall
    result = re.sub(r'\{`(.*?)`\}', fix_jsx_template, original, flags=re.DOTALL)

    if result != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(result)
        # Count changes
        orig_singles = len(re.findall(r'(?<!\\)\\(?!\\)', original))
        new_singles = len(re.findall(r'(?<!\\)\\(?!\\)', result))
        print(f"  Fixed {orig_singles - new_singles} single backslashes in {os.path.basename(filepath)}")
    else:
        print(f"  No changes needed in {os.path.basename(filepath)}")

if __name__ == '__main__':
    site_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    print(f"Processing files in: {site_dir}")
    for rel_path in FILES:
        full_path = os.path.join(site_dir, rel_path)
        if os.path.exists(full_path):
            process_file(full_path)
        else:
            print(f"  NOT FOUND: {full_path}")
