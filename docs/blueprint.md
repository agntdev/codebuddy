# CodeBuddy — Bot specification

**Archetype:** education

**Voice:** beginner-friendly and concise — write every user-facing message, button label, error, and empty state in this voice.

CodeBuddy is a Telegram bot that automatically replies to Python questions with short, readable code snippets and explanations for beginner learners. It provides examples, usage notes, and follow-up suggestions without executing user code.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- Beginner Python learners
- Students
- Self-learners
- Bootcamp attendees

## Success criteria

- Users receive accurate Python code snippets with explanations for their questions
- Bot maintains context for follow-up questions in conversations
- Rate limiting prevents abuse while allowing sufficient learning interactions

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu with bot introduction and usage instructions
- **/help** (command, actor: user, command: /help) — Show usage instructions and sample prompts
- **/examples** (command, actor: user, command: /examples) — Display a short list of example Python questions the bot can answer

## Flows

### Auto-reply to Python questions
_Trigger:_ natural language question about Python

1. Detect Python question in chat or DM
2. Generate code snippet with explanation
3. Send response with code, explanation, and next step suggestion

_Data touched:_ User profile, Conversation context

### Follow-up questions
_Trigger:_ User asks follow-up question

1. Check recent conversation context
2. Generate relevant response using context
3. Update conversation context

_Data touched:_ Conversation context

### Rate limiting
_Trigger:_ User exceeds reply limit

1. Detect rate limit threshold
2. Send rate limit warning message
3. Prevent additional replies until reset

_Data touched:_ User profile

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User profile** _(retention: persistent)_ — Minimal user record for rate-limiting and personalization
  - fields: Telegram user id, Username, Rate limit counter, Tone preference (simple/advanced)
- **Conversation context** _(retention: session)_ — Short recent history for follow-up questions
  - fields: Last 3 messages, Timestamps
- **Snippet response** _(retention: none)_ — Generated code example and explanation
  - fields: Code block, Explanation, Examples, Next step suggestion

## Integrations

- **Telegram** (required) — Bot API messaging and group management
- **Admin Notifications** (required) — Error and abuse alerts to admin account
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Configure rate limit thresholds
- Enable/disable auto-reply in specific groups
- Set admin account for error notifications
- Adjust tone preference options

## Notifications

- Admin receives error alerts when bot fails to generate a response
- Admin receives abuse notices when rate limits are exceeded

## Permissions & privacy

- Only store minimal user data (id, username)
- Conversation context is limited to last 3 messages
- No code execution or user-submitted code storage
- Auto-reply only in chats where bot is explicitly enabled

## Edge cases

- Ambiguous Python questions that require clarification
- Non-Python questions that need to be ignored
- Group chat messages with bot-disabling commands
- Rate limit threshold exceeded by user

## Required tests

- Verify auto-reply works for common Python questions in DMs and groups
- Test follow-up questions maintain context coherence
- Validate rate limiting prevents excessive replies
- Ensure bot ignores non-Python questions and bot-disabling commands

## Assumptions

- Natural language detection of Python questions is sufficient for initial implementation
- Beginner-friendly tone is appropriate for target audience
- Rate limit of 10 replies/hour is reasonable for learning use
