#!/bin/bash
# This script removes unused UI components from the src/components/ui directory.

echo "Removing unused UI components..."

# List of unused component files to be removed
UNUSED_COMPONENTS=(
    "src/components/ui/Accordion.tsx"
    "src/components/ui/AlertDialog.tsx"
    "src/components/ui/Checkbox.tsx"
    "src/components/ui/Collapsible.tsx"
    "src/components/ui/DropdownMenu.tsx"
    "src/components/ui/Menubar.tsx"
    "src/components/ui/RadioGroup.tsx"
    "src/components/ui/ScrollArea.tsx"
    "src/components/ui/Slider.tsx"
    "src/components/ui/Skeleton.tsx"
)

# Loop through the array and remove each file
for component in "${UNUSED_COMPONENTS[@]}"
do
    if [ -f "$component" ]; then
        rm "$component"
        echo "Removed: $component"
    else
        echo "Warning: $component not found."
    fi
done

echo "Cleanup complete."
