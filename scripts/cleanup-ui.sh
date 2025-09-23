#!/bin/bash
# This script removes unused UI components from the src/components/ui directory.

echo "Removing unused UI components..."

# List of unused component files to be removed
UNUSED_COMPONENTS=(
    "src/components/ui/accordion.tsx"
    "src/components/ui/alert-dialog.tsx"
    "src/components/ui/checkbox.tsx"
    "src/components/ui/collapsible.tsx"
    "src/components/ui/dropdown-menu.tsx"
    "src/components/ui/menubar.tsx"
    "src/components/ui/radio-group.tsx"
    "src/components/ui/scroll-area.tsx"
    "src/components/ui/slider.tsx"
    "src/components/ui/skeleton.tsx"
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
