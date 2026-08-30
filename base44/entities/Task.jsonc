{
  "name": "Task",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title"
    },
    "description": {
      "type": "string",
      "description": "Task details"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "in_progress",
        "completed"
      ],
      "default": "pending",
      "description": "Task status"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "default": "medium",
      "description": "Task priority"
    },
    "due_date": {
      "type": "string",
      "format": "date",
      "description": "Due date"
    },
    "created_by_ai": {
      "type": "boolean",
      "default": false,
      "description": "Whether this task was created by AI"
    },
    "session_id": {
      "type": "string",
      "description": "Related chat session"
    }
  },
  "required": [
    "title"
  ]
}