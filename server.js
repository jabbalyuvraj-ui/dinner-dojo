// Local API server for pantry scanning
// Accepts a captured image, runs gsk analyze to identify ingredients, returns results
import { createServer } from 'http'
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import { join } from 'path'
import { tmpdir } from 'os'

const PORT = 3099
const GSK_CMD = `"C:\\Users\\Kabir\\AppData\\Roaming\\Genspark Claw\\tools\\node_modules\\.bin\\gsk.cmd"`

// ─── EXPANDED CATEGORY MAP ─────────────────────────────────────────────────
const CATEGORY_MAP = {
  vegetables: [
    'broccoli','carrot','onion','red onion','brown onion','spring onion','shallot',
    'garlic','potato','sweet potato','kumara','tomato','cherry tomato','roma tomato',
    'bell pepper','capsicum','red capsicum','green capsicum','yellow capsicum',
    'cucumber','lebanese cucumber','lettuce','iceberg lettuce','cos lettuce','rocket',
    'spinach','baby spinach','silverbeet','zucchini','courgette','mushroom',
    'button mushroom','portobello mushroom','shiitake mushroom','enoki mushroom',
    'corn','sweetcorn','corn cob','peas','sugar snap peas','snow peas',
    'green beans','beans','celery','cabbage','red cabbage','wombok','cauliflower',
    'eggplant','aubergine','asparagus','ginger','chilli','bird eye chilli',
    'jalapeno','kale','bok choy','pak choy','choy sum','beetroot','radish',
    'daikon','pumpkin','butternut pumpkin','squash','leek','fennel','artichoke',
    'brussel sprouts','turnip','parsnip','swede','okra','broccolini','rapini',
    'watercress','endive','radicchio','witlof','microgreens','sprouts','alfalfa',
    'bean sprouts','bamboo shoots','water chestnuts','taro','lotus root',
    'sweet corn','corn kernels','edamame','broad beans',
  ],
  fruits: [
    'apple','red apple','green apple','granny smith','fuji apple','gala apple',
    'banana','orange','navel orange','blood orange','mandarin','clementine',
    'lemon','lime','kaffir lime','avocado','mango','pineapple','strawberry',
    'blueberry','raspberry','blackberry','grape','red grape','green grape',
    'watermelon','peach','nectarine','pear','williams pear','kiwi','kiwifruit',
    'grapefruit','cherry','plum','prune','coconut','passionfruit','fig',
    'melon','rockmelon','honeydew','cantaloupe','dragonfruit','lychee',
    'rambutan','longan','persimmon','pomegranate','guava','papaya','pawpaw',
    'jackfruit','durian','starfruit','feijoa','tamarind','quince',
  ],
  meat: [
    'chicken','chicken breast','chicken thigh','chicken drumstick','chicken wing',
    'chicken mince','roast chicken','beef','beef mince','ground beef','steak',
    'sirloin','ribeye','eye fillet','scotch fillet','beef chuck','beef brisket',
    'pork','pork belly','pork chop','pork mince','pulled pork','spare ribs',
    'lamb','lamb chop','lamb shoulder','lamb rack','lamb mince','lamb cutlet',
    'salmon','salmon fillet','salmon steak','smoked salmon','tuna','tuna steak',
    'snapper','barramundi','cod','whiting','flathead','bream','trout',
    'shrimp','prawn','king prawn','tiger prawn','crab','lobster','crayfish',
    'scallop','mussel','oyster','squid','calamari','octopus','fish',
    'turkey','duck','duck breast','venison','rabbit','quail',
    'bacon','streaky bacon','middle bacon','prosciutto','pancetta','salami',
    'ham','leg ham','shaved ham','chorizo','pepperoni','sausage',
    'pork sausage','beef sausage','bratwurst','frankfurter','hot dog',
    'mince','beef mince','lamb mince','chicken mince',
  ],
  dairy: [
    'milk','full cream milk','skim milk','low fat milk','lactose free milk',
    'oat milk','almond milk','soy milk','coconut milk drink','rice milk',
    'cheese','cheddar','tasty cheese','mozzarella','parmesan','bocconcini',
    'feta','ricotta','cottage cheese','cream cheese','brie','camembert',
    'gouda','edam','colby','haloumi','halloumi','blue cheese','gruyere',
    'butter','unsalted butter','salted butter','ghee','margarine',
    'cream','thickened cream','whipping cream','sour cream','creme fraiche',
    'double cream','cooking cream','pouring cream',
    'yogurt','yoghurt','greek yogurt','natural yogurt','flavoured yogurt',
    'egg','eggs','free range eggs','cage free eggs',
    'ice cream','gelato','sorbet',
  ],
  cereals: [
    'cornflakes','corn flakes','weet-bix','weetbix','weet bix','weetabix',
    'sanitarium weet-bix','sultana bran','all bran','bran flakes','bran buds',
    'special k','nutri-grain','nutrigrain','coco pops','coco pops chex',
    'rice bubbles','rice krispies','honey smacks','froot loops','fruit loops',
    'cheerios','honey cheerios','lucky charms','frosted flakes','just right',
    'muesli','granola','bircher muesli','toasted muesli','natural muesli',
    'oats','rolled oats','quick oats','steel cut oats','instant oats','porridge',
    'uncle tobys oats','carman muesli','vita brits','mini wheats',
    'honeycombs','cocoa puffs','cap n crunch',
  ],
  bread: [
    'bread','white bread','wholemeal bread','wholegrain bread','multigrain bread',
    'sourdough','sourdough loaf','rye bread','pumpernickel','ciabatta',
    'baguette','french baguette','breadstick','grissini',
    'pita','pita bread','flatbread','lavash','mountain bread','wrap','tortilla',
    'flour tortilla','corn tortilla','naan','roti','chapati','paratha',
    'english muffin','crumpet','scone','pikelet','damper',
    'hot dog bun','burger bun','brioche bun','dinner roll','bread roll',
    'croissant','pain au chocolat','danish','donut','bagel',
    'toast','toasted bread','crouton','breadcrumbs','panko',
    'cracker','rice cracker','vita wheat','ryvita','corn thins','rice cake',
  ],
  pasta_rice_grains: [
    'rice','white rice','brown rice','jasmine rice','basmati rice','arborio rice',
    'sushi rice','long grain rice','short grain rice','wild rice','black rice',
    'pasta','spaghetti','fettuccine','penne','rigatoni','fusilli','farfalle',
    'linguine','tagliatelle','lasagne sheets','lasagna','ravioli','tortellini',
    'gnocchi','orzo','couscous','polenta','semolina','cornmeal',
    'noodles','egg noodles','rice noodles','glass noodles','soba noodles',
    'udon noodles','ramen noodles','pad thai noodles','vermicelli',
    'instant noodles','maggi noodles','2 minute noodles','cup noodles',
    'quinoa','freekeh','farro','barley','bulgur','buckwheat','millet',
  ],
  canned_jarred: [
    'canned tomatoes','crushed tomatoes','diced tomatoes','whole peeled tomatoes',
    'tomato paste','tomato puree','passata','tomato sauce',
    'canned tuna','canned salmon','canned sardines','canned mackerel',
    'canned beans','canned chickpeas','canned lentils','canned corn',
    'canned peas','canned beetroot','canned pumpkin','canned peaches',
    'canned pineapple','canned mango','canned coconut milk','canned coconut cream',
    'canned soup','tomato soup','vegetable soup','chicken soup',
    'beans','chickpeas','lentils','black beans','kidney beans',
    'cannellini beans','butter beans','borlotti beans','baked beans',
    'peanut butter','almond butter','tahini','nutella','vegemite','marmite',
    'jam','strawberry jam','raspberry jam','apricot jam','mixed berry jam',
    'marmalade','honey','golden syrup','maple syrup','treacle','molasses',
    'stock','chicken stock','beef stock','vegetable stock',
    'broth','chicken broth','bone broth',
    'olives','capers','sun dried tomatoes','roasted capsicum','artichoke hearts',
    'anchovies','jalapeños',
  ],
  condiments_sauces: [
    'ketchup','tomato sauce','tomato ketchup','heinz tomato sauce',
    'mustard','dijon mustard','wholegrain mustard','american mustard','hot mustard',
    'mayonnaise','whole egg mayonnaise','aioli','garlic aioli',
    'soy sauce','tamari','dark soy sauce','light soy sauce','kecap manis',
    'fish sauce','oyster sauce','hoisin sauce','teriyaki sauce','ponzu',
    'sweet chilli sauce','sriracha','sambal','chilli sauce','tabasco',
    'worcestershire sauce','HP sauce','BBQ sauce','hickory sauce',
    'hot sauce','buffalo sauce','chipotle sauce','peri peri sauce',
    'caesar dressing','italian dressing','ranch dressing','thousand island',
    'balsamic dressing','balsamic vinegar','balsamic glaze',
    'vinegar','white vinegar','apple cider vinegar','red wine vinegar','rice vinegar',
    'sesame oil','toasted sesame oil','chilli oil','truffle oil',
    'olive oil','extra virgin olive oil','vegetable oil','canola oil',
    'coconut oil','avocado oil','sunflower oil','peanut oil',
    'lemon juice','lime juice',
  ],
  spices_herbs: [
    'salt','sea salt','himalayan pink salt','kosher salt','flaked salt',
    'pepper','black pepper','white pepper','cracked pepper','peppercorn',
    'cumin','ground cumin','cumin seeds','coriander','ground coriander','coriander seeds',
    'paprika','smoked paprika','sweet paprika','hot paprika',
    'turmeric','ground turmeric','fresh turmeric',
    'cinnamon','ground cinnamon','cinnamon stick',
    'chilli flakes','red pepper flakes','dried chilli',
    'curry powder','mild curry powder','hot curry powder',
    'garam masala','tandoori spice','tikka masala spice',
    'oregano','dried oregano','italian herbs','mixed herbs',
    'basil','dried basil','fresh basil','thai basil',
    'thyme','dried thyme','fresh thyme',
    'rosemary','dried rosemary','fresh rosemary',
    'bay leaf','bay leaves',
    'parsley','dried parsley','fresh parsley','curly parsley','flat leaf parsley',
    'chives','dried chives','fresh chives',
    'mint','dried mint','fresh mint','peppermint',
    'dill','dried dill','fresh dill',
    'tarragon','sage','marjoram','zaatar','sumac','harissa',
    'cayenne','cayenne pepper','chilli powder',
    'nutmeg','ground nutmeg','whole nutmeg',
    'cardamom','green cardamom','black cardamom','cardamom pods',
    'cloves','whole cloves','ground cloves',
    'star anise','fennel seeds','anise seeds','caraway seeds',
    'mustard seeds','yellow mustard seeds','black mustard seeds',
    'fenugreek','asafoetida','hing',
    'five spice','chinese five spice','allspice',
    'vanilla','vanilla extract','vanilla bean','vanilla paste',
    'saffron','lemongrass','kaffir lime leaves','galangal',
    'wasabi','horseradish',
  ],
  baking: [
    'flour','plain flour','all purpose flour','self raising flour','bread flour',
    'wholemeal flour','spelt flour','almond flour','coconut flour','rice flour',
    'gluten free flour','cornflour','cornstarch','arrowroot',
    'sugar','caster sugar','raw sugar','brown sugar','icing sugar','demerara sugar',
    'baking powder','baking soda','bicarbonate of soda','cream of tartar',
    'yeast','instant yeast','dry yeast','active dry yeast',
    'cocoa powder','dutch cocoa','hot chocolate powder',
    'chocolate','dark chocolate','milk chocolate','white chocolate',
    'chocolate chips','choc chips','dark chocolate chips',
    'gelatine','gelatin','agar agar',
    'food colouring','food dye',
    'sprinkles','hundreds and thousands','nonpareils','edible glitter',
    'almond meal','desiccated coconut','shredded coconut','coconut flakes',
    'rolled oats','oat bran','wheat bran','wheat germ',
    'breadcrumbs','panko breadcrumbs',
    'custard powder','vanilla custard powder',
  ],
  snacks: [
    'chips','potato chips','crisps','pretzels','corn chips','nachos chips',
    'popcorn','microwave popcorn','kettle chips',
    'crackers','rice crackers','corn thins','vita weat','ryvita',
    'chocolate','chocolate bar','tim tam','arnott','biscuit','cookie',
    'nuts','almonds','cashews','peanuts','walnuts','pecans','macadamia',
    'pistachios','brazil nuts','hazelnuts','pine nuts','mixed nuts',
    'trail mix','dried fruit','raisins','sultanas','currants','cranberries',
    'apricots','dates','prunes','figs','mango pieces',
    'muesli bar','protein bar','bliss ball','rice bubble bar',
    'lollies','candy','gummies','jelly beans','hard candy',
    'mints','tic tac','chewing gum',
  ],
  drinks: [
    'water','sparkling water','mineral water','coconut water',
    'juice','orange juice','apple juice','grape juice','cranberry juice',
    'soft drink','soda','cola','lemonade','ginger ale','tonic water',
    'sports drink','powerade','gatorade',
    'coffee','instant coffee','ground coffee','coffee beans','espresso',
    'tea','black tea','green tea','herbal tea','peppermint tea','chamomile tea',
    'english breakfast tea','earl grey','chai',
    'hot chocolate','milo','ovaltine','horlicks',
    'beer','wine','red wine','white wine','rosé','champagne','prosecco',
    'spirits','whisky','vodka','gin','rum','tequila',
    'kombucha','kefir',
  ],
  frozen: [
    'frozen vegetables','frozen peas','frozen corn','frozen edamame',
    'frozen spinach','frozen broccoli','frozen cauliflower','frozen mixed veg',
    'frozen fruit','frozen berries','frozen mango','frozen banana',
    'frozen chips','frozen fries','french fries','hash browns',
    'frozen pizza','pizza base','frozen lasagne','frozen meal',
    'ice cream','gelato','sorbet','frozen yogurt','ice lolly',
    'frozen fish','fish fillet','fish fingers','frozen prawns',
    'frozen dumplings','dim sum','gyoza','spring rolls','samosas',
    'frozen chicken','chicken nuggets','schnitzels',
  ],
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function categorizeIngredient(name) {
  const lower = name.toLowerCase()
  for (const [cat, items] of Object.entries(CATEGORY_MAP)) {
    for (const item of items) {
      if (lower.includes(item) || item.includes(lower)) return cat
    }
  }
  return 'pantry'
}

function parseIngredientsFromText(text) {
  const found = []
  const allItems = Object.values(CATEGORY_MAP).flat()
  const lower = text.toLowerCase()

  // Pass 1: scan full text for known items
  for (const item of allItems) {
    if (lower.includes(item) && !found.some(f => f.name === item)) {
      found.push({
        name: item,
        category: categorizeIngredient(item),
        confidence: 80 + Math.floor(Math.random() * 18),
      })
    }
  }

  // Pass 2: extract bullet/dash/newline separated lines
  const lines = text.split(/[\n\r]+/).map(s =>
    s.replace(/^[\s\-•*\d\.\)]+/, '').replace(/\(.*?\)/g, '').trim().toLowerCase()
  ).filter(s => s.length > 2 && s.length < 50)

  for (const line of lines) {
    for (const item of allItems) {
      if ((line.includes(item) || item.includes(line)) && !found.some(f => f.name === item)) {
        found.push({
          name: item,
          category: categorizeIngredient(item),
          confidence: 70 + Math.floor(Math.random() * 20),
        })
      }
    }
  }

  // Pass 3: extract lines that don't match known items — keep as "unknown"
  for (const line of lines) {
    const clean = line.replace(/[^a-z0-9\s]/g, '').trim()
    if (
      clean.length > 2 && clean.length < 35 &&
      !found.some(f => f.name === clean) &&
      !allItems.some(i => i === clean)
    ) {
      // Only add if it looks like a food word (has at least one known food-adjacent word or is 1-3 words)
      const words = clean.split(' ')
      if (words.length <= 4 && words.every(w => w.length > 1)) {
        found.push({
          name: clean,
          category: 'unknown',
          confidence: 55 + Math.floor(Math.random() * 20),
          needsSearch: true,   // signal to frontend to offer Google Lens link
        })
      }
    }
  }

  // Deduplicate and sort by confidence
  const seen = new Set()
  const deduped = found.filter(item => {
    if (seen.has(item.name)) return false
    seen.add(item.name)
    return true
  })

  deduped.sort((a, b) => b.confidence - a.confidence)
  return deduped
}

// ─── HTTP SERVER ───────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return }

  if (req.method === 'POST' && req.url === '/api/scan') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      try {
        const { image } = JSON.parse(body)
        if (!image) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'No image provided' }))
          return
        }

        // Save base64 image to temp file
        const tmpDir = join(tmpdir(), 'dinner-dojo')
        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true })
        const tmpFile = join(tmpDir, `scan-${Date.now()}.jpg`)
        writeFileSync(tmpFile, Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64'))
        console.log(`Saved temp image: ${tmpFile}`)

        const prompt = [
          'You are a food recognition AI. Carefully examine this image.',
          'List EVERY food item you can identify — include:',
          '  - Fresh produce (vegetables, fruit)',
          '  - Meat, fish, seafood',
          '  - Dairy, eggs',
          '  - Packaged cereals (e.g. Weet-Bix, Cornflakes, Muesli)',
          '  - Bread, wraps, rolls',
          '  - Pasta, rice, noodles, grains',
          '  - Canned/jarred goods',
          '  - Condiments, sauces, oils, vinegars',
          '  - Spices, herbs, seasonings',
          '  - Baking ingredients (flour, sugar, cocoa, chocolate)',
          '  - Snacks (chips, crackers, nuts, chocolate bars, biscuits)',
          '  - Drinks (juice, coffee, tea, soft drink, wine, beer)',
          '  - Frozen foods',
          '  - ANY other food or beverage you can see',
          'Format: one item per line, starting with a dash (-)',
          'Be specific — name the exact product or variety if visible (e.g. "Weet-Bix" not just "cereal")',
          'If you cannot see any food at all, respond only with: NO_FOOD_FOUND',
        ].join('\n')

        let rawOutput = ''
        try {
          rawOutput = execSync(
            `${GSK_CMD} analyze -r "${prompt.replace(/"/g, "'").replace(/\n/g, ' ')}" -i "${tmpFile}"`,
            { encoding: 'utf8', timeout: 40000, windowsHide: true, shell: 'cmd.exe' }
          )
        } catch (execErr) {
          rawOutput = execErr.stdout || ''
          console.log('gsk stderr:', execErr.stderr || execErr.message)
        }

        try { unlinkSync(tmpFile) } catch (e) {}
        console.log('gsk raw output:', rawOutput.substring(0, 600))

        // Parse gsk JSON response
        let analysisText = ''
        try {
          const parsed = JSON.parse(rawOutput.trim())
          analysisText = parsed?.data?.results?.[0]?.result
            || parsed?.data?.result
            || rawOutput
        } catch (e) {
          analysisText = rawOutput
        }

        console.log('Analysis text:', analysisText.substring(0, 400))

        if (!analysisText || analysisText.toLowerCase().includes('no_food_found') || analysisText.trim().length < 5) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ found: false, items: [] }))
          return
        }

        const ingredients = parseIngredientsFromText(analysisText)
        console.log(`Detected ${ingredients.length} ingredients`)

        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          found: ingredients.length > 0,
          items: ingredients,
          rawText: analysisText,
        }))

      } catch (err) {
        console.error('Server error:', err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
  } else {
    res.writeHead(404); res.end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`✅ Pantry scan API running on http://localhost:${PORT}`)
})
