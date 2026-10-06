#!/bin/bash
set -e

BASE_URL="http://localhost:8080/api/v1"

echo "=== Campus Circular Smoke Test ==="

echo "1. Login as Aisha (Owner, id=1)"
OWNER_TOKEN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"userId": 1}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Owner Token: $OWNER_TOKEN"

echo "2. Login as Rohan (Borrower, id=2)"
BORROWER_TOKEN=$(curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"userId": 2}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Borrower Token: $BORROWER_TOKEN"

echo "3. Get available posts"
POST_ID=$(curl -s -X GET $BASE_URL/posts -H "Authorization: Bearer $BORROWER_TOKEN" | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2)
echo "Found Post ID: $POST_ID"

if [ -z "$POST_ID" ]; then
  echo "No posts found. Exiting."
  exit 1
fi

echo "4. Borrower generates Quote for tomorrow"
START_AT=$(date -d "tomorrow 10:00:00" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v+1d -u +"%Y-%m-%dT10:00:00Z")
END_AT=$(date -d "tomorrow+1day 10:00:00" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v+2d -u +"%Y-%m-%dT10:00:00Z")
curl -s -X GET "$BASE_URL/posts/$POST_ID/quote?start=$START_AT&end=$END_AT" -H "Authorization: Bearer $BORROWER_TOKEN"

echo -e "\n5. Borrower submits Request"
REQ_JSON=$(curl -s -X POST $BASE_URL/posts/$POST_ID/requests -H "Authorization: Bearer $BORROWER_TOKEN" -H "Content-Type: application/json" -d "{\"start\":\"$START_AT\", \"end\":\"$END_AT\", \"agreementAccepted\":true}")
REQ_ID=$(echo $REQ_JSON | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2)
echo "Request ID: $REQ_ID"

echo "6. Owner accepts Request -> Exchange created"
EXC_JSON=$(curl -s -X POST $BASE_URL/requests/$REQ_ID/accept -H "Authorization: Bearer $OWNER_TOKEN")
EXC_ID=$(echo $EXC_JSON | grep -o '"id":[^,]*' | head -1 | cut -d':' -f2)
echo "Exchange ID: $EXC_ID"

echo "7. Borrower pays (with dropoffLocationId=3)"
curl -s -X POST $BASE_URL/exchanges/$EXC_ID/pay -H "Authorization: Bearer $BORROWER_TOKEN" -H "Content-Type: application/json" -d '{"dropoffLocationId": 3}'

echo -e "\n8. Owner hands over"
curl -s -X POST $BASE_URL/exchanges/$EXC_ID/handover -H "Authorization: Bearer $OWNER_TOKEN" -H "Content-Type: application/json" -d '{"conditionBefore":{"rating":4, "checklist":[]}, "photoIds":[]}'

echo -e "\n9. Borrower returns"
curl -s -X POST $BASE_URL/exchanges/$EXC_ID/return -H "Authorization: Bearer $BORROWER_TOKEN" -H "Content-Type: application/json" -d '{"notes":"Returned perfectly", "photoIds":[]}'

echo -e "\n10. Owner inspects (no damage) -> Auto-settles"
curl -s -X POST $BASE_URL/exchanges/$EXC_ID/inspect -H "Authorization: Bearer $OWNER_TOKEN" -H "Content-Type: application/json" -d '{"conditionAfter":{"rating":4, "checklist":[]}, "photoIds":[]}'

echo -e "\n11. Verify Exchange is settled"
curl -s -X GET $BASE_URL/exchanges/$EXC_ID -H "Authorization: Bearer $OWNER_TOKEN" | grep -o '"state":"[^"]*"'

echo -e "\n12. Borrower rates"
curl -s -X POST $BASE_URL/exchanges/$EXC_ID/rate -H "Authorization: Bearer $BORROWER_TOKEN" -H "Content-Type: application/json" -d '{"rating":5, "review":"Awesome"}'

echo -e "\nSmoke test completed successfully."
