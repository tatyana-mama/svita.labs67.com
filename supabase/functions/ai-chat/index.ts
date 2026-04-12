import "@supabase/functions-js/edge-runtime.d.ts"

const ALLOWED_ORIGINS = ['https://dashboard.svita.ai','https://svita.ai','https://news.svita.ai','https://svita.labs67.com'];
function corsHeaders(req: Request){
  const origin=req.headers.get('origin')||'';
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)?origin:ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }
}

// Jetson SVITA AI proxy
const JETSON_URL = Deno.env.get("JETSON_URL") || "https://scyraai-desktop.tail2060da.ts.net/svita-ai"
const JETSON_TIMEOUT = 90_000

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }

  try {
    const { message, context, history, mode } = await req.json()

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ reply: "Пустое сообщение" }), {
        status: 400,
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      })
    }

    // Mode: actions — AI returns structured data to modify the dashboard
    if (mode === "actions") {
      const result = await tryActionsMode(message, context, history)
      if (result) {
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders(req), "Content-Type": "application/json" },
        })
      }
      return new Response(JSON.stringify({ reply: "Не удалось сгенерировать действия", actions: [] }), {
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      })
    }

    // Try Jetson first (svita model on Ollama)
    const jetsonReply = await tryJetson(message, context, history)
    if (jetsonReply) {
      return new Response(JSON.stringify({ reply: jetsonReply, source: "jetson" }), {
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      })
    }

    // Fallback to Claude Haiku
    const claudeReply = await tryClaude(message, context, history)
    if (claudeReply) {
      return new Response(JSON.stringify({ reply: claudeReply, source: "claude" }), {
        headers: { ...corsHeaders(req), "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ reply: "AI сервис временно недоступен" }), {
      status: 502,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("Function error:", e)
    return new Response(JSON.stringify({ reply: "Внутренняя ошибка" }), {
      status: 500,
      headers: { ...corsHeaders(req), "Content-Type": "application/json" },
    })
  }
})

async function tryJetson(
  message: string,
  context: Record<string, unknown> | undefined,
  history: ChatMessage[] | undefined
): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), JETSON_TIMEOUT)

    const res = await fetch(JETSON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context, history }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      return data.reply || null
    }
    console.error("Jetson error:", res.status)
    return null
  } catch (e) {
    console.error("Jetson unreachable:", e)
    return null
  }
}

async function tryClaude(
  message: string,
  context: Record<string, unknown> | undefined,
  history: ChatMessage[] | undefined
): Promise<string | null> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) return null

  try {
    const systemPrompt = buildSystemPrompt(context)
    const messages = buildMessages(history, message)

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: systemPrompt,
        messages,
      }),
    })

    if (!res.ok) {
      console.error("Claude error:", res.status, await res.text())
      return null
    }

    const data = await res.json()
    return data.content?.[0]?.text || null
  } catch (e) {
    console.error("Claude error:", e)
    return null
  }
}

async function tryFill(
  message: string,
  context: Record<string, unknown> | undefined,
  _history: ChatMessage[] | undefined
): Promise<{ reply: string; actions: unknown[]; source: string } | null> {
  const bizType = context?.bizType as string || "dental"
  const currency = context?.currency as string || "PLN"

  const fillMsg = `ЗАДАЧА: сгенерировать бизнес-концепцию. Верни ТОЛЬКО валидный JSON — без markdown, без текста до/после.

ФОРМАТ ОТВЕТА:
{"reply":"Краткое описание (1-2 предложения, русский)","actions":[
{"section":"rooms","data":[{"name":"...","type":"...","area":число}]},
{"section":"staff","data":[{"position":"...","salary":число,"type":"full|part"}]},
{"section":"equipment","data":[{"name":"...","category":"...","price":число}]},
{"section":"services","data":[{"name":"...","category":"...","price":число,"duration":число}]}
]}

ТРЕБОВАНИЯ:
- Бизнес: ${bizType}. Валюта: ${currency}
- Цены реалистичные для 2025 года. Зарплаты брутто/месяц
- Объём: 10-15 комнат, 8-12 сотрудников, 20-30 оборудования, 25-40 услуг
- Типы комнат (dental): Стоматологический, Хирургический, Ортодонтический, Рентген, Техническая, Общественная, Служебная
- Типы комнат (coffee): Зал, Кухня, Бар, Склад, Подсобная, Терраса
- Оборудование — реальные бренды и модели
- Услуги — с реальными ценами и длительностью в минутах

САМОПРОВЕРКА перед выводом: JSON валиден? Цены реалистичны? Нет дубликатов?

Запрос: ${message}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), JETSON_TIMEOUT)
    const res = await fetch(JETSON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: fillMsg, context, history: [] }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      const raw = data.reply || ""
      const parsed = tryParseJson(raw)
      if (parsed && parsed.actions) {
        return { reply: String(parsed.reply || "Концепция сгенерирована"), actions: parsed.actions as unknown[], source: "jetson" }
      }
      console.error("Jetson fill: could not parse JSON from reply, length:", raw.length)
    }
  } catch (e) {
    console.error("Jetson fill error:", e)
  }
  return null
}

async function tryActionsMode(
  message: string,
  context: Record<string, unknown> | undefined,
  _history: ChatMessage[] | undefined
): Promise<{ reply: string; actions: unknown[]; source: string } | null> {
  const bizType = context?.bizType as string || "dental"
  const currency = context?.currency as string || "PLN"
  const currentState = context?.currentState as string || "пустая концепция"

  const actionsPrompt = `Ты — SVITA AI. Пользователь работает в конструкторе бизнес-концепций.

ТЕКУЩЕЕ СОСТОЯНИЕ КОНЦЕПЦИИ:
${currentState}

Тип бизнеса: ${bizType}. Валюта: ${currency}.

ЗАДАЧА: На основе запроса пользователя сформируй КОНКРЕТНЫЕ действия для изменения концепции.

ФОРМАТ ОТВЕТА — ТОЛЬКО валидный JSON, без markdown:
{
  "reply": "Краткое пояснение что ты сделал (1-3 предложения, русский)",
  "actions": [
    {"section": "rooms", "action": "add", "data": [{"name": "...", "type": "...", "area": число}]},
    {"section": "staff", "action": "add", "data": [{"position": "...", "salary": число, "type": "full|part|b2b"}]},
    {"section": "equipment", "action": "add", "data": [{"name": "...", "category": "...", "price": число}]},
    {"section": "services", "action": "add", "data": [{"name": "...", "category": "...", "price": число, "duration": число}]},
    {"section": "renovations", "action": "add", "data": [{"name": "...", "cat": "...", "price": число}]},
    {"section": "docs", "action": "add", "data": [{"name": "...", "cat": "...", "price": число, "required": true}]}
  ]
}

ПРАВИЛА:
- Только те секции, которые нужны по запросу (не все сразу)
- action: "add" — добавить позиции, "replace" — заменить секцию целиком
- Цены реалистичные для 2025 года
- Оборудование — реальные бренды и модели
- Зарплаты — брутто/месяц
- НЕ дублируй то что уже есть (смотри текущее состояние)
- Если пользователь просто спрашивает совет — верни actions: [] и ответ в reply

Запрос пользователя: ${message}`

  // Prefer Claude for structured JSON (more reliable)
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 2048,
          system: "Ты возвращаешь ТОЛЬКО валидный JSON. Без markdown, без текста до/после JSON.",
          messages: [{ role: "user", content: actionsPrompt }],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const raw = data.content?.[0]?.text || ""
        const parsed = tryParseJson(raw)
        if (parsed) {
          return {
            reply: String(parsed.reply || "Готово"),
            actions: (parsed.actions as unknown[]) || [],
            source: "claude"
          }
        }
      }
    } catch (e) {
      console.error("Claude actions error:", e)
    }
  }

  // Fallback to Jetson
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), JETSON_TIMEOUT)
    const res = await fetch(JETSON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: actionsPrompt, context, history: [] }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (res.ok) {
      const data = await res.json()
      const raw = data.reply || ""
      const parsed = tryParseJson(raw)
      if (parsed) {
        return {
          reply: String(parsed.reply || "Готово"),
          actions: (parsed.actions as unknown[]) || [],
          source: "jetson"
        }
      }
    }
  } catch (e) {
    console.error("Jetson actions error:", e)
  }

  return null
}

function tryParseJson(raw: string): Record<string, unknown> | null {
  try {
    // Try direct parse
    return JSON.parse(raw)
  } catch {
    // Try extracting JSON from text
    const m = raw.match(/\{[\s\S]*\}/)
    if (m) {
      try { return JSON.parse(m[0]) } catch { return null }
    }
    return null
  }
}

function buildSystemPrompt(ctx: Record<string, unknown> | undefined): string {
  const base = `Ты — SVITA AI, аналитик бизнес-концепций.

ДОМЕНЫ: стоматология, кофейни, салоны красоты, общепит, любой сервисный бизнес.
СТРАНЫ: вся Европа. Валюты: EUR, PLN, CZK, CHF, GBP, SEK, NOK, DKK, HUF, RON, BGN, HRK.

ЗАДАЧА: анализировать концепцию пользователя, находить пробелы, давать конкретные рекомендации.

ЭКСПЕРТИЗА:
- Рынок: цены, зарплаты, конкуренция, тренды по странам Европы
- Оборудование: производители, модели, минимальный набор, цены
- Нормативы по странам: SANEPID/RPWDL (PL), Hygienevorschriften (DE/AT/CH), HZPP (CZ), HSE (UK/IE), ARS (FR), ASL (IT) и др.
- Помещения: нормы площади, локации, аренда
- Финансы: бюджет, ROI, окупаемость, маржинальность

АЛГОРИТМ ОТВЕТА:
1. Определи что пользователь реально спрашивает (намерение > буквальные слова)
2. Оцени текущее состояние его концепции по контексту
3. Дай конкретный ответ с цифрами и фактами
4. Если просят подобрать/рекомендовать — дай КОНКРЕТНЫЕ модели, бренды, цены
5. Укажи риски или пробелы если видишь
6. Перед выводом — проверь: цифры реалистичны? Нет противоречий? Ответ на заданный вопрос?

ПОВЕДЕНИЕ:
- Если пользователь просит подобрать оборудование, персонал, услуги — ДАВАЙ конкретные списки с ценами и моделями
- Если спрашивает совет — анализируй и советуй с цифрами
- Если просит заполнить/сгенерировать — помоги, не отказывай
- НИКОГДА не отвечай "я аналитик, не генератор" — ты эксперт, который помогает ПОЛНОСТЬЮ

ФОРМАТ:
- Русский язык, максимум 300 слов
- **Жирный** для ключевого, списки (- пункт), ## заголовки
- Цифры > общие слова. "Аренда 60-90 PLN/м²" > "аренда зависит от района"
- Конкретные бренды и модели > общие описания. "KaVo ESTETICA E50 — 85 000 PLN" > "dental unit"
- Если не знаешь — скажи. Не выдумывай
- Если данные могут быть устаревшими — предупреди`

  if (!ctx) return base

  const parts = [base, "\nТекущее состояние концепции:"]

  if (ctx.concept) parts.push(`Концепция: ${ctx.concept}`)
  if (ctx.bizType) parts.push(`Тип бизнеса: ${ctx.bizType}`)
  if (ctx.section) parts.push(`Активный раздел: ${sectionName(ctx.section as string)}`)
  if (ctx.budget) parts.push(`Бюджет: ${Number(ctx.budget).toLocaleString("ru")} PLN`)
  if (ctx.revenue) parts.push(`Выручка: ${Number(ctx.revenue).toLocaleString("ru")} PLN/мес`)
  if (ctx.expenses) parts.push(`Расходы: ${Number(ctx.expenses).toLocaleString("ru")} PLN/мес`)
  if (ctx.property) {
    const p = ctx.property as Record<string, string>
    parts.push(`Помещение: ${p.name}, ${p.area} м², ${p.city}`)
  }
  parts.push(`Выбрано: помещений ${ctx.rooms || 0}, оборудования ${ctx.equipment || 0}, персонала ${ctx.staff || 0}, услуг ${ctx.services || 0}, ремонтов ${ctx.renovations || 0}, документов ${ctx.docs || 0}`)

  return parts.join("\n")
}

function sectionName(s: string): string {
  const map: Record<string, string> = {
    overview: "Обзор",
    s1: "Помещение",
    s2: "Модернизация",
    s3: "Оборудование",
    s4: "Персонал",
    s5: "Услуги",
    s6: "Концепция",
    s7: "Документы",
    budget: "Бюджет",
    profit: "Рентабельность",
    zones: "Зоны",
    news: "Новости",
    account: "Личный кабинет",
  }
  return map[s] || s
}

interface ChatMessage {
  role: string
  content: string
}

function buildMessages(
  history: ChatMessage[] | undefined,
  currentMessage: string
): { role: string; content: string }[] {
  const msgs: { role: string; content: string }[] = []

  if (history && Array.isArray(history)) {
    for (const h of history.slice(-8)) {
      if (h.role === "user") {
        msgs.push({ role: "user", content: h.content })
      } else {
        msgs.push({ role: "assistant", content: h.content })
      }
    }
  }

  // Avoid duplicate if last history entry is the same as current message
  if (msgs.length > 0 && msgs[msgs.length - 1].role === "user" && msgs[msgs.length - 1].content === currentMessage) {
    return msgs
  }

  msgs.push({ role: "user", content: currentMessage })
  return msgs
}
