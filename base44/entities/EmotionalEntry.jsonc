{
  "name": "EmotionalEntry",
  "type": "object",
  "properties": {
    "date": {
      "type": "string",
      "format": "date",
      "description": "Entry date"
    },
    "mood": {
      "type": "string",
      "enum": [
        "very_happy",
        "happy",
        "neutral",
        "sad",
        "stressed",
        "anxious",
        "energetic",
        "tired"
      ],
      "description": "User's mood"
    },
    "energy_level": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "description": "Energy level (1-10)"
    },
    "notes": {
      "type": "string",
      "description": "Journal notes"
    },
    "ai_insights": {
      "type": "string",
      "description": "AI-generated insights and suggestions"
    },
    "detected_from_chat": {
      "type": "boolean",
      "default": false,
      "description": "Whether mood was auto-detected from chat"
    }
  },
  "required": [
    "date",
    "mood"
  ]
}