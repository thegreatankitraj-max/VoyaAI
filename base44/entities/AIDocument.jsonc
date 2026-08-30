{
  "name": "AIDocument",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Document title"
    },
    "content": {
      "type": "string",
      "description": "Document content"
    },
    "document_type": {
      "type": "string",
      "enum": [
        "summary",
        "generated_text",
        "analysis",
        "brainstorm",
        "code",
        "other"
      ],
      "default": "other",
      "description": "Type of document"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Document tags for organization"
    },
    "session_id": {
      "type": "string",
      "description": "Related chat session"
    },
    "is_favorite": {
      "type": "boolean",
      "default": false,
      "description": "Mark as favorite"
    }
  },
  "required": [
    "title",
    "content"
  ]
}