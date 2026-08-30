{
  "name": "KnowledgeBase",
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Title of the knowledge source"
    },
    "content": {
      "type": "string",
      "description": "Extracted content from the uploaded file/website"
    },
    "source_type": {
      "type": "string",
      "enum": [
        "file",
        "website",
        "text"
      ],
      "description": "Type of knowledge source"
    },
    "file_url": {
      "type": "string",
      "description": "URL of the uploaded file if applicable"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether this knowledge is currently active"
    }
  },
  "required": [
    "title",
    "content",
    "source_type"
  ]
}