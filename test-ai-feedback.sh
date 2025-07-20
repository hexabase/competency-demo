#!/bin/bash

echo "🔄 Testing AI feedback regeneration..."

# Login to get access token
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser2@example.com&password=password123")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [[ "$ACCESS_TOKEN" == "null" ]]; then
    echo "❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"

# Request AI feedback regeneration
echo "🔄 Requesting AI feedback regeneration..."
FEEDBACK_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/competencies/feedback?force_regenerate=true" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json")

echo "📋 AI feedback response:"
echo "$FEEDBACK_RESPONSE" | jq '.'

# Check if feedback sections have content
STRENGTHS=$(echo "$FEEDBACK_RESPONSE" | jq -r '.feedback.strengths')
IMPROVEMENTS=$(echo "$FEEDBACK_RESPONSE" | jq -r '.feedback.improvements')

echo ""
echo "📊 Feedback sections status:"
echo "- Strengths: ${#STRENGTHS} chars"
echo "- Improvements: ${#IMPROVEMENTS} chars"

if [[ ${#STRENGTHS} -gt 4 ]] && [[ ${#IMPROVEMENTS} -gt 4 ]]; then
    echo "✅ AI feedback regeneration working correctly!"
else
    echo "❌ AI feedback sections are empty or too short"
fi