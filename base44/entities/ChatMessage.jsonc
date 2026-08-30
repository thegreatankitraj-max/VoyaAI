{
  "name": "ChatMessage",
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "description": "The message content"
    },
    "role": {
      "type": "string",
      "enum": [
        "user",
        "assistant"
      ],
      "description": "Who sent the message"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "When the message was sent"
    },
    "session_id": {
      "type": "string",
      "description": "Identifier for the chat session this message belongs to."
    },
    "file_urls": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "URLs of attached files"
    },
    "file_names": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Original names of attached files"
    },
    "file_types": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "MIME types of attached files"
    }
  },
  "required": [
    "content",
    "role",
    "session_id"
  ]
}