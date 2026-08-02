// /model — List models with pagination.

import { MODELS } from "../../lib/catalog.js";
import { formatIDR } from "../lib/format.js";

const IDR_RATE = 18_000;
const PAGE_SIZE = 2;

function getModelPage(page) {
  const start = page * PAGE_SIZE;
  const slice = MODELS.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(MODELS.length / PAGE_SIZE);

  let text = `📊 *Model (${page + 1}/${totalPages})*\n\n`;

  for (const m of slice) {
    const inputIDR = formatIDR(Math.round(m.inputPrice * IDR_RATE));
    const outputIDR = formatIDR(Math.round(m.outputPrice * IDR_RATE));
    text += `*${m.name}*\n`;
    text += `\`${m.slug}\`\n`;
    text += `${m.tier} · ${m.context} · ${m.output}\n`;
    text += `In: ${inputIDR}/M · Out: ${outputIDR}/M\n\n`;
  }

  const buttons = [];
  if (page > 0) buttons.push({ text: "◀ Prev", callback_data: `model:${page - 1}` });
  if (start + PAGE_SIZE < MODELS.length) buttons.push({ text: "Next ▶", callback_data: `model:${page + 1}` });

  return { text, buttons };
}

export function modelHandler() {
  return async (ctx) => {
    const { text, buttons } = getModelPage(0);
    ctx.reply(text, {
      parse_mode: "Markdown",
      reply_markup: buttons.length ? { inline_keyboard: [buttons] } : undefined,
    });
  };
}

export function modelCallbackHandler() {
  return async (ctx) => {
    const page = parseInt(ctx.callbackQuery.data.split(":")[1]) || 0;
    const { text, buttons } = getModelPage(page);
    ctx.editMessageText(text, {
      parse_mode: "Markdown",
      reply_markup: buttons.length ? { inline_keyboard: [buttons] } : undefined,
    });
    ctx.answerCallbackQuery();
  };
}
