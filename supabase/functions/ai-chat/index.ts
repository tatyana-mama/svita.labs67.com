import "@supabase/functions-js/edge-runtime.d.ts"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// Jetson SVITA AI proxy (public Tailscale Funnel)
const JETSON_URL = "https://scyraai-desktop.tail2060da.ts.net/svita-ai"
const JETSON_TIMEOUT = 90_000

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS })
  }

  try {
    const { message, context, history, mode } = await req.json()

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ reply: "Пустое сообщение" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    // Fill mode — generate structured concept data
    if (mode === "fill") {
      const fillReply = await tryFill(message, context, history)
      if (fillReply) {
        return new Response(JSON.stringify(fillReply), {
          headers: { ...CORS, "Content-Type": "application/json" },
        })
      }
      return new Response(JSON.stringify({ reply: "Не удалось сгенерировать концепцию", actions: [] }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    // Try Jetson first (svita model on Ollama)
    const jetsonReply = await tryJetson(message, context, history)
    if (jetsonReply) {
      return new Response(JSON.stringify({ reply: jetsonReply, source: "jetson" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    // Fallback to Claude Haiku
    const claudeReply = await tryClaude(message, context, history)
    if (claudeReply) {
      return new Response(JSON.stringify({ reply: claudeReply, source: "claude" }), {
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ reply: "AI сервис временно недоступен" }), {
      status: 502,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  } catch (e) {
    console.error("Function error:", e)
    return new Response(JSON.stringify({ reply: "Внутренняя ошибка" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
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
  const fillMsg = `Верни ТОЛЬКО валидный JSON (без markdown, без пояснений, без текста до/после).
Формат:
{"reply":"Что заполнено (1-2 предложения, русский)","actions":[
{"section":"rooms","data":[{"name":"Кабинет 1","type":"Стоматологический","area":18},{"name":"Рецепция","type":"Общественная","area":15}]},
{"section":"staff","data":[{"position":"Стоматолог","salary":12000,"type":"full"},{"position":"Ассистент","salary":5500,"type":"full"}]},
{"section":"equipment","data":[{"name":"Установка Sirona","category":"Кабинет","price":35000},{"name":"Автоклав","category":"Стерилизация","price":6000}]},
{"section":"services","data":[{"name":"Консультация","category":"Диагностика","price":150,"duration":30},{"name":"Пломба","category":"Терапия","price":350,"duration":45}]}
]}
Цены в PLN (Польша 2025). Зарплаты брутто/мес. Типы комнат: Стоматологический, Хирургический, Ортодонтический, Рентген, Техническая, Общественная, Служебная.
Генерируй реалистичные данные: 10-15 комнат, 8-12 сотрудников, 20-30 оборудования, 25-40 услуг.
Запрос пользователя: ${message}`

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
  const base = `Ты — SVITA AI, интеллектуальный ассистент для конструктора бизнес-концепций стоматологических клиник в Польше.

Твои компетенции:
- Стоматологический рынок Польши: цены, зарплаты, конкуренция, тренды
- Оборудование: производители, модели, цены, минимальный набор
- Нормативные требования: SANEPID, RPWDL, OC страхование, пожарная безопасность
- Помещения: нормы площади, лучшие районы Варшавы, стоимость аренды
- Персонал: штатное расписание, зарплаты, обязанности
- Финансовый анализ: бюджет, рентабельность, окупаемость, ROI
- Услуги и прайс-листы: средние чеки, маржинальность процедур

Правила:
- Отвечай на русском языке
- Будь конкретным: давай цифры, названия, факты
- Если данные устарели, предупреди
- Не выдумывай — если не знаешь, скажи
- Ответы компактные, по делу, с bullet-points где уместно
- Валюта — PLN (злотый)
- МАКСИМУМ 200 слов в ответе. Будь лаконичным.
- Форматируй ответы с **жирным**, списками (- пункт), заголовками (## Заголовок)

ГЕНЕРАЦИЯ КОНЦЕПЦИИ:
Когда пользователь просит сгенерировать/создать/собрать концепцию, заполнить данные, или что-то подобное:
1. Уточни 3 параметра (если не указаны): площадь (м²), город, тип клиники (общая/детская/ортодонтия/имплантология/премиум)
2. Когда все параметры есть — ответь РОВНО в таком формате (последняя строка обязательно):
   "Отлично! Генерирую полную концепцию для [тип] клиники [площадь] м² в [город]..."
   А в самом конце ответа добавь РОВНО такую строку:
   [GENERATE_CONCEPT:{"area":200,"city":"Warszawa","type":"dental_general"}]
3. Типы: dental_general, dental_kids, dental_ortho, dental_implant, dental_premium, dental_cosmo
4. Если пользователь сразу указал все параметры — не переспрашивай, сразу генерируй.`

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
    s6: "Финансы",
    s7: "Документы",
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
