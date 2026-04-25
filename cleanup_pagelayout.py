import os
import re

# Props to remove from <PageLayout ... />
PROPS_TO_REMOVE = ['navItems', 'navGroups']

# Imports to check for removal
NAV_IMPORTS = [
    'adminNavItems', 'adminNavGroups', 'playerNavItems', 
    'refereeNavItems', 'coachNavItems', 'publicNavItems'
]

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # 1. Remove props from PageLayout
    # We look for <PageLayout followed by any characters until >
    # This handles multi-line props too.
    
    def remove_props_from_pagelayout(match):
        tag_content = match.group(0)
        for prop in PROPS_TO_REMOVE:
            # Match prop={...} or prop={...} with whitespace
            # Handle cases where it might be on a new line
            pattern = rf'\s*{prop}=\{{[^}}]*\}}'
            tag_content = re.sub(pattern, '', tag_content, flags=re.MULTILINE)
        return tag_content

    content = re.sub(r'<PageLayout[^>]*>', remove_props_from_pagelayout, content, flags=re.DOTALL)

    # 2. Check which NAV_IMPORTS are still used
    # A "use" is the word itself not in an import statement
    
    # First, find all import statements for these items
    # e.g. import { ... } from '@/lib/constants/navigation';
    
    for item in NAV_IMPORTS:
        # If the item is no longer used elsewhere in the file
        # (excluding the import statement itself)
        
        # We'll use a simple check: if the word appears only in the import statement
        # or if it doesn't appear at all outside of where it was removed.
        
        # Check total occurrences
        occurrences = re.findall(rf'\b{item}\b', content)
        
        if len(occurrences) > 0:
            # Check if all occurrences are in import statements
            import_occurrences = re.findall(rf'^import\s+.*?\b{item}\b.*?from.*$', content, re.MULTILINE)
            # This is a bit simplified but usually works for typical JS imports
            
            # If total occurrences == occurrences in import statements, it's unused
            if len(occurrences) == len(re.findall(rf'\b{item}\b', "".join(import_occurrences))):
                # Remove from import statements
                # Handle: import { item, other } from ...
                # Handle: import { item } from ...
                
                # Case 1: item is in a curly brace list
                content = re.sub(rf'({{\s*){item},\s*', r'\1', content)
                content = re.sub(rf',\s*{item}(\s*}})', r'\1', content)
                content = re.sub(rf'{{\s*{item}\s*}}', r'{}', content) # Will leave empty {} to be cleaned next
                
                # Case 2: item is a default or named import without braces (less common for these)
                # But these are usually named imports.
                
                # Clean up empty imports: import {  } from '...';
                content = re.sub(r'import\s+{\s*}\s+from\s+[\'"].*?[\'"];?\n?', '', content)

    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    root_dir = '.'
    processed_count = 0
    for root, dirs, files in os.walk(root_dir):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.next' in dirs:
            dirs.remove('.next')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                if process_file(file_path):
                    print(f"Processed: {file_path}")
                    processed_count += 1
    print(f"Total files updated: {processed_count}")

if __name__ == "__main__":
    main()
