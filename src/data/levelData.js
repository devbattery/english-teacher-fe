// src/data/levelData.js

export const levelData = [
  {
    id: 'elementary',
    name: '왕초보 (Elementary)',
    // [추가] LevelGuidePage에서 사용할 데이터
    summary: "영어 단어만 겨우 알거나, 간단한 문장만 만들 수 있는 단계",
    description: "AI 선생님이 아주 쉽고 간단한 단어와 문장 구조를 사용하여 천천히 대화를 이끌어갑니다. 영어에 대한 막연한 두려움을 없애고 자신감을 키우는 것을 목표로 합니다.",
    recommendations: [
      {
        label: "단어만 겨우 아는 왕초보예요.",
        prompt: "Hi! I'm a complete beginner in English. I only know a few words. Could you please teach me using very simple sentences?"
      },
      {
        label: "간단한 문장을 만들 수 있어요.",
        prompt: "Hello. I can make very basic sentences, but I want to get better. I want to practice having simple conversations. Could you help me with that?"
      },
      {
        label: "파파고 없으면 대화가 힘들어요.",
        prompt: "Hi there. I rely heavily on translation apps to communicate in English. My goal is to speak more naturally without them. Please be patient with me."
      }
    ]
  },
  {
    id: 'highschool',
    name: '고등학생 (High School)',
    summary: "고등학교 수준의 어휘와 문법 지식을 갖추고 있는 단계",
    description: "수능 및 내신 대비를 위한 독해, 어휘 학습뿐만 아니라 일상적인 주제로 자유롭게 대화하며 영어 사용의 정확성과 유창성을 함께 향상시킬 수 있습니다.",
    recommendations: [
       {
        label: "수능 영어를 대비하고 싶어요.",
        prompt: "Hi, I'm a high school student preparing for the CSAT (the Korean SAT). I would like to practice reading comprehension and learn useful vocabulary for the exam."
      },
      {
        label: "일상적인 주제로 채팅하고 싶어요.",
        prompt: "Hey, I want to practice my English chatting skills. Can we talk about casual topics like hobbies, movies, or music?"
      },
      {
        label: "문법 실수를 교정받고 싶어요.",
        prompt: "Hello! My main goal is to improve my grammatical accuracy. Could you please correct any mistakes I make and explain them simply?"
      }
    ]
  },
  {
    id: 'native',
    name: '유창함 (Native)',
    summary: "자유로운 의사소통이 가능하며, 더 전문적인 표현을 배우고 싶은 단계",
    description: "비즈니스 이메일 작성, 뉴스 기사 토론 등 특정 목적을 가진 전문적인 글쓰기 연습을 통해 영어 실력을 한 단계 더 높은 수준으로 끌어올릴 수 있습니다.",
    recommendations: [
       {
        label: "비즈니스 이메일 작성을 연습하고 싶어요.",
        prompt: "Hi, I'd like to practice writing professional business emails. Could you give me a scenario and we can role-play by writing emails to each other?"
      },
      {
        label: "최신 뉴스 기사에 대해 토론해보고 싶어요.",
        prompt: "Hello. I'm interested in discussing current events. Could you share a recent news article with me so we can talk about it in writing?"
      },
       {
        label: "주제에 맞춰 글 쓰는 연습을 하고 싶어요.",
        prompt: "I'd like to improve my writing skills. Can you give me a specific topic and I'll try to write a few paragraphs about it?"
       }
    ]
  },
  {
    id: 'toeic',
    name: '토익 (TOEIC)',
    summary: "TOEIC 시험을 준비하며, 관련 유형에 익숙해지고 싶은 단계",
    description: "TOEIC 시험의 파트5(문법/어휘), 파트7(독해), 그리고 라이팅 파트의 문제 유형을 시뮬레이션하며 실전 감각을 기를 수 있도록 돕습니다.",
    recommendations: [
      {
        label: "TOEIC 파트 5 형식으로 연습하고 싶어요.",
        prompt: "I'd like to practice with TOEIC Part 5 style questions. Can you give me some incomplete sentences and multiple-choice options for me to solve?"
      },
      {
        label: "TOEIC 라이팅 시험을 준비하고 싶어요.",
        prompt: "Hello, I'm preparing for the TOEIC Writing test. Could we practice some of the tasks, like writing a response to an email or composing an opinion essay?"
      },
      {
        label: "TOEIC 파트 7 지문처럼 긴 글을 읽고 싶어요.",
        prompt: "I want to improve my reading speed for TOEIC Part 7. Could you provide a short article, similar to a Part 7 passage, and then ask me a few comprehension questions about it?"
      }
    ]
  },
];