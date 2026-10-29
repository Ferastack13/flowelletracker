import type { LearnArticle } from "../../lib/learn/types.ts";

/**
 * Reviewed educational guides. Keep this file independent of UI so
 * copy and sources can be updated without touching layout components.
 */
export const LEARN_ARTICLES: readonly LearnArticle[] = [
  {
    slug: "understanding-your-cycle",
    category: "cycle",
    title: "What a menstrual cycle actually is",
    summary:
      "A clear picture of bleeding, typical length, and why an app cannot confirm ovulation or prevent pregnancy.",
    featured: true,
    reviewedOn: "2026-10-29",
    minutes: 6,
    tags: ["cycle length", "menstruation", "body literacy"],
    sources: [
      {
        title: "Your Menstrual Cycle",
        publisher: "Office on Women's Health, U.S. Department of Health and Human Services",
        url: "https://www.womenshealth.gov/menstrual-cycle",
      },
      {
        title: "Your menstrual cycle",
        publisher: "American College of Obstetricians and Gynecologists",
        url: "https://www.acog.org/womens-health/faqs/your-menstrual-cycle",
      },
      {
        title: "Periods",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/periods/",
      },
    ],
    body: [
      {
        type: "p",
        text: "A menstrual cycle is the pattern of hormone changes that prepare the uterus for a possible pregnancy and, when pregnancy does not happen, lead to a period. A period is the bleeding that sheds the uterine lining. That is general body education. It is not a reading of your own hormones.",
      },
      {
        type: "callout",
        tone: "care",
        title: "Education, not a personal result",
        text: "These guides describe common patterns. They cannot tell you what is happening in your body today, confirm ovulation, or replace contraception or clinical care.",
      },
      {
        type: "h2",
        text: "Typical length, not a rule",
      },
      {
        type: "p",
        text: "Many cycles last about 21 to 35 days, counted from the first day of one period to the first day of the next. The NHS notes that a period often lasts two to seven days. Plenty of healthy people fall outside a 28-day average. A marketing number is not a diagnosis and is not a personalised forecast.",
      },
      {
        type: "p",
        text: "The Office on Women's Health describes a cycle as more than bleeding: hormone levels rise and fall, the lining of the uterus thickens, and an ovary may release an egg. Release of an egg is ovulation. You cannot see ovulation from a period-tracking app. Flowelle estimates a next-period window only from recorded starts, with cautious language, and never claims to detect a fertile window.",
      },
      {
        type: "h2",
        text: "What a cycle app can and cannot do",
      },
      {
        type: "ul",
        items: [
          "It can store dates and symptoms you choose to record.",
          "It can show an approximate next-period window after more than one recorded start.",
          "It cannot confirm ovulation, fertility, pregnancy, or a medical condition.",
          "It cannot prevent pregnancy. If you need contraception, speak with a clinician or a trusted family-planning service.",
        ],
      },
      {
        type: "p",
        text: "If your bleeding is new, has changed sharply, or you are worried, a clinician can take a history and, if needed, examine you. An article cannot do that work.",
      },
    ],
  },
  {
    slug: "why-cycles-vary",
    category: "cycle",
    title: "Why cycles vary from month to month",
    summary:
      "Stress, travel, sleep, illness, age, and contraception can change cycle length. Variation is common. Sudden change still deserves attention.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 5,
    tags: ["irregular periods", "stress", "contraception"],
    sources: [
      {
        title: "Your menstrual cycle",
        publisher: "American College of Obstetricians and Gynecologists",
        url: "https://www.acog.org/womens-health/faqs/your-menstrual-cycle",
      },
      {
        title: "Irregular periods",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/irregular-periods/",
      },
      {
        title: "Menstrual health",
        publisher: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/menstrual-health",
      },
    ],
    body: [
      {
        type: "p",
        text: "A cycle can be a few days shorter or longer than the one before it and still be ordinary. The WHO describes menstrual health as more than bleeding days: it includes access to information, products, and care without stigma. Length is only one piece of that picture.",
      },
      {
        type: "h2",
        text: "Common reasons a cycle shifts",
      },
      {
        type: "ul",
        items: [
          "The years just after first periods, and the years approaching menopause, often have more variation.",
          "Illness, heavy training, large changes in eating, or poor sleep can delay a period.",
          "Emotional stress can change timing for some people.",
          "Hormonal contraception, emergency contraception, and some medicines can change bleeding patterns.",
          "Pregnancy, breastfeeding, and some thyroid or pituitary conditions can pause or alter periods.",
        ],
      },
      {
        type: "p",
        text: "ACOG notes that it is common for cycles to be irregular in adolescence and later in reproductive life. That does not mean every change is harmless. It means a single late period is not, by itself, a diagnosis.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "When variation needs a clinician",
        text: "The NHS suggests speaking with a GP if periods suddenly become irregular, you bleed between periods, periods are fewer than every 21 days or more than every 35 days for some time, or you have not had a period for three months and you are not pregnant. Flowelle cannot decide this for you.",
      },
      {
        type: "p",
        text: "Recording starts over several months can help a clinician see a pattern. Treat those dates as notes you brought, not as a verdict from the app.",
      },
    ],
  },
  {
    slug: "period-cramps-and-comfort",
    category: "symptoms",
    title: "Period cramps: common pain, and what may ease it",
    summary:
      "Cramps are common. Heat, rest, and some medicines help many people. Pain that stops your life still belongs with a clinician.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 6,
    tags: ["cramps", "dysmenorrhea", "pain"],
    sources: [
      {
        title: "Period pain",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/period-pain/",
      },
      {
        title: "Dysmenorrhea: Painful Periods",
        publisher: "American College of Obstetricians and Gynecologists",
        url: "https://www.acog.org/womens-health/faqs/dysmenorrhea-painful-periods",
      },
    ],
    body: [
      {
        type: "p",
        text: "Period pain, often called cramps, is common. ACOG describes it as pain in the lower abdomen around menstruation, sometimes with backache, nausea, or loose stools. The NHS says the pain is usually in the lower tummy and often starts when bleeding starts, or a little before.",
      },
      {
        type: "p",
        text: "Cramps are not a character test. They are not proof of a disease, and they are not proof that nothing is wrong. Only a person who can examine you can sort those possibilities.",
      },
      {
        type: "h2",
        text: "Comfort measures many people try",
      },
      {
        type: "ul",
        items: [
          "A warm cloth or heating pad on the lower abdomen, used carefully so skin does not burn.",
          "Rest, gentle movement if it helps you, and clothes that do not press on a tender belly.",
          "Over-the-counter pain relief such as ibuprofen or paracetamol, used as the packet or a pharmacist directs, if these medicines are safe for you.",
          "The NHS notes that some people are offered hormonal contraception to reduce period pain after a discussion with a clinician. That is a medical decision, not an app setting.",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Do not assume pain is ordinary",
        text: "See a clinician if pain is sudden and severe, getting worse over months, present most of the month, paired with fainting, fever, or very heavy bleeding, or if it stops you from school, work, or sleep. Conditions such as endometriosis can cause period pain. An article cannot rule them in or out.",
      },
      {
        type: "p",
        text: "Flowelle can store a symptom note you write. It does not grade your pain or recommend a medicine.",
      },
    ],
  },
  {
    slug: "keeping-a-symptom-record",
    category: "symptoms",
    title: "How to keep a useful symptom record",
    summary:
      "Dates, a short description, and how strong a feeling was can help you and a clinician. A log is not a diagnosis.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 5,
    tags: ["tracking", "notes", "clinician visit"],
    sources: [
      {
        title: "Your Menstrual Cycle",
        publisher: "Office on Women's Health, U.S. Department of Health and Human Services",
        url: "https://www.womenshealth.gov/menstrual-cycle",
      },
      {
        title: "Periods",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/periods/",
      },
    ],
    body: [
      {
        type: "p",
        text: "A symptom record is a notebook with dates. It can help you notice what repeats. It can also help a clinician, because memory of pain on a Tuesday three weeks ago is often thin. It is not a lab test and it is not a diagnosis.",
      },
      {
        type: "h2",
        text: "What is worth writing down",
      },
      {
        type: "ul",
        items: [
          "The date bleeding started and, if you know it, the date it ended.",
          "How heavy the flow felt that day, in your own words.",
          "Cramps, headache, bloating, fatigue, breast tenderness, or mood changes, if those matter to you.",
          "How strong the feeling was, and whether it interrupted sleep, meals, or work.",
          "Medicines, heat, or rest you tried, and whether they helped a little, a lot, or not at all.",
        ],
      },
      {
        type: "p",
        text: "Keep notes short. A sentence is enough. You do not need to record every hour. You also do not need to record anything you do not want stored.",
      },
      {
        type: "callout",
        tone: "care",
        title: "Privacy and limits",
        text: "In Flowelle, symptom entries belong to your signed-in account. The app does not interpret them as a condition. If you need care, take a printed or written summary to a clinician rather than expecting the log to speak for you.",
      },
      {
        type: "p",
        text: "If you ever feel unsafe storing health notes on a shared device, use paper, or do not record that detail. Your safety comes first.",
      },
    ],
  },
  {
    slug: "mood-around-your-period",
    category: "mood",
    title: "Mood, PMS, and emotional wellbeing around a period",
    summary:
      "Feeling more irritable, low, or tired before a period is common. Distress that takes over the month needs care, not a label from an app.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 6,
    tags: ["PMS", "mood", "mental health"],
    sources: [
      {
        title: "Premenstrual syndrome (PMS)",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/",
      },
      {
        title: "Premenstrual Syndrome (PMS)",
        publisher: "Office on Women's Health, U.S. Department of Health and Human Services",
        url: "https://www.womenshealth.gov/menstrual-cycle/premenstrual-syndrome",
      },
    ],
    body: [
      {
        type: "p",
        text: "Some people notice mood shifts, breast tenderness, bloating, or tiredness in the days before a period. The NHS describes premenstrual syndrome (PMS) as a mix of physical and emotional symptoms that settle when bleeding starts or shortly after. The Office on Women's Health describes a similar picture. Not everyone has PMS. Having a feeling does not mean you have a disorder.",
      },
      {
        type: "h2",
        text: "What may help, without promising a cure",
      },
      {
        type: "ul",
        items: [
          "Regular meals, movement you can actually keep, and sleep as steady as your life allows.",
          "Naming the week to a trusted person, so irritability is not only something you swallow.",
          "The NHS mentions that some people are offered talking therapies, medicines, or hormonal contraception after a clinical assessment. Those are clinician decisions.",
        ],
      },
      {
        type: "p",
        text: "Be careful with supplements marketed for PMS. Many are poorly tested. Some interact with medicines. A product page is not evidence.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "When mood needs urgent help",
        text: "Seek clinical or crisis support if you have thoughts of harming yourself, cannot get out of bed for days, or symptoms last all month rather than settling after a period. Premenstrual dysphoric disorder is a more severe pattern that a clinician has to assess. Flowelle will not diagnose it.",
      },
      {
        type: "p",
        text: "If you are in immediate danger, use local emergency services. In the United States, the 988 Suicide & Crisis Lifeline is one option. In the United Kingdom, NHS 111 or local crisis lines can help. Use the service that exists where you live.",
      },
    ],
  },
  {
    slug: "everyday-self-care",
    category: "self-care",
    title: "Everyday self-care that does not wait for a predicted phase",
    summary:
      "Water, rest, movement, and warmth help many people on ordinary days. They are not a treatment plan tied to a fertile-window forecast.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 5,
    tags: ["habits", "rest", "hydration"],
    sources: [
      {
        title: "Menstrual health",
        publisher: "World Health Organization",
        url: "https://www.who.int/news-room/fact-sheets/detail/menstrual-health",
      },
      {
        title: "Period pain",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/period-pain/",
      },
    ],
    body: [
      {
        type: "p",
        text: "Self-care during a cycle is often ordinary: drinking water, eating when you can, moving if it eases you, and resting when pain or fatigue arrives. The WHO frames menstrual health as dignity and access, not as a productivity challenge. You do not owe anyone a perfect routine.",
      },
      {
        type: "h2",
        text: "Four small pillars",
      },
      {
        type: "ul",
        items: [
          "Hydration: water or a warm drink, especially if you feel depleted.",
          "Movement: a short walk or stretch if it helps cramps or mood. Skip it if it makes pain worse.",
          "Sleep: as regular a night as you can keep. Exhaustion can make pain feel louder.",
          "Personal care: a shower, clean cloths, heat, or whatever helps you feel housed in your body.",
        ],
      },
      {
        type: "p",
        text: "Flowelle's self-care check-ins are a record of those four marks. They are not a streak score and they are not timed to a predicted ovulation day. There is no fertile-window forecast here to schedule your life around.",
      },
      {
        type: "callout",
        tone: "care",
        title: "Care is not a moral grade",
        text: "Missing a walk or a glass of water does not mean you failed your cycle. If self-care advice ever sounds like shame, set it down. If pain, bleeding, or mood is taking over, seek a clinician rather than a stricter habit list.",
      },
    ],
  },
  {
    slug: "skin-and-body-care-during-a-period",
    category: "skincare",
    title: "Skin and body care during menstruation",
    summary:
      "Keep skin routines simple. Hormones can change oil and comfort, but a cycle app cannot prescribe a product, and no phase cream is required.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 5,
    tags: ["skin", "acne", "body care"],
    sources: [
      {
        title: "Acne",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/acne/",
      },
      {
        title: "Your Menstrual Cycle",
        publisher: "Office on Women's Health, U.S. Department of Health and Human Services",
        url: "https://www.womenshealth.gov/menstrual-cycle",
      },
    ],
    body: [
      {
        type: "p",
        text: "Skin can feel oilier, drier, or more easily flushed at different points in a month. Some people notice spots around a period. The NHS describes acne as a common skin condition that can be influenced by hormones, among other factors. That is not the same as a personalised skincare protocol from an app.",
      },
      {
        type: "h2",
        text: "Gentle habits that are usually enough",
      },
      {
        type: "ul",
        items: [
          "Wash with a mild cleanser once or twice a day. Scrubbing harder does not treat hormones.",
          "Use a moisturiser your skin already tolerates.",
          "If you use period products, change them as directed and wash your hands. The vulva usually needs water, not perfume.",
          "Choose underwear and pads or a cup you can keep clean. Fragrance and harsh wipes can irritate.",
        ],
      },
      {
        type: "p",
        text: "There is no reliable evidence that you must buy a different serum for each imagined cycle phase. Marketing that ties products to ovulation is not a clinical plan. Flowelle does not sell that story and does not detect ovulation.",
      },
      {
        type: "callout",
        tone: "caution",
        title: "When skin or genital symptoms need care",
        text: "See a clinician or pharmacist for sudden severe rash, sores, unusual discharge with odour or itching that does not settle, or acne that scars or hurts your wellbeing. Do not put leftover steroid cream or someone else's medicine on genital skin unless a clinician told you to.",
      },
    ],
  },
  {
    slug: "when-to-seek-medical-advice",
    category: "medical",
    title: "When period symptoms need medical attention",
    summary:
      "Heavy bleeding, one-sided severe pain, bleeding after sex, and symptoms that stop daily life are reasons to seek care. An app cannot clear you.",
    featured: false,
    reviewedOn: "2026-10-29",
    minutes: 6,
    tags: ["red flags", "heavy periods", "emergency"],
    sources: [
      {
        title: "Heavy periods",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/heavy-periods/",
      },
      {
        title: "Endometriosis symptoms",
        publisher: "NHS",
        url: "https://www.nhs.uk/conditions/endometriosis/symptoms/",
      },
      {
        title: "Your menstrual cycle",
        publisher: "American College of Obstetricians and Gynecologists",
        url: "https://www.acog.org/womens-health/faqs/your-menstrual-cycle",
      },
    ],
    body: [
      {
        type: "p",
        text: "Most periods are uncomfortable and still manageable. Some patterns are a reason to see a doctor, midwife, or nurse rather than wait for an app to reassure you. Flowelle will not tell you that a symptom is harmless.",
      },
      {
        type: "h2",
        text: "Seek care promptly",
      },
      {
        type: "ul",
        items: [
          "Bleeding so heavy you soak through a pad or tampon every hour or two, pass large clots, or feel faint or breathless. The NHS describes heavy periods this way and notes they can lead to anaemia.",
          "A period that lasts longer than seven days, or bleeding between periods, after sex, or after menopause.",
          "Sudden, severe pelvic pain, especially on one side, with dizziness or shoulder-tip pain — this can be an emergency.",
          "Fever, foul-smelling discharge, or pain with urination that is new.",
          "Pain during sex, pain when opening your bowels around a period, or period pain that has worsened over time. The NHS lists these among symptoms that can occur with endometriosis. Only a clinician can assess that.",
          "A positive pregnancy test with bleeding or pain, or a missed period with severe pain.",
        ],
      },
      {
        type: "callout",
        tone: "caution",
        title: "Emergencies",
        text: "If you collapse, cannot stop bleeding, or have the worst pelvic pain of your life, use local emergency services. Do not wait for a tracking insight.",
      },
      {
        type: "p",
        text: "Bring a list of dates, medicines, and questions. Ask for an interpreter if you need one. You are allowed to seek a second opinion. Education in this library is general. Your care should be personal, and it should come from a person qualified to give it.",
      },
    ],
  },
];
