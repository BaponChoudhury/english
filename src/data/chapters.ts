export interface Sentence {
  text: string
  emoji?: string
}

export interface Dialogue {
  lines: { speaker: string; text: string }[]
}

export interface Vocabulary {
  word: string
  emoji?: string
}

export interface ChapterData {
  day: number
  week: number
  title: string
  subtitle: string
  learningGoal: string
  vocabulary: Vocabulary[]
  sentences: Sentence[]
  dialogues: Dialogue[]
  quizWords: string[]
}

export const CHAPTERS: ChapterData[] = [
  // ── WEEK 1 ──────────────────────────────────────────────────────────────────
  {
    day: 1,
    week: 1,
    title: 'Hello, Hi & Goodbye',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Say Hello, Hi and Goodbye with confidence!',
    vocabulary: [
      { word: 'Hello', emoji: '👋' },
      { word: 'Hi', emoji: '😊' },
      { word: 'Goodbye', emoji: '👋' },
      { word: 'Bye-bye', emoji: '✌️' },
    ],
    sentences: [
      { text: 'Hello children!', emoji: '👋' },
      { text: 'Hello teacher!', emoji: '😊' },
      { text: 'Hi children!', emoji: '✌️' },
      { text: 'Hi teacher!', emoji: '😄' },
      { text: 'Goodbye children!', emoji: '👋' },
      { text: 'Goodbye teacher!', emoji: '👋' },
      { text: 'Bye-bye!', emoji: '✌️' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child 1', text: 'Hello!' },
          { speaker: 'Child 2', text: 'Hello!' },
          { speaker: 'Child 1', text: 'Goodbye!' },
          { speaker: 'Child 2', text: 'Goodbye!' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 2,
    week: 1,
    title: 'Good Morning',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Greet people at different times of the day!',
    vocabulary: [
      { word: 'Good morning', emoji: '🌅' },
      { word: 'Good afternoon', emoji: '☀️' },
      { word: 'Good evening', emoji: '🌆' },
      { word: 'Good night', emoji: '🌙' },
      { word: 'Thank you', emoji: '🙏' },
      { word: 'You are welcome', emoji: '😊' },
    ],
    sentences: [
      { text: 'Good morning children!', emoji: '🌅' },
      { text: 'Good morning teacher!', emoji: '😊' },
      { text: 'Good morning father!', emoji: '🌅' },
      { text: 'Good evening mother!', emoji: '🌆' },
      { text: 'Good afternoon sir!', emoji: '☀️' },
      { text: 'Good morning to all!', emoji: '🌅' },
      { text: 'Good night uncle!', emoji: '🌙' },
      { text: 'Good night grandpa!', emoji: '🌙' },
      { text: 'Thank you!', emoji: '🙏' },
      { text: 'You are welcome!', emoji: '😊' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'Here you are.' },
          { speaker: 'Student', text: 'Thank you.' },
          { speaker: 'Teacher', text: 'You are welcome.' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Thank you.' },
          { speaker: 'Child B', text: 'You are welcome.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 3,
    week: 1,
    title: 'How Are You?',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Ask and answer "How are you?" and say feelings!',
    vocabulary: [
      { word: 'Happy', emoji: '😊' },
      { word: 'Fine', emoji: '🙂' },
      { word: 'Sad', emoji: '😢' },
      { word: 'Good', emoji: '👍' },
      { word: "It's okay", emoji: '😌' },
      { word: "It's fine", emoji: '✅' },
      { word: 'No need', emoji: '🙅' },
    ],
    sentences: [
      { text: 'How are you?', emoji: '🤗' },
      { text: 'I am fine! Thank you.', emoji: '🙂' },
      { text: 'I am happy. Thank you.', emoji: '😊' },
      { text: 'I am good.', emoji: '👍' },
      { text: 'I am sad.', emoji: '😢' },
      { text: "It's okay.", emoji: '😌' },
      { text: "It's fine.", emoji: '✅' },
      { text: 'No need.', emoji: '🙅' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'How are you?' },
          { speaker: 'Child', text: 'I am happy. Thank you.' },
          { speaker: 'Teacher', text: 'Very good!' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Sorry.' },
          { speaker: 'Child B', text: "It's okay." },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 4,
    week: 1,
    title: 'My Name Is…',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Introduce yourself and ask others their name!',
    vocabulary: [
      { word: 'My name is Aryan', emoji: '🙋' },
      { word: 'What is your name?', emoji: '❓' },
      { word: 'His name is', emoji: '👦' },
      { word: 'Her name is', emoji: '👧' },
    ],
    sentences: [
      { text: 'My name is Aryan.', emoji: '🙋' },
      { text: 'What is your name?', emoji: '❓' },
      { text: 'My name is Aryan. What is your name?', emoji: '🙋' },
      { text: "What is your father's name?", emoji: '👨' },
      { text: "My father's name is Rajan.", emoji: '👨' },
      { text: "What is your mother's name?", emoji: '👩' },
      { text: "My mother's name is Priya.", emoji: '👩' },
      { text: "What is your school's name?", emoji: '🏫' },
      { text: "My school's name is Peace Valley English School.", emoji: '🏫' },
      { text: "What is your teacher's name?", emoji: '👩‍🏫' },
      { text: "My teacher's name is Miss Rina.", emoji: '👩‍🏫' },
      { text: "What is your brother's name?", emoji: '👦' },
      { text: "My brother's name is Rohan.", emoji: '👦' },
      { text: "What is your sister's name?", emoji: '👧' },
      { text: "My sister's name is Riya.", emoji: '👧' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'What is your name?' },
          { speaker: 'Child', text: 'My name is Aryan.' },
          { speaker: 'Teacher', text: 'Very good, Aryan! What is your father\'s name?' },
          { speaker: 'Child', text: 'My father\'s name is Rajan.' },
          { speaker: 'Teacher', text: 'Excellent! And your mother\'s name?' },
          { speaker: 'Child', text: 'My mother\'s name is Priya.' },
          { speaker: 'Teacher', text: 'Well done!' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'What is your name?' },
          { speaker: 'Child B', text: 'My name is Riya. What is your name?' },
          { speaker: 'Child A', text: 'My name is Aryan.' },
          { speaker: 'Child B', text: 'What is your school\'s name?' },
          { speaker: 'Child A', text: 'My school\'s name is PVE School.' },
        ],
      },
      {
        lines: [
          { speaker: 'Teacher', text: 'What is your teacher\'s name?' },
          { speaker: 'Child', text: 'My teacher\'s name is Miss Rina.' },
          { speaker: 'Teacher', text: 'What is your principal\'s name?' },
          { speaker: 'Child', text: 'My principal\'s name is Mr. Kumar.' },
          { speaker: 'Teacher', text: 'Perfect!' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 5,
    week: 1,
    title: 'Please & Thank You',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Use "Please" and "Thank you" politely every day!',
    vocabulary: [
      { word: 'Please', emoji: '🙏' },
      { word: 'Thank you', emoji: '😊' },
      { word: 'Here you are', emoji: '🤲' },
      { word: "You're welcome", emoji: '😊' },
    ],
    sentences: [
      { text: 'Can I have a pencil please?', emoji: '✏️' },
      { text: 'Here you are.', emoji: '🤲' },
      { text: 'Thank you!', emoji: '😊' },
      { text: "You're welcome.", emoji: '😊' },
      { text: 'Can I have a book please?', emoji: '📚' },
      { text: 'Here you are.', emoji: '🤲' },
      { text: 'Thank you very much!', emoji: '😊' },
      { text: "You're welcome.", emoji: '😊' },
      { text: 'Can I have some water please?', emoji: '💧' },
      { text: 'Here you are.', emoji: '🤲' },
      { text: 'Thank you teacher.', emoji: '😊' },
      { text: "You're welcome.", emoji: '😊' },
      { text: 'Please give me a toy.', emoji: '🧸' },
      { text: 'Here you are.', emoji: '🤲' },
      { text: 'Thank you!', emoji: '😊' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child A', text: 'Can I have a pencil please?' },
          { speaker: 'Child B', text: 'Here you are.' },
          { speaker: 'Child A', text: 'Thank you!' },
          { speaker: 'Child B', text: "You're welcome." },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Can I have some water please?' },
          { speaker: 'Teacher', text: 'Here you are.' },
          { speaker: 'Child A', text: 'Thank you, Miss.' },
          { speaker: 'Teacher', text: "You're welcome." },
        ],
      },
      {
        lines: [
          { speaker: 'Teacher', text: 'What do you say when you want something?' },
          { speaker: 'Child', text: 'Please!' },
          { speaker: 'Teacher', text: 'Good! And what do you say after receiving it?' },
          { speaker: 'Child', text: 'Thank you!' },
          { speaker: 'Teacher', text: 'Excellent!' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 6,
    week: 1,
    title: 'Sorry & Excuse Me',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Say Sorry, Excuse me, Don\'t worry and Be happy!',
    vocabulary: [
      { word: 'Sorry', emoji: '😔' },
      { word: 'I am sorry', emoji: '🙇' },
      { word: 'Excuse me', emoji: '🙋' },
      { word: "Don't worry", emoji: '🤗' },
      { word: 'Be happy', emoji: '😊' },
      { word: "Don't cry", emoji: '😢' },
      { word: 'No problem', emoji: '👍' },
    ],
    sentences: [
      { text: 'What do you say when you are late?', emoji: '⏰' },
      { text: 'I am sorry, I am late.', emoji: '🙇' },
      { text: "It's okay. Don't be late again.", emoji: '👩‍🏫' },
      { text: 'What do you say when you break something?', emoji: '✏️' },
      { text: 'I am sorry, I broke the pencil.', emoji: '🙇' },
      { text: 'No problem. Be careful next time.', emoji: '👩‍🏫' },
      { text: 'What do you say when you forget your homework?', emoji: '🤔' },
      { text: 'I am sorry, I forgot my homework.', emoji: '🙇' },
      { text: "It's fine. Bring it tomorrow.", emoji: '👩‍🏫' },
      { text: 'What do you say before entering the class?', emoji: '🙋' },
      { text: 'Excuse me, can I come in?', emoji: '🙋' },
      { text: 'Yes, come in.', emoji: '👩‍🏫' },
      { text: 'What do you say when your friend is sad?', emoji: '😢' },
      { text: "I say don't cry. Don't worry. Be happy!", emoji: '🤗' },
      { text: 'What do you say when you hurt someone?', emoji: '😔' },
      { text: "I am sorry, I didn't mean it.", emoji: '🙇' },
      { text: "It's okay. I forgive you.", emoji: '😊' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child A', text: 'I am sorry I pushed you.' },
          { speaker: 'Child B', text: "It's okay." },
          { speaker: 'Child A', text: 'I am sorry, I didn\'t mean it.' },
          { speaker: 'Child B', text: "Don't worry. Be happy!" },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Sorry teacher, I am late.' },
          { speaker: 'Teacher', text: "It's fine. Don't be late again." },
          { speaker: 'Child A', text: 'I am sorry, I forgot my bag.' },
          { speaker: 'Teacher', text: "No problem. Sit down." },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Excuse me.' },
          { speaker: 'Teacher', text: 'Yes?' },
          { speaker: 'Child A', text: 'I am sorry, I broke the pencil.' },
          { speaker: 'Teacher', text: "It's okay. Be careful next time." },
          { speaker: 'Child A', text: 'Thank you, teacher.' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Why are you crying?' },
          { speaker: 'Child B', text: 'I am sad.' },
          { speaker: 'Child A', text: "Don't cry. Don't worry. Be happy!" },
          { speaker: 'Child B', text: 'Thank you friend.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 7,
    week: 1,
    title: 'Week 1 Revision',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Review everything from Week 1 — you got this!',
    vocabulary: [
      { word: 'Hello', emoji: '👋' },
      { word: 'Good morning', emoji: '🌅' },
      { word: 'How are you?', emoji: '🤗' },
      { word: 'My name is', emoji: '🙋' },
      { word: 'Please', emoji: '🙏' },
      { word: 'Thank you', emoji: '😊' },
      { word: 'Sorry', emoji: '😔' },
      { word: 'Excuse me', emoji: '🙋' },
      { word: "Don't worry", emoji: '🤗' },
      { word: 'Be happy', emoji: '😊' },
    ],
    sentences: [
      { text: 'Say hello to your teacher!', emoji: '👋' },
      { text: 'Hello teacher!', emoji: '👋' },
      { text: 'Good morning teacher!', emoji: '🌅' },
      { text: 'Good morning children!', emoji: '🌅' },
      { text: 'How are you?', emoji: '🤗' },
      { text: 'I am fine, thank you!', emoji: '😊' },
      { text: 'What is your name?', emoji: '❓' },
      { text: 'My name is Aryan.', emoji: '🙋' },
      { text: 'What is your school\'s name?', emoji: '🏫' },
      { text: 'My school\'s name is Peace Valley English School.', emoji: '🏫' },
      { text: 'What do you say when you want something?', emoji: '🙏' },
      { text: 'Can I have a pencil please?', emoji: '🙏' },
      { text: 'Here you are.', emoji: '🤲' },
      { text: 'Thank you!', emoji: '😊' },
      { text: 'You\'re welcome.', emoji: '😊' },
      { text: 'What do you say when you are late?', emoji: '⏰' },
      { text: 'I am sorry, I am late.', emoji: '🙇' },
      { text: 'It\'s okay. Don\'t be late again.', emoji: '👩‍🏫' },
      { text: 'What do you say before entering class?', emoji: '🙋' },
      { text: 'Excuse me, can I come in?', emoji: '🙋' },
      { text: 'Yes, come in.', emoji: '👩‍🏫' },
      { text: 'What do you say when your friend is sad?', emoji: '😢' },
      { text: "I say don't worry. Be happy!", emoji: '🤗' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child', text: 'Good morning teacher!' },
          { speaker: 'Teacher', text: 'Good morning! How are you?' },
          { speaker: 'Child', text: 'I am fine, thank you!' },
          { speaker: 'Teacher', text: 'What is your name?' },
          { speaker: 'Child', text: 'My name is Aryan.' },
          { speaker: 'Teacher', text: 'Very good, Aryan!' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Hello! What is your name?' },
          { speaker: 'Child B', text: 'My name is Riya. What is your name?' },
          { speaker: 'Child A', text: 'My name is Aryan.' },
          { speaker: 'Child B', text: 'Can I have your pencil please?' },
          { speaker: 'Child A', text: 'Here you are.' },
          { speaker: 'Child B', text: 'Thank you!' },
          { speaker: 'Child A', text: "You're welcome." },
        ],
      },
      {
        lines: [
          { speaker: 'Child', text: 'Sorry teacher, I am late.' },
          { speaker: 'Teacher', text: "It's okay. Don't be late again." },
          { speaker: 'Child', text: 'Excuse me, can I sit down?' },
          { speaker: 'Teacher', text: 'Yes, sit down.' },
          { speaker: 'Child', text: 'Thank you teacher.' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Why are you sad?' },
          { speaker: 'Child B', text: 'I forgot my book.' },
          { speaker: 'Child A', text: "Don't worry. Be happy!" },
          { speaker: 'Child B', text: 'Thank you friend.' },
        ],
      },
    ],
    quizWords: [],
  },

  // ── WEEK 2 ──────────────────────────────────────────────────────────────────
  {
    day: 8,
    week: 2,
    title: 'My Father & My Mother',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Name your parents and talk about them!',
    vocabulary: [
      { word: 'Father', emoji: '👨' },
      { word: 'Papa', emoji: '👨' },
      { word: 'Daddy', emoji: '👨' },
      { word: 'Mother', emoji: '👩' },
      { word: 'Mama', emoji: '👩' },
      { word: 'Mummy', emoji: '👩' },
      { word: 'Parents', emoji: '👨‍👩' },
    ],
    sentences: [
      { text: 'This is my father.', emoji: '👨' },
      { text: 'This is my mother.', emoji: '👩' },
      { text: 'This is my papa.', emoji: '👨' },
      { text: 'This is my mummy.', emoji: '👩' },
      { text: 'Mother and Father are Parents.', emoji: '👨‍👩' },
      { text: 'I love my parents.', emoji: '❤️' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'Who is he?' },
          { speaker: 'Students', text: 'Father!' },
          { speaker: 'Teacher', text: 'Who is she?' },
          { speaker: 'Students', text: 'Mother!' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Who is this?' },
          { speaker: 'Child B', text: 'This is my father.' },
          { speaker: 'Child A', text: 'Who is this?' },
          { speaker: 'Child B', text: 'This is my mother.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 9,
    week: 2,
    title: 'Brother, Sister & Baby',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Talk about your brothers, sisters and family!',
    vocabulary: [
      { word: 'Brother', emoji: '👦' },
      { word: 'Sister', emoji: '👧' },
      { word: 'Baby', emoji: '👶' },
      { word: 'Siblings', emoji: '👫' },
    ],
    sentences: [
      { text: 'This is my brother.', emoji: '👦' },
      { text: 'This is my sister.', emoji: '👧' },
      { text: 'Brother and sister are siblings.', emoji: '👫' },
      { text: 'I have a brother.', emoji: '👦' },
      { text: 'I have a sister.', emoji: '👧' },
      { text: 'I love my brother.', emoji: '❤️' },
      { text: 'I love my sister.', emoji: '❤️' },
      { text: 'I love my siblings.', emoji: '❤️' },
      { text: 'This is a baby.', emoji: '👶' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'Do you have a brother?' },
          { speaker: 'Child', text: 'Yes!' },
          { speaker: 'Teacher', text: 'Do you have a sister?' },
          { speaker: 'Child', text: 'Yes!' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 10,
    week: 2,
    title: 'Grandfather & Grandmother',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Name your grandparents and show them love!',
    vocabulary: [
      { word: 'Grandfather', emoji: '👴' },
      { word: 'Grandpa', emoji: '👴' },
      { word: 'Grandmother', emoji: '👵' },
      { word: 'Grandma', emoji: '👵' },
      { word: 'Grandparents', emoji: '👴👵' },
      { word: 'Grandchild', emoji: '🧒' },
    ],
    sentences: [
      { text: 'This is my grandfather.', emoji: '👴' },
      { text: 'This is my grandmother.', emoji: '👵' },
      { text: 'This is my grandpa.', emoji: '👴' },
      { text: 'This is my grandma.', emoji: '👵' },
      { text: 'Grandfather and grandmother are grandparents.', emoji: '👴👵' },
      { text: 'I love my grandpa.', emoji: '❤️' },
      { text: 'I love my grandma.', emoji: '❤️' },
      { text: 'Grandpa loves me.', emoji: '💕' },
      { text: 'Grandma loves me.', emoji: '💕' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'Do you love your grandparents?' },
          { speaker: 'Students', text: 'Yes!' },
          { speaker: 'Teacher', text: 'Very good!' },
        ],
      },
      {
        lines: [
          { speaker: 'Teacher', text: 'Who is this?' },
          { speaker: 'Students', text: 'This is my grandma.' },
          { speaker: 'Teacher', text: 'Who is this?' },
          { speaker: 'Students', text: 'This is my grandpa.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 11,
    week: 2,
    title: 'Uncle, Aunt & Cousin',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Name your uncle, aunt and cousins!',
    vocabulary: [
      { word: 'Uncle', emoji: '👨' },
      { word: 'Aunt', emoji: '👩' },
      { word: 'Aunty', emoji: '👩' },
      { word: 'Cousin', emoji: '🧒' },
    ],
    sentences: [
      { text: 'This is my uncle.', emoji: '👨' },
      { text: 'This is my aunt.', emoji: '👩' },
      { text: 'This is my cousin.', emoji: '🧒' },
      { text: "The brother of your father is your uncle.", emoji: '👨' },
      { text: "Your uncle's wife is your aunt.", emoji: '👩' },
      { text: "Your uncle's son or daughter is your cousin.", emoji: '🧒' },
      { text: 'I love my uncle.', emoji: '❤️' },
      { text: 'I love my aunt.', emoji: '❤️' },
      { text: 'I love my cousin.', emoji: '❤️' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'Who is this?' },
          { speaker: 'Students', text: 'This is my uncle.' },
          { speaker: 'Teacher', text: 'Who is this?' },
          { speaker: 'Students', text: 'This is my aunt.' },
          { speaker: 'Teacher', text: 'Who is this?' },
          { speaker: 'Students', text: 'This is my cousin.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 12,
    week: 2,
    title: 'My Home',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Name rooms in your home and ask for food politely!',
    vocabulary: [
      { word: 'Home', emoji: '🏠' },
      { word: 'House', emoji: '🏡' },
      { word: 'Bedroom', emoji: '🛏️' },
      { word: 'Kitchen', emoji: '🍳' },
      { word: 'Living Room', emoji: '🛋️' },
      { word: 'Bathroom', emoji: '🚿' },
      { word: 'Toilet', emoji: '🚽' },
    ],
    sentences: [
      { text: 'This is my home.', emoji: '🏠' },
      { text: 'This is my room.', emoji: '🛏️' },
      { text: 'This is my kitchen.', emoji: '🍳' },
      { text: 'I live in my home.', emoji: '🏠' },
      { text: 'I love my home.', emoji: '❤️' },
      { text: 'I want water please.', emoji: '💧' },
      { text: 'I want milk please.', emoji: '🥛' },
      { text: 'Food please.', emoji: '🍱' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child A', text: 'Water please.' },
          { speaker: 'Child B', text: 'Here.' },
          { speaker: 'Child A', text: 'Thank you.' },
          { speaker: 'Child B', text: 'You are welcome.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 13,
    week: 2,
    title: 'Family Feelings & Manners',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Use manners with family and say how you feel!',
    vocabulary: [
      { word: 'I love my family', emoji: '❤️' },
      { word: 'I am happy', emoji: '😊' },
      { word: 'Be happy', emoji: '😄' },
      { word: "Don't cry", emoji: '😢' },
      { word: 'Thank you mama', emoji: '🙏' },
      { word: 'Sorry papa', emoji: '😔' },
    ],
    sentences: [
      { text: 'Do you love your family?', emoji: '❓' },
      { text: 'Yes! I love my family.', emoji: '❤️' },
      { text: 'I am happy.', emoji: '😊' },
      { text: 'Be happy.', emoji: '😄' },
      { text: "Don't cry.", emoji: '😢' },
      { text: 'Thank you mama.', emoji: '🙏' },
      { text: 'Sorry mama.', emoji: '😔' },
      { text: 'Thank you papa.', emoji: '🙏' },
      { text: 'Sorry papa.', emoji: '😔' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child', text: 'Mama, water please.' },
          { speaker: 'Teacher', text: 'Here.' },
          { speaker: 'Child', text: 'Thank you!' },
          { speaker: 'Teacher', text: 'You are welcome.' },
        ],
      },
    ],
    quizWords: [],
  },
  {
    day: 14,
    week: 2,
    title: 'Week 2 Revision',
    subtitle: 'Chapter 2 · My Family & My Home',
    learningGoal: 'Review the whole family — you know them all!',
    vocabulary: [
      { word: 'Father', emoji: '👨' },
      { word: 'Mother', emoji: '👩' },
      { word: 'Brother', emoji: '👦' },
      { word: 'Sister', emoji: '👧' },
      { word: 'Grandpa', emoji: '👴' },
      { word: 'Grandma', emoji: '👵' },
      { word: 'Uncle', emoji: '👨' },
      { word: 'Aunt', emoji: '👩' },
      { word: 'Cousin', emoji: '🧒' },
      { word: 'Home', emoji: '🏠' },
    ],
    sentences: [
      { text: 'This is my father.', emoji: '👨' },
      { text: 'This is my mother.', emoji: '👩' },
      { text: 'This is my brother.', emoji: '👦' },
      { text: 'This is my sister.', emoji: '👧' },
      { text: 'This is my grandpa.', emoji: '👴' },
      { text: 'This is my grandma.', emoji: '👵' },
      { text: 'This is my uncle.', emoji: '👨' },
      { text: 'This is my aunt.', emoji: '👩' },
      { text: 'This is my cousin.', emoji: '🧒' },
      { text: 'I love my family.', emoji: '❤️' },
      { text: 'Water please.', emoji: '💧' },
      { text: 'Thank you.', emoji: '🙏' },
      { text: 'I am happy.', emoji: '😊' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child A', text: 'Hello grandma!' },
          { speaker: 'Child B', text: 'Hello!' },
          { speaker: 'Child A', text: 'How are you?' },
          { speaker: 'Child B', text: 'I am fine.' },
        ],
      },
      {
        lines: [
          { speaker: 'Child', text: 'Mama, milk please.' },
          { speaker: 'Teacher', text: 'Here.' },
          { speaker: 'Child', text: 'Thank you.' },
          { speaker: 'Teacher', text: 'You are welcome.' },
        ],
      },
    ],
    quizWords: [],
  },
]
