{
  "name": "UserAchievement",
  "type": "object",
  "properties": {
    "achievement_type": {
      "type": "string",
      "enum": [
        "first_chat",
        "10_conversations",
        "task_master",
        "creative_genius",
        "knowledge_seeker",
        "week_streak",
        "month_streak"
      ],
      "description": "Type of achievement"
    },
    "title": {
      "type": "string",
      "description": "Achievement title"
    },
    "description": {
      "type": "string",
      "description": "Achievement description"
    },
    "points": {
      "type": "integer",
      "description": "Points awarded"
    },
    "unlocked_date": {
      "type": "string",
      "format": "date-time",
      "description": "When achievement was unlocked"
    }
  },
  "required": [
    "achievement_type",
    "title",
    "points"
  ]
}