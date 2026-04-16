import { useState, useRef, useEffect, useCallback } from 'react'

// ============================================================
// FORK RAMSEY AVATAR — small animated character with eyes+smile
// Animations: floating (idle), thinking (hand-on-chin bob), answering (bounce)
// ============================================================
function ForkRamseyAvatar({ animation = 'idle', size = 50 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>{`
          .fr-float { animation: frFloat 2.2s ease-in-out infinite; }
          .fr-think { animation: frThinkBob 2.5s ease-in-out infinite; }
          .fr-answer { animation: frBounce 0.6s ease-in-out 2; }
          .fr-run { animation: frRun 0.35s ease-in-out infinite; }
          @keyframes frFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes frThinkBob { 0%,100%{transform:rotate(0deg) translateY(0)} 40%{transform:rotate(-5deg) translateY(-2px)} 70%{transform:rotate(3deg) translateY(0)} }
          @keyframes frBounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} 60%{transform:translateY(1px)} }
          @keyframes frRun { 0%,100%{transform:translateX(0)} 50%{transform:translateX(3px)} }
          @keyframes frCapeFlow { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(6deg)} }
          .fr-cape-anim { animation: frCapeFlow 1.8s ease-in-out infinite; }
        `}</style>
      </defs>

      <g transform="translate(50, 52)" className={
        animation === 'idle' || animation === 'flying' ? 'fr-float' :
        animation === 'thinking' ? 'fr-think' :
        animation === 'answering' ? 'fr-answer' :
        animation === 'running' ? 'fr-run' : 'fr-float'
      }>
        {/* Cape */}
        <g className="fr-cape-anim" style={{ transformOrigin: '0 -5px' }}>
          <path d="M-8 -5 Q-24 12 -18 34 Q-15 36 -11 30 Q-14 16 -6 2 Z" fill="#E74C3C" opacity="0.85"/>
          <path d="M8 -5 Q24 12 18 34 Q15 36 11 30 Q14 16 6 2 Z" fill="#E74C3C" opacity="0.85"/>
        </g>

        {/* Fork tines */}
        <rect x="-7" y="-38" width="3.2" height="10" rx="1.6" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="0.9"/>
        <rect x="-2.4" y="-38" width="3.2" height="10" rx="1.6" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="0.9"/>
        <rect x="2.2" y="-38" width="3.2" height="10" rx="1.6" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="0.9"/>
        {/* Connector */}
        <rect x="-8.5" y="-29" width="20" height="5.5" rx="2.75" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="0.9"/>

        {/* Eyes */}
        <circle cx="-3" cy="-26.5" r="1.5" fill="#2D3436"/>
        <circle cx="5.5" cy="-26.5" r="1.5" fill="#2D3436"/>
        <circle cx="-2.3" cy="-27.3" r="0.55" fill="white"/>
        <circle cx="6.2" cy="-27.3" r="0.55" fill="white"/>
        {/* Smile */}
        <path d="M-1.5 -24 Q1.5 -21.5 4 -24" fill="none" stroke="#2D3436" strokeWidth="0.9" strokeLinecap="round"/>

        {/* Neck */}
        <path d="M-4.5 -23.5 Q-5 -16 -5 -12 L7 -12 Q7 -16 6.5 -23.5 Z" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="0.9" strokeLinejoin="round"/>

        {/* Uniform top */}
        <path d="M-13 -12 L15 -12 L16 13 Q16 14 15 14 L-13 14 Q-14 14 -14 13 Z" fill="white" stroke="#2D3436" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M-13 -12 Q-5 1 1 7 Q7 1 15 -12" fill="none" stroke="#2D3436" strokeWidth="1.1" strokeLinejoin="round"/>

        {/* Belt */}
        <rect x="-14.5" y="12" width="31" height="4.5" rx="2.25" fill="#E74C3C"/>
        <circle cx="1" cy="14.25" r="2.4" fill="#C0392B"/>

        {/* Lower uniform flared */}
        <path d="M-13 16.5 Q-15 25 -16 32 Q-16 33 -15 33 L17 33 Q18 33 18 32 Q17 25 15 16.5 Z" fill="white" stroke="#2D3436" strokeWidth="1.3" strokeLinejoin="round"/>

        {/* Handle */}
        <path d="M-3.5 33 Q-4 38 1 41 Q6 38 5.5 33" fill="#C0C7CC" stroke="#8E9AA0" strokeWidth="0.9" strokeLinejoin="round"/>
      </g>

      {/* Flying sparkles */}
      {(animation === 'idle' || animation === 'flying') && (
        <>
          <circle cx="80" cy="28" r="2" fill="#FFEAA7" opacity="0.7">
            <animate attributeName="r" values="1;2.5;1" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle cx="76" cy="20" r="1.3" fill="#74B9FF" opacity="0.5">
            <animate attributeName="r" values="0.8;1.8;0.8" dur="2s" repeatCount="indefinite"/>
          </circle>
        </>
      )}

      {/* Thinking bubble */}
      {animation === 'thinking' && (
        <>
          <circle cx="73" cy="30" r="2.5" fill="#F0F0F0" stroke="#DFE6E9" strokeWidth="0.8">
            <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="78" cy="22" r="1.8" fill="#F0F0F0" stroke="#DFE6E9" strokeWidth="0.6"/>
          <rect x="64" y="6" width="30" height="15" rx="7.5" fill="white" stroke="#DFE6E9" strokeWidth="1"/>
          <text x="79" y="16" textAnchor="middle" fontSize="6.5" fill="#636E72" fontFamily="Nunito,sans-serif" fontWeight="700">hmm...</text>
        </>
      )}

      {/* Answering speech bubble */}
      {animation === 'answering' && (
        <>
          <rect x="60" y="4" width="36" height="18" rx="9" fill="white" stroke="#00B894" strokeWidth="1.2"/>
          <text x="78" y="16" textAnchor="middle" fontSize="6.5" fill="#2D3436" fontFamily="Nunito,sans-serif" fontWeight="700">Right!</text>
          <polygon points="66,22 62,28 70,22" fill="white" stroke="#00B894" strokeWidth="0.8"/>
        </>
      )}

      {/* Running motion lines */}
      {animation === 'running' && (
        <>
          <line x1="10" y1="45" x2="22" y2="45" stroke="#B2BEC3" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
            <animate attributeName="x1" values="10;5;10" dur="0.4s" repeatCount="indefinite"/>
          </line>
          <line x1="8" y1="55" x2="18" y2="55" stroke="#B2BEC3" strokeWidth="1.2" strokeLinecap="round" opacity="0.4">
            <animate attributeName="x1" values="8;3;8" dur="0.5s" repeatCount="indefinite"/>
          </line>
          <circle cx="20" cy="85" r="3" fill="#DFE6E9" opacity="0.4">
            <animate attributeName="r" values="2;4;2" dur="0.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="0.6s" repeatCount="indefinite"/>
          </circle>
        </>
      )}
    </svg>
  )
}

// ============================================================
// AI RESPONSE ENGINE — generates unique, context-aware replies
// Uses TheMealDB for recipe data + dynamic response generation
// ============================================================

// Personality phrases Fork Ramsey rotates through
const GREETINGS = [
  "Alright chef, let's sort this out!",
  "Right then, here's the deal:",
  "Great question! Let me break this down for you:",
  "Ooh, good one! Here's what I know:",
  "Don't panic — Fork Ramsey's got you covered!",
  "Now we're cooking! Here's my take:",
  "Listen up, chef — this is important:",
  "Brilliant question! Let me help:",
]

const ENCOURAGEMENTS = [
  "You've got this! 💪",
  "Keep at it, chef! 🔥",
  "That's the spirit! 🍳",
  "Now go make something delicious! ✨",
  "Trust the process — it'll be amazing! 👨‍🍳",
  "Remember: even I started somewhere! 🌟",
  "You're doing brilliantly! 💫",
]

const FALLBACKS = [
  "Hmm, I'm not sure about that one 🤔 Try rewording your question — maybe ask about a specific dish or technique!",
  "That's a tricky one! Could you give me a bit more detail? Like which dish you're working on? 🍴",
  "I want to help but I need a bit more to go on! Try asking something like 'How do I make chicken stir fry?' 😊",
  "My chef brain is stumped on that one! Try asking about ingredients, cooking times, or techniques 🧑‍🍳",
  "I'm better with specific cooking questions! Try 'What can I substitute for X?' or 'How do I cook Y?' 🍽️",
]

let responseCounter = 0 // Ensures variation even with similar questions

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickRandomUnique(arr, avoidIndex) {
  let idx
  do { idx = Math.floor(Math.random() * arr.length) } while (idx === avoidIndex && arr.length > 1)
  return { text: arr[idx], index: idx }
}

// Format response with personality
function formatResponse(content) {
  responseCounter++
  const greeting = GREETINGS[responseCounter % GREETINGS.length]
  const encouragement = pickRandom(ENCOURAGEMENTS)
  return `${greeting}\n\n${content}\n\n${encouragement}`
}

// Parse MealDB meal into structured data
function parseMeal(meal) {
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`]
    const measure = meal[`strMeasure${i}`]
    if (ing && ing.trim()) {
      ingredients.push({ name: ing.trim(), measure: measure?.trim() || '' })
    }
  }
  const steps = meal.strInstructions
    .split(/\r?\n/)
    .filter(s => s.trim().length > 5)
    .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
  return { name: meal.strMeal, area: meal.strArea, category: meal.strCategory, ingredients, steps, source: meal.strSource, thumb: meal.strMealThumb }
}

// Search TheMealDB
async function searchMealDB(query) {
  try {
    const terms = [query]
    // Also try shorter version
    const words = query.split(/\s+/)
    if (words.length > 2) terms.push(words.slice(0, 2).join(' '))
    if (words.length > 1) terms.push(words[words.length - 1])

    for (const term of terms) {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`)
      const data = await res.json()
      if (data.meals && data.meals.length > 0) {
        return parseMeal(data.meals[0])
      }
    }
  } catch (e) {
    console.log('MealDB error:', e)
  }
  return null
}

// Extract the dish name from a question
function extractDishName(question) {
  const q = question.toLowerCase()
  // Remove common question patterns
  return q
    .replace(/^(how (do i|to|can i|should i) (make|cook|prepare|do)|what('s| is) (in|the)|can you (help|tell|show|explain)|tell me (about|how)|i (want|need) (to|help with)|give me|show me|what are the)\s*/i, '')
    .replace(/\?+$/g, '')
    .replace(/^(a|an|the|some|my)\s+/i, '')
    .trim()
}

// Detect question type
function detectQuestionType(q) {
  const lower = q.toLowerCase()
  if (/how (do i|to|can i|should i) (make|cook|prepare|create)/i.test(q)) return 'how_to_make'
  if (/ingredient|what('s| is| do i) (in|need)|what do i need|shopping list/i.test(q)) return 'ingredients'
  if (/how long|time|minutes|hours|when (is it|will it be) (done|ready)/i.test(q)) return 'time'
  if (/substitut|replace|instead|swap|alternative|don't have|without|run out/i.test(q)) return 'substitute'
  if (/tip|advice|secret|better|improve|trick|hack/i.test(q)) return 'tips'
  if (/temperature|degrees|how hot|oven|heat|what temp/i.test(q)) return 'temperature'
  if (/burn|stuck|sticking|smoke|wrong|mess|fail|disaster|help|ruined|overcooked/i.test(q)) return 'troubleshoot'
  if (/what (is|are)|explain|tell me about|describe/i.test(q)) return 'explain'
  if (/step|instruction|method|process|guide|walk me through/i.test(q)) return 'steps'
  if (/serv|portion|how many|enough for/i.test(q)) return 'servings'
  if (/beginner|easy|simple|first time|start|learn|basic|new to/i.test(q)) return 'beginner'
  if (/healthy|calories|nutrition|diet|low cal/i.test(q)) return 'health'
  return 'general'
}

// Generate response based on question type and recipe data
function generateResponse(questionType, meal, question, previousResponses) {
  if (!meal) {
    const dish = extractDishName(question)
    switch (questionType) {
      case 'how_to_make':
        return `I couldn't find a recipe for **${dish || 'that'}** in my database, but here's my advice:\n\n` +
          `1. Search for "${dish} recipe" on BBC Good Food or RecipeTin Eats — they're absolute legends\n` +
          `2. Read the ENTIRE recipe before you start (trust me on this)\n` +
          `3. Prep all your ingredients first — chefs call it "mise en place"\n` +
          `4. Take your time and don't skip any steps\n\n` +
          `Want to try asking about a different dish? I know hundreds!`
      case 'substitute':
        return `Here are some reliable kitchen swaps:\n\n` +
          `• **Butter** → Olive oil or coconut oil (same amount)\n` +
          `• **Heavy cream** → Coconut cream or cashew cream\n` +
          `• **Eggs** → Flax egg (1 tbsp ground flax + 3 tbsp water, sit 5 min)\n` +
          `• **Soy sauce** → Tamari or coconut aminos\n` +
          `• **Breadcrumbs** → Crushed crackers, panko, or rolled oats\n` +
          `• **Buttermilk** → Milk + 1 tbsp lemon juice (sit 5 min)\n` +
          `• **Fresh herbs** → ⅓ amount of dried herbs\n\n` +
          `Tell me the EXACT ingredient and I'll dial in the best swap!`
      default:
        return pickRandom(FALLBACKS)
    }
  }

  // We have recipe data — generate detailed, varied responses
  const { name, area, category, ingredients, steps, source } = meal
  const ingList = ingredients.map(i => `• ${i.measure} ${i.name}`.trim()).join('\n')
  const stepList = steps.slice(0, 8).map((s, i) => `**${i + 1}.** ${s}`).join('\n')
  const stepCount = steps.length
  const ingCount = ingredients.length
  const timeEstimate = stepCount <= 3 ? '15–20 minutes' : stepCount <= 5 ? '25–35 minutes' : stepCount <= 8 ? '35–50 minutes' : '50–70 minutes'

  // Vary structure based on counter to prevent repetition
  const variation = (responseCounter + previousResponses.length) % 3

  switch (questionType) {
    case 'how_to_make':
      if (variation === 0) {
        return `Here's the complete breakdown for **${name}**! 🍳\n\n` +
          `**🛒 What you'll need (${ingCount} ingredients):**\n${ingList}\n\n` +
          `**📝 Method:**\n${stepList}` +
          (steps.length > 8 ? `\n\n... plus ${steps.length - 8} more steps.` : '') +
          (source ? `\n\n📖 Full recipe: ${source}` : '')
      } else if (variation === 1) {
        return `**${name}** — let's do this! Here's your game plan:\n\n` +
          `⏱ **Time:** Roughly ${timeEstimate}\n` +
          `📊 **Difficulty:** ${stepCount <= 5 ? 'Easy peasy' : stepCount <= 8 ? 'Moderate' : 'A bit of a project'}\n\n` +
          `**Step by step:**\n${stepList}\n\n` +
          `**Shopping list:**\n${ingList}` +
          (source ? `\n\n🔗 Original: ${source}` : '')
      } else {
        return `Let me walk you through **${name}** step by step!\n\n` +
          `This is ${area ? `a ${area} ` : ''}${category ? `${category.toLowerCase()} ` : ''}dish with ${ingCount} ingredients.\n\n` +
          `**Here's the method:**\n${stepList}\n\n` +
          `**You'll need:**\n${ingList}`
      }

    case 'ingredients':
      return `**Shopping list for ${name}** (${ingCount} items):\n\n${ingList}\n\n` +
        `That's everything! ${ingCount <= 8 ? 'Pretty manageable list, right?' : 'A few items, but nothing too crazy!'} ` +
        `Pro tip: read through the method first so you know how each ingredient is used. No surprises that way! 📋`

    case 'time':
      return `**${name}** should take about **${timeEstimate}** total.\n\n` +
        `Here's the breakdown:\n` +
        `• **Prep time:** ~${stepCount <= 5 ? '10' : '15'}–${stepCount <= 5 ? '15' : '20'} minutes (chopping, measuring)\n` +
        `• **Cook time:** ~${stepCount <= 3 ? '10' : stepCount <= 6 ? '20' : '30'}–${stepCount <= 3 ? '15' : stepCount <= 6 ? '30' : '45'} minutes\n` +
        `• **Steps:** ${stepCount} total\n\n` +
        `My advice? Don't rush the prep. Having everything ready before you start cooking makes everything smoother and way less stressful! ⏱`

    case 'substitute': {
      const topIngs = ingredients.slice(0, 6).map(i => i.name)
      return `For **${name}**, here are swaps for the key ingredients:\n\n` +
        topIngs.map(ing => {
          const i = ing.toLowerCase()
          if (i.includes('chicken')) return `• **${ing}** → Tofu (firm, pressed) or turkey breast`
          if (i.includes('beef')) return `• **${ing}** → Mushrooms (portobello) for veggie, or lamb`
          if (i.includes('soy sauce')) return `• **${ing}** → Tamari (GF) or coconut aminos`
          if (i.includes('cream')) return `• **${ing}** → Coconut cream or cashew cream`
          if (i.includes('butter')) return `• **${ing}** → Olive oil or ghee`
          if (i.includes('egg')) return `• **${ing}** → Flax egg or chia egg`
          if (i.includes('garlic')) return `• **${ing}** → ½ tsp garlic powder per clove`
          if (i.includes('ginger')) return `• **${ing}** → ¼ tsp ground ginger per tbsp fresh`
          if (i.includes('rice')) return `• **${ing}** → Cauliflower rice or quinoa`
          if (i.includes('pasta') || i.includes('noodle')) return `• **${ing}** → Zucchini noodles or rice noodles`
          return `• **${ing}** → Ask me for a specific swap!`
        }).join('\n') +
        `\n\nTell me exactly which ingredient you're missing and I'll find the best alternative! 🔄`
    }

    case 'tips':
      return `**Pro tips for making ${name} like a legend:**\n\n` +
        `🔥 **Heat control** — ${variation === 0 ? 'Start medium-low and work up. You can always add heat, can\'t take it away!' : 'Let your pan get properly hot before adding anything. Patience pays off!'}\n` +
        `🧂 **Seasoning** — ${variation === 0 ? 'Season at every stage, not just the end. Layers of flavour!' : 'Taste as you go. Your tongue is your best kitchen tool!'}\n` +
        `⏱ **Timing** — ${variation === 0 ? 'Prep everything BEFORE you start cooking. Game changer!' : 'Don\'t multitask too much — focus on one element at a time.'}\n` +
        `🍋 **The secret weapon** — A squeeze of lemon or splash of vinegar at the end brightens EVERYTHING.\n` +
        `👃 **Trust your senses** — When it smells incredible, you're almost there!\n\n` +
        `The biggest secret? **Confidence**. Cook like you mean it! 👨‍🍳`

    case 'temperature':
      return `**Temperature guide for ${name}:**\n\n` +
        `${category?.toLowerCase().includes('chicken') || name.toLowerCase().includes('chicken') ? '🐔 **Chicken**: Internal temp 75°C / 165°F — use a meat thermometer!\n' : ''}` +
        `${name.toLowerCase().includes('beef') || name.toLowerCase().includes('steak') ? '🥩 **Beef**: 55°C (rare) to 75°C (well done)\n' : ''}` +
        `🔵 **Low oven**: 150°C / 300°F — slow braises and stews\n` +
        `🟡 **Medium oven**: 180°C / 350°F — most standard cooking\n` +
        `🟠 **High oven**: 200–220°C / 400–425°F — crispy finishes\n` +
        `🍳 **Stovetop**: Medium heat for most things. High only for searing!\n\n` +
        `When in doubt, medium heat and patience beats high heat and panic every time! 🌡`

    case 'troubleshoot':
      return `**Kitchen rescue for ${name}!** Don't worry, we'll fix this! 🚨\n\n` +
        `Common issues and fixes:\n\n` +
        `🔥 **Burning/sticking** — Remove from heat NOW. Transfer to a clean pan. Don't scrape the burnt bits in!\n` +
        `🧂 **Too salty** — Add a splash of acid (lemon juice/vinegar) to balance, or add more unseasoned base\n` +
        `🌶 **Too spicy** — Add dairy (cream, yogurt) or sugar to tame the heat\n` +
        `😐 **Too bland** — Layer in: salt first, then acid (lemon), then fat (butter/oil). Taste after each!\n` +
        `💧 **Too watery** — Simmer with lid off to reduce, or add a cornstarch slurry (1 tbsp cornstarch + 2 tbsp cold water)\n` +
        `🥩 **Undercooked meat** — Put it back in! It's always fixable. Overcooked is harder to save.\n\n` +
        `What specifically went wrong? I'll give you a more targeted rescue plan!`

    case 'steps':
      return `**Step-by-step method for ${name}:**\n\n${stepList}` +
        (steps.length > 8 ? `\n\n... plus ${steps.length - 8} more steps.` : '') +
        `\n\nTake it one step at a time. No rushing! Each step builds on the last. 📝`

    case 'explain':
      return `**${name}** is ${area ? `a ${area} ` : ''}${category ? `${category.toLowerCase()} dish` : 'a delicious dish'}.\n\n` +
        `It uses ${ingCount} ingredients and involves ${stepCount} cooking steps.\n\n` +
        `The key flavours come from: **${ingredients.slice(0, 4).map(i => i.name).join(', ')}**.\n\n` +
        `${stepCount <= 5 ? 'It\'s a fairly straightforward dish — great for weeknights!' : 'It takes a bit of effort but the result is absolutely worth it!'}\n\n` +
        `Want me to walk you through how to make it, or do you have a specific question?`

    case 'servings':
      return `**${name}** typically serves **${ingCount <= 8 ? '2–3' : '4–6'} people** with standard portions.\n\n` +
        `To scale up:\n` +
        `• For **double**, multiply all ingredients by 2 (but be careful with spices — use 1.5x first and taste)\n` +
        `• For **half**, divide by 2 (cooking time may reduce slightly)\n\n` +
        `Pro tip: always make a bit extra. Leftovers are tomorrow's lunch! 🍱`

    case 'beginner':
      return `Starting out with **${name}**? Here's my beginner-friendly guide:\n\n` +
        `1️⃣ **Read the full recipe** before touching anything\n` +
        `2️⃣ **Prep everything first** — chop, measure, arrange in bowls\n` +
        `3️⃣ **Go slow** — there's no rush, take each step one at a time\n` +
        `4️⃣ **Medium heat** — keep everything at medium until you're confident\n` +
        `5️⃣ **Taste constantly** — adjust seasoning as you go\n\n` +
        `The ${stepCount <= 5 ? 'good news: this is a pretty simple dish!' : 'key is patience — take your time and you\'ll nail it!'}\n\n` +
        `Ask me about any step that confuses you. Seriously — no question is too basic! 🤗`

    case 'health':
      return `**Health notes for ${name}:**\n\n` +
        `With ${ingCount} ingredients, here are some healthier tweaks:\n\n` +
        `🥗 **Reduce oil/butter** — use half the amount and non-stick cookware\n` +
        `🧂 **Cut sodium** — use herbs and spices instead of extra salt\n` +
        `🌾 **Carb swaps** — cauliflower rice instead of white rice, zucchini noodles instead of pasta\n` +
        `🥬 **Add veggies** — throw in extra vegetables wherever possible\n` +
        `🍗 **Lean protein** — use chicken breast instead of thigh, or add more plant-based protein\n\n` +
        `Small changes add up. You don't have to sacrifice flavour for health! 💚`

    default:
      return `About **${name}** — it's a ${area ? `${area} ` : ''}${category ? `${category.toLowerCase()} ` : ''}dish with ${ingCount} ingredients and ${stepCount} steps.\n\n` +
        `Here's a quick summary:\n` +
        steps.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n') +
        (steps.length > 3 ? `\n... and ${steps.length - 3} more steps.` : '') +
        `\n\nWhat specifically would you like to know? I can help with:\n• Full recipe breakdown\n• Ingredient substitutions\n• Cooking tips & techniques\n• Timing & temperature`
  }
}

// Main response function
async function getForkRamseyResponse(question, recipeContext, previousResponses) {
  const q = question.trim()
  if (!q) return pickRandom(FALLBACKS)

  responseCounter++
  const questionType = detectQuestionType(q)
  const dishName = extractDishName(q)

  // Determine what to search for
  let searchTerm = dishName
  if (recipeContext?.name) {
    const qLower = q.toLowerCase()
    const recipeLower = recipeContext.name.toLowerCase()
    // If they seem to be asking about the current recipe
    if (qLower.includes('this') || qLower.includes('the recipe') || qLower.includes('it') || qLower.includes('the dish') ||
        recipeLower.split(/\s+/).some(w => w.length > 3 && qLower.includes(w))) {
      searchTerm = recipeContext.name
    }
  }

  // Search for the recipe
  const meal = await searchMealDB(searchTerm || recipeContext?.name || dishName)

  // Generate a unique response
  const content = generateResponse(questionType, meal, question, previousResponses)
  return formatResponse(content)
}


// ============================================================
// CHAT COMPONENT
// ============================================================
function ForkRamseyChat({ recipeData, isVisible }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState([
    {
      from: 'ramsey',
      text: "Oi oi! I'm **Fork Ramsey** — your personal kitchen sensei! 🥋🍴\n\nAsk me ANYTHING about cooking. How to make a dish, ingredient swaps, troubleshooting disasters — I've seen it all!\n\nGo on then, what are we making today?",
      animation: 'flying'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const previousResponsesRef = useRef([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || isTyping) return

    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setIsTyping(true)

    try {
      const response = await getForkRamseyResponse(text, recipeData, previousResponsesRef.current)
      previousResponsesRef.current.push(response)
      if (previousResponsesRef.current.length > 10) previousResponsesRef.current.shift()

      setMessages(prev => [...prev, { from: 'ramsey', text: response }])
    } catch (err) {
      setMessages(prev => [...prev, {
        from: 'ramsey',
        text: pickRandom(FALLBACKS),
      }])
    }

    setIsTyping(false)
  }, [input, isTyping, recipeData])

  if (!isVisible) return null

  // Collapsed button
  if (!isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        style={{
          position: 'fixed', bottom: 20, right: 20, width: 68, height: 68,
          borderRadius: 18, background: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, border: '2px solid #E74C3C', transition: 'all 0.3s ease',
        }}
        title="Chat with Fork Ramsey"
      >
        <span style={{ fontSize: '2rem' }}>🍴</span>
        <div style={{
          position: 'absolute', top: -4, right: -4, width: 18, height: 18,
          borderRadius: '50%', background: '#E74C3C', border: '2px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, color: 'white', fontWeight: 800,
        }}>?</div>
      </div>
    )
  }

  // Expanded chat
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, width: 360, height: 520,
      borderRadius: 20, background: 'white',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 1000, animation: 'fadeIn 0.3s ease', border: '2px solid #F0F0F0',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #E74C3C, #C0392B)',
        color: 'white', padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: '1.5rem' }}>🍴</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Fork Ramsey</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
            {isTyping ? 'Thinking...' : 'Your Kitchen Sensei 🥋'}
          </div>
        </div>
        <button onClick={() => setIsExpanded(false)} style={{
          background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
          width: 28, height: 28, borderRadius: 8, cursor: 'pointer',
          fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} title="Minimize">⌄</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 12,
        display: 'flex', flexDirection: 'column', gap: 10, background: '#FAFAFA',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            flexDirection: msg.from === 'user' ? 'row-reverse' : 'row',
            gap: 6, alignItems: 'flex-end',
          }}>
            {msg.from === 'ramsey' && (
              <div style={{
                flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                background: '#E74C3C', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.8rem',
              }}>🍴</div>
            )}
            <div style={{
              background: msg.from === 'user' ? '#74B9FF' : 'white',
              color: msg.from === 'user' ? 'white' : '#2D3436',
              padding: '10px 14px',
              borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              maxWidth: '80%', fontSize: '0.83rem', lineHeight: 1.55,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.text.split(/(\*\*.*?\*\*)/).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j}>{part.slice(2, -2)}</strong>
                }
                return part
              })}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
            <div style={{
              flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
              background: '#E74C3C', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.8rem',
            }}>🍴</div>
            <div style={{
              background: 'white', padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#B2BEC3',
                  animation: 'typingDot 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px', borderTop: '1px solid #F0F0F0',
        display: 'flex', gap: 8, background: 'white',
      }}>
        <input
          type="text" value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder="Ask Fork Ramsey anything..."
          style={{
            flex: 1, border: '2px solid #DFE6E9', borderRadius: 12,
            padding: '10px 14px', fontFamily: 'Nunito, sans-serif',
            fontSize: '0.85rem', fontWeight: 600, outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#E74C3C'}
          onBlur={(e) => e.target.style.borderColor = '#DFE6E9'}
        />
        <button onClick={sendMessage} disabled={!input.trim() || isTyping} style={{
          background: input.trim() && !isTyping ? '#E74C3C' : '#DFE6E9',
          color: 'white', border: 'none', borderRadius: 12,
          width: 42, height: 42,
          cursor: input.trim() && !isTyping ? 'pointer' : 'default',
          fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', flexShrink: 0,
        }}>↑</button>
      </div>

      <style>{`
        @keyframes typingDot {
          0%, 100% { opacity: 0.3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  )
}

export default ForkRamseyChat
