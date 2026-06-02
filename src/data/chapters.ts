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
    quizWords: ['Hello', 'Hi', 'Goodbye', 'Bye-bye'],
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
    quizWords: ['Good morning', 'Good afternoon', 'Good evening', 'Good night', 'Thank you', 'You are welcome'],
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
    quizWords: ['Happy', 'Fine', 'Sad', "It's okay", 'No need'],
  },
  {
    day: 4,
    week: 1,
    title: 'My Name Is…',
    subtitle: 'Chapter 1 · Greetings, Manners & Introducing Myself',
    learningGoal: 'Introduce yourself and ask others their name!',
    vocabulary: [
      { word: 'My name is', emoji: '🙋' },
      { word: 'What is your name?', emoji: '❓' },
    ],
    sentences: [
      { text: 'My name is…', emoji: '🙋' },
      { text: 'What is your name?', emoji: '❓' },
      { text: "What is your father's name?", emoji: '👨' },
      { text: "What is your mother's name?", emoji: '👩' },
      { text: "What is your school's name?", emoji: '🏫' },
      { text: "What is your teacher's name?", emoji: '👩‍🏫' },
      { text: "What is your principal's name?", emoji: '👨‍💼' },
      { text: "What is your brother's name?", emoji: '👦' },
      { text: "What is your sister's name?", emoji: '👧' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Teacher', text: 'What is your name?' },
          { speaker: 'Child', text: 'My name is…' },
          { speaker: 'Teacher', text: 'Very good!' },
        ],
      },
    ],
    quizWords: ['My name is', 'What is your name?', 'school', 'teacher', 'principal'],
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
    ],
    sentences: [
      { text: 'Please!', emoji: '🙏' },
      { text: 'Thank you!', emoji: '😊' },
      { text: 'Please give me a book.', emoji: '📚' },
      { text: 'Please give me a glass of water.', emoji: '💧' },
      { text: 'Pencil please.', emoji: '✏️' },
      { text: 'Water please.', emoji: '💧' },
      { text: 'Book please.', emoji: '📚' },
      { text: 'Toy please.', emoji: '🧸' },
      { text: 'Here you are.', emoji: '🤲' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child A', text: 'Pencil please.' },
          { speaker: 'Child B', text: 'Here you are.' },
          { speaker: 'Child A', text: 'Thank you.' },
        ],
      },
    ],
    quizWords: ['Please', 'Thank you', 'Here you are', 'Water please', 'Book please'],
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
      { text: 'Sorry!', emoji: '😔' },
      { text: 'I am sorry.', emoji: '🙇' },
      { text: 'Sorry teacher.', emoji: '😔' },
      { text: 'I am sorry teacher.', emoji: '🙇' },
      { text: 'I am sorry friend.', emoji: '🙇' },
      { text: 'I am sorry, I am late.', emoji: '⏰' },
      { text: 'I am sorry, I broke the pencil.', emoji: '✏️' },
      { text: 'I am sorry, I forgot.', emoji: '🤔' },
      { text: "I am sorry, I didn't mean it.", emoji: '😔' },
      { text: 'Excuse me.', emoji: '🙋' },
      { text: "Don't worry!", emoji: '🤗' },
      { text: 'Be happy!', emoji: '😊' },
      { text: "Don't cry.", emoji: '😢' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child A', text: 'I am sorry.' },
          { speaker: 'Child B', text: "It's okay." },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Sorry teacher.' },
          { speaker: 'Teacher', text: "It's fine." },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'I am sorry I took your toy.' },
          { speaker: 'Child B', text: 'No problem.' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'I am sad…' },
          { speaker: 'Child B', text: "Don't worry. Be happy!" },
        ],
      },
    ],
    quizWords: ['Sorry', 'Excuse me', "Don't worry", 'Be happy', "Don't cry", 'No problem'],
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
      { text: 'Hello!', emoji: '👋' },
      { text: 'Good morning!', emoji: '🌅' },
      { text: 'How are you?', emoji: '🤗' },
      { text: 'I am happy!', emoji: '😊' },
      { text: 'What is your name?', emoji: '❓' },
      { text: 'My name is…', emoji: '🙋' },
      { text: 'Please!', emoji: '🙏' },
      { text: 'Thank you!', emoji: '😊' },
      { text: 'Sorry!', emoji: '😔' },
      { text: 'Excuse me!', emoji: '🙋' },
      { text: "It's okay.", emoji: '😌' },
      { text: 'No need.', emoji: '🙅' },
      { text: "Don't worry.", emoji: '🤗' },
      { text: 'Be happy!', emoji: '😊' },
      { text: "Don't cry.", emoji: '😢' },
    ],
    dialogues: [
      {
        lines: [
          { speaker: 'Child', text: 'Good morning teacher!' },
          { speaker: 'Teacher', text: 'Good morning!' },
        ],
      },
      {
        lines: [
          { speaker: 'Child A', text: 'Hello!' },
          { speaker: 'Child B', text: 'Hi!' },
        ],
      },
      {
        lines: [
          { speaker: 'Child', text: 'Pencil please.' },
          { speaker: 'Friend', text: 'Here you are.' },
          { speaker: 'Child', text: 'Thank you.' },
        ],
      },
    ],
    quizWords: ['Hello', 'Good morning', 'Thank you', 'Sorry', 'Excuse me', 'Please', 'My name is', "Don't worry"],
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
    quizWords: ['Father', 'Mother', 'Papa', 'Mummy', 'Parents'],
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
    quizWords: ['Brother', 'Sister', 'Siblings', 'Baby', 'I love my brother'],
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
    quizWords: ['Grandfather', 'Grandmother', 'Grandpa', 'Grandma', 'Grandparents'],
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
    quizWords: ['Uncle', 'Aunt', 'Cousin', 'Parents', 'Siblings', 'Grandparents'],
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
    quizWords: ['Home', 'Bedroom', 'Kitchen', 'Living Room', 'Bathroom', 'I want water please'],
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
    quizWords: ['I love my family', 'I am happy', 'Be happy', "Don't cry", 'Thank you mama'],
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
    quizWords: ['Father', 'Mother', 'Brother', 'Sister', 'Grandpa', 'Grandma', 'Uncle', 'Aunt', 'Cousin', 'Home'],
  },
]
