{
  "name": "AIPersona",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Persona name (e.g., 'Designer Alex', 'Developer Sam')"
    },
    "role": {
      "type": "string",
      "enum": [
        "designer",
        "developer",
        "marketer",
        "writer",
        "analyst",
        "therapist",
        "coach"
      ],
      "description": "Persona's professional role"
    },
    "personality": {
      "type": "string",
      "description": "Personality traits and communication style"
    },
    "expertise": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Areas of expertise"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether this persona is currently active"
    }
  },
  "required": [
    "name",
    "role"
  ]
}