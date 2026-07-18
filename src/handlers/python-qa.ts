import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

interface KnowledgeEntry {
  keywords: string[];
  title: string;
  code: string;
  explanation: string;
  nextStep: string;
}

const knowledge: KnowledgeEntry[] = [
  {
    keywords: ["list", "array", "append", "item"],
    title: "Lists in Python",
    code: "my_list = [1, 2, 3]\nmy_list.append(4)\nprint(my_list)  # [1, 2, 3, 4]",
    explanation: "Lists store multiple items in order. Use append() to add items, and access them by index starting at 0.",
    nextStep: "Try removing an item with my_list.remove(2) or popping with my_list.pop().",
  },
  {
    keywords: ["dictionary", "dict", "key", "value", "hash map"],
    title: "Dictionaries in Python",
    code: 'my_dict = {"name": "Alice", "age": 25}\nprint(my_dict["name"])  # Alice\nmy_dict["city"] = "NYC"',
    explanation: "Dictionaries store key-value pairs. Access values by key and add new pairs by assigning to a new key.",
    nextStep: "Try iterating with for key, value in my_dict.items(): print(key, value)",
  },
  {
    keywords: ["function", "def", "return", "method"],
    title: "Functions in Python",
    code: "def greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))",
    explanation: "Functions are reusable blocks of code. Define them with def, pass parameters, and return results.",
    nextStep: "Try adding a default parameter: def greet(name='World'):",
  },
  {
    keywords: ["class", "object", "oop", "instance", "self"],
    title: "Classes in Python",
    code: "class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return f'{self.name} says woof!'\n\nmy_dog = Dog('Rex')\nprint(my_dog.bark())",
    explanation: "Classes bundle data and behavior. __init__ sets up the object, and methods define what it can do.",
    nextStep: "Try adding more attributes or methods to your class.",
  },
  {
    keywords: ["loop", "for", "while", "iterate", "repeat"],
    title: "Loops in Python",
    code: "for i in range(5):\n    print(i)\n\n# While loop\nx = 0\nwhile x < 3:\n    print(x)\n    x += 1",
    explanation: "For loops iterate over a sequence. While loops repeat until a condition becomes false.",
    nextStep: "Try using break to exit early or continue to skip an iteration.",
  },
  {
    keywords: ["if", "else", "elif", "condition", "conditional", "compare"],
    title: "Conditionals in Python",
    code: "x = 10\nif x > 5:\n    print('Big')\nelif x > 0:\n    print('Small')\nelse:\n    print('Negative')",
    explanation: "If/elif/else let your code make decisions. Conditions are evaluated top-down.",
    nextStep: "Try using logical operators: and, or, not.",
  },
  {
    keywords: ["file", "read", "write", "open"],
    title: "File I/O in Python",
    code: "# Writing to a file\nwith open('data.txt', 'w') as f:\n    f.write('Hello, file!')\n\n# Reading from a file\nwith open('data.txt', 'r') as f:\n    content = f.read()\n    print(content)",
    explanation: "Use open() with a context manager (with) to safely read and write files. The context manager closes the file automatically.",
    nextStep: "Try reading line by line with f.readlines() or iterating with for line in f.",
  },
  {
    keywords: ["import", "module", "library", "package"],
    title: "Importing in Python",
    code: "import math\nprint(math.sqrt(16))  # 4.0\n\nfrom random import randint\nprint(randint(1, 10))",
    explanation: "Import lets you use code from other modules. You can import the whole module or specific items.",
    nextStep: "Try creating your own module with functions and importing it.",
  },
  {
    keywords: ["comprehension", "list comprehension", "filter", "map"],
    title: "List Comprehensions",
    code: "squares = [x**2 for x in range(5)]\nprint(squares)  # [0, 1, 4, 9, 16]\n\nevens = [x for x in range(10) if x % 2 == 0]\nprint(evens)  # [0, 2, 4, 6, 8]",
    explanation: "List comprehensions create lists in a single line. You can add conditions to filter items.",
    nextStep: "Try dictionary comprehensions: {x: x**2 for x in range(5)}",
  },
  {
    keywords: ["try", "except", "error", "exception", "handle", "catch"],
    title: "Error Handling in Python",
    code: "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print('Cannot divide by zero!')\nexcept Exception as e:\n    print(f'Error: {e}')\nfinally:\n    print('This always runs')",
    explanation: "Try/except blocks catch errors so your program doesn't crash. Always catches specific exceptions first.",
    nextStep: "Try raising your own errors with raise ValueError('message').",
  },
  {
    keywords: ["string", "str", "text", "format", "concatenat"],
    title: "String Operations in Python",
    code: "name = 'Python'\nprint(len(name))       # 6\nprint(name.upper())    # PYTHON\nprint(name.lower())    # python\nprint(f'Hello, {name}!')",
    explanation: "Strings have many built-in methods. Use f-strings for easy formatting.",
    nextStep: "Try string slicing: name[0:3] gives 'Pyt'.",
  },
  {
    keywords: ["set", "unique", "deduplicate"],
    title: "Sets in Python",
    code: "my_set = {1, 2, 3, 3, 2}\nprint(my_set)  # {1, 2, 3}\n\nmy_set.add(4)\nmy_set.remove(1)\nprint(my_set)  # {2, 3, 4}",
    explanation: "Sets store unique items and support mathematical operations like union and intersection.",
    nextStep: "Try set operations: a | b for union, a & b for intersection.",
  },
];

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isPythonQuestion(text: string): boolean {
  const lower = text.toLowerCase();
  const pythonKeywords = [
    "python", "def", "class", "import", "print(", "self.", "__init__",
    "for ", "while ", "if ", "elif ", "else:", "try:", "except:",
    "lambda", "list", "dict", "tuple", "set", "str(", "int(", "float(",
    "len(", "range(", "append", "remove", "pop(", "items()",
    "read", "write", "open", "with open", "pip ", "conda ",
    "error", "string", "comprehension",
  ];
  return pythonKeywords.some((kw) => lower.includes(kw));
}

function findBestMatch(text: string): KnowledgeEntry | null {
  const lower = text.toLowerCase();
  let best: KnowledgeEntry | null = null;
  let bestScore = 0;
  for (const entry of knowledge) {
    const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  return bestScore > 0 ? best : null;
}

function formatResponse(entry: KnowledgeEntry, tone: "simple" | "advanced"): string {
  if (tone === "advanced") {
    return (
      `📚 ${entry.title}\n\n` +
      `\`\`\`python\n${entry.code}\n\`\`\`\n\n` +
      `${entry.explanation}\n\n` +
      `💡 ${entry.nextStep}`
    );
  }
  return (
    `📚 ${entry.title}\n\n` +
    `\`\`\`python\n${entry.code}\n\`\`\`\n\n` +
    `${entry.explanation}\n\n` +
    `💡 ${entry.nextStep}`
  );
}

function checkRateLimit(timestamps: number[]): boolean {
  const now = Date.now();
  const recent = timestamps.filter((t) => now - t < RATE_WINDOW_MS);
  return recent.length < RATE_LIMIT;
}

function updateRecentMessages(session: Ctx["session"], role: "user" | "bot", text: string): void {
  if (!session.recentMessages) session.recentMessages = [];
  session.recentMessages.push({ role, text, ts: Date.now() });
  if (session.recentMessages.length > 3) {
    session.recentMessages = session.recentMessages.slice(-3);
  }
}

function handleFollowUp(session: Ctx["session"], text: string): string | null {
  const recent = session.recentMessages ?? [];
  const lastBotMsg = [...recent].reverse().find((m) => m.role === "bot");
  if (!lastBotMsg) return null;
  const lower = text.toLowerCase();
  const followUpWords = ["more", "explain", "again", "elaborate", "detail", "another", "next", "continue", "also", "add"];
  return followUpWords.some((w) => lower.includes(w)) ? lastBotMsg.text : null;
}

const composer = new Composer<Ctx>();

composer.on("message:text", async (ctx, next) => {
  const text = ctx.message.text;
  if (text.startsWith("/")) return next();

  if (!isPythonQuestion(text)) return next();

  if (!ctx.session.rateLimitTimestamps) ctx.session.rateLimitTimestamps = [];
  ctx.session.rateLimitTimestamps = ctx.session.rateLimitTimestamps.filter(
    (t) => Date.now() - t < RATE_WINDOW_MS,
  );

  if (!checkRateLimit(ctx.session.rateLimitTimestamps)) {
    await ctx.reply("You've asked a lot of questions recently! Take a break and try again in a bit.");
    return;
  }

  ctx.session.rateLimitTimestamps.push(Date.now());

  const tone = ctx.session.tone ?? "simple";

  const followUpReply = handleFollowUp(ctx.session, text);
  if (followUpReply) {
    const msg = `Here's what we covered before:\n\n${followUpReply}\n\n💡 Ask something new or say "more" to explore further.`;
    updateRecentMessages(ctx.session, "bot", msg);
    await ctx.reply(msg);
    return;
  }

  const match = findBestMatch(text);
  if (match) {
    const response = formatResponse(match, tone);
    updateRecentMessages(ctx.session, "user", text);
    updateRecentMessages(ctx.session, "bot", response);
    await ctx.reply(response, {
      reply_markup: inlineKeyboard([
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    });
  } else {
    updateRecentMessages(ctx.session, "user", text);
    const msg = "Hmm, I'm not sure what Python topic you're asking about. Could you be more specific?\n\nFor example:\n• How do I create a list?\n• Write a function\n• What is a dictionary?";
    updateRecentMessages(ctx.session, "bot", msg);
    await ctx.reply(msg);
  }
});

export default composer;
