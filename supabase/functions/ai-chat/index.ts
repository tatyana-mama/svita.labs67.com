import "@supabase/functions-js/edge-runtime.d.ts"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS })
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!apiKey) {
    return new Response(JSON.stringify({ reply: "AI сервис не настроен" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  try {
    const { message, context, history } = await req.json()

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ reply: "Пустое сообщение" }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

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
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Anthropic API error:", res.status, err)
      return new Response(JSON.stringify({ reply: "Ошибка AI сервиса" }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      })
    }

    const data = await res.json()
    const reply = data.content?.[0]?.text || "Нет ответа"

    return new Response(JSON.stringify({ reply }), {
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
- Валюта — PLN (злотый)`

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
