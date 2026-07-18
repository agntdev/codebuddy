import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard, registerMainMenuItem } from "../toolkit/index.js";

registerMainMenuItem({ label: "💡 Examples", data: "examples:show", order: 30 });

const EXAMPLES_TEXT =
  "💡 Here are some Python questions you can ask me:\n\n" +
  "• How do I create a list?\n" +
  "• Write a function that adds two numbers\n" +
  "• What is a dictionary?\n" +
  "• How do I read a file?\n" +
  "• Show me a for loop\n" +
  "• How do I handle errors?\n\n" +
  "Just type your Python question and I'll help!";

const backToMenu = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

const composer = new Composer<Ctx>();

composer.command("examples", async (ctx) => {
  await ctx.reply(EXAMPLES_TEXT, { reply_markup: backToMenu });
});

composer.callbackQuery("examples:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(EXAMPLES_TEXT, { reply_markup: backToMenu });
});

export default composer;
