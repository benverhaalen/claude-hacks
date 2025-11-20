#!/bin/bash

# End-to-end test: Extract events from syllabus → Generate .ics file

echo "🧪 TESTING END-TO-END WORKFLOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Sample syllabus text
SYLLABUS_TEXT="CS 540 - Artificial Intelligence
Fall 2024

Course Schedule:
Week 1 (Sept 3): Introduction to AI
Week 5 (Oct 1): Midterm Exam
Week 10 (Nov 5): Final Project due at 11:59 PM
Week 15 (Dec 10): Final Exam

Assignments:
- Homework 1: Due September 15 at 11:59 PM
- Homework 2: Due October 20
- Quiz 1: September 22 in class
- Final Paper: Due December 5"

echo "📄 Step 1: Extract events from syllabus"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EXTRACT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$SYLLABUS_TEXT\"}")

# Check if extraction succeeded
if echo "$EXTRACT_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  EVENT_COUNT=$(echo "$EXTRACT_RESPONSE" | jq '.events | length')
  echo "✅ Extracted $EVENT_COUNT events"

  # Show event summary
  echo ""
  echo "Events:"
  echo "$EXTRACT_RESPONSE" | jq -r '.events[] | "  • \(.event_name) (\(.category)) - \(.date)"'
  echo ""
else
  echo "❌ Extraction failed"
  echo "$EXTRACT_RESPONSE" | jq '.'
  exit 1
fi

# Extract just the events array
EVENTS=$(echo "$EXTRACT_RESPONSE" | jq '.events')

echo ""
echo "📅 Step 2: Generate .ics calendar file"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate ICS file
OUTPUT_FILE="/tmp/CS540_calendar.ics"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$OUTPUT_FILE" -X POST http://localhost:3000/api/generate-ics \
  -H "Content-Type: application/json" \
  -d "{
    \"events\": $EVENTS,
    \"courseCode\": \"CS540\",
    \"courseName\": \"Artificial Intelligence\"
  }")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ ICS file generated: $OUTPUT_FILE"

  # Show file stats
  FILE_SIZE=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
  EVENT_COUNT=$(grep -c "BEGIN:VEVENT" "$OUTPUT_FILE")

  echo "   Size: $FILE_SIZE bytes"
  echo "   Events: $EVENT_COUNT"
  echo ""

  # Show first event
  echo "📋 Preview (first event):"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  awk '/BEGIN:VEVENT/,/END:VEVENT/ {print}' "$OUTPUT_FILE" | head -20
  echo ""

  echo "✅ SUCCESS! Calendar ready to import"
  echo ""
  echo "To import:"
  echo "  • macOS: open $OUTPUT_FILE"
  echo "  • Google Calendar: Import from file"
  echo ""
else
  echo "❌ ICS generation failed (HTTP $HTTP_CODE)"
  cat "$OUTPUT_FILE"
  exit 1
fi
