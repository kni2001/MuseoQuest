// Game definitions for MuseoQuest
export const GAMES = {
  QUIZ_TRIO: {
    id: 'quiz-trio',
    name: 'Quiz Trio',
    description: 'Three combined quizzes in one game',
    type: 'quiz',
    marks: 1,
    icon: '❓',
    questionSets: [
      {
        setId: 1,
        title: 'Kings of the Kandyan Kingdom',
        questions: [
          {
            id: 1,
            question: 'Who is the last king of Kandy?',
            options: ['Sri Wickrama Rajasinghe', 'Dutugemunu', 'Parakramabahu', 'Anagarika Dharmapala'],
            correct: 'Sri Wickrama Rajasinghe'
          },
          {
            id: 2,
            question: 'Which king first brought the Tooth Relic to Kandy?',
            options: ['King Vimaladharmasuriya I', 'King Rajasinghe II', 'King Kirti Sri Rajasinghe', 'King Narendrasinghe'],
            correct: 'King Vimaladharmasuriya I'
          },
          {
            id: 3,
            question: 'Which king allied with the Dutch to drive out the Portuguese?',
            options: ['King Rajasinghe II', 'King Vimaladharmasuriya I', 'King Kirti Sri Rajasinghe', 'Sri Wickrama Rajasinghe'],
            correct: 'King Rajasinghe II'
          },
          {
            id: 4,
            question: 'Which king restored Buddhism and invited monks from Siam?',
            options: ['King Kirti Sri Rajasinghe', 'King Rajasinghe II', 'Sri Wickrama Rajasinghe', 'King Vimaladharmasuriya I'],
            correct: 'King Kirti Sri Rajasinghe'
          },
          {
            id: 5,
            question: 'Which Kandyan queen was also known as Dona Catarina?',
            options: ['Queen Kusumasana Devi', 'Queen Anula', 'Queen Leelawathie', 'Queen Viharamahadevi'],
            correct: 'Queen Kusumasana Devi'
          }
        ]
      },
      {
        setId: 2,
        title: 'The Sacred Tooth Relic',
        questions: [
          {
            id: 1,
            question: 'Who hid the Sacred Tooth Relic to protect it from the Portuguese?',
            options: ['Hiripitiye Rala', 'Anagarika Dharmapala', 'King Rajasinghe II', 'Ven. Saranankara'],
            correct: 'Hiripitiye Rala'
          },
          {
            id: 2,
            question: 'In which town was the Tooth Relic hidden from the Portuguese?',
            options: ['Delgamuwa', 'Kandy', 'Colombo', 'Galle'],
            correct: 'Delgamuwa'
          },
          {
            id: 3,
            question: 'What was used to conceal the Tooth Relic?',
            options: ['A grinding stone shaped like an anthill', 'A hollow tree', 'A clay pot', 'A golden casket'],
            correct: 'A grinding stone shaped like an anthill'
          },
          {
            id: 4,
            question: 'Which king built the original Temple of the Tooth in Kandy?',
            options: ['King Vimaladharmasuriya I', 'King Rajasinghe II', 'King Kirti Sri Rajasinghe', 'Sri Wickrama Rajasinghe'],
            correct: 'King Vimaladharmasuriya I'
          },
          {
            id: 5,
            question: 'Where is the Sacred Tooth Relic enshrined today?',
            options: ['Temple of the Tooth in Kandy', 'Kelaniya Temple', 'Gangaramaya Temple', 'Thuparama Dagoba'],
            correct: 'Temple of the Tooth in Kandy'
          }
        ]
      },
      {
        setId: 3,
        title: 'Buddhist Revival',
        questions: [
          {
            id: 1,
            question: 'Which leader helped revive Buddhism in Sri Lanka in the 19th century?',
            options: ['Anagarika Dharmapala', 'D.S. Senanayake', 'Sirimavo Bandaranaike', 'S.W.R.D. Bandaranaike'],
            correct: 'Anagarika Dharmapala'
          },
          {
            id: 2,
            question: 'Who led the revival of higher ordination (Upasampada) in Sri Lanka?',
            options: ['Ven. Weliwita Sri Saranankara', 'Anagarika Dharmapala', 'Ven. Devanagala', 'King Kirti Sri Rajasinghe'],
            correct: 'Ven. Weliwita Sri Saranankara'
          },
          {
            id: 3,
            question: 'From which country were monks invited for the Siyam Upasampada?',
            options: ['Siam (Thailand)', 'India', 'Burma', 'China'],
            correct: 'Siam (Thailand)'
          },
          {
            id: 4,
            question: 'What is the name of the ordination revival ceremony held in Sri Lanka?',
            options: ['Siyam Upasampada', 'Kathina', 'Pabbajja', 'Vesak'],
            correct: 'Siyam Upasampada'
          },
          {
            id: 5,
            question: 'Which nikaya was established as a result of the ordination revival?',
            options: ['Siyam Nikaya', 'Amarapura Nikaya', 'Ramanna Nikaya', 'Asgiriya Nikaya'],
            correct: 'Siyam Nikaya'
          }
        ]
      },
      {
        setId: 4,
        title: 'European Influence on Kandy',
        questions: [
          {
            id: 1,
            question: 'Which European power tried to seize the Tooth Relic from Kandy?',
            options: ['Portuguese', 'Dutch', 'British', 'French'],
            correct: 'Portuguese'
          },
          {
            id: 2,
            question: 'Which European nation allied with King Rajasinghe II against the Portuguese?',
            options: ['Dutch', 'British', 'French', 'Spanish'],
            correct: 'Dutch'
          },
          {
            id: 3,
            question: 'Where did King Rajasinghe II defeat the Portuguese?',
            options: ['Gannoruwa', 'Kandy', 'Colombo', 'Galle'],
            correct: 'Gannoruwa'
          },
          {
            id: 4,
            question: 'Which European power gained control of the Kandyan Kingdom in 1815?',
            options: ['British', 'Portuguese', 'Dutch', 'French'],
            correct: 'British'
          },
          {
            id: 5,
            question: 'Dona Catarina was also known as what in Kandyan history?',
            options: ['Queen Kusumasana Devi', 'Queen Viharamahadevi', 'Queen Anula', 'Queen Leelawathie'],
            correct: 'Queen Kusumasana Devi'
          }
        ]
      },
      {
        setId: 5,
        title: 'Kandyan Heritage',
        questions: [
          {
            id: 1,
            question: 'What famous procession is associated with the Temple of the Tooth in Kandy?',
            options: ['Esala Perahera', 'Wesak Procession', 'Poson Procession', 'Navam Perahera'],
            correct: 'Esala Perahera'
          },
          {
            id: 2,
            question: 'Which king died without a direct heir, causing instability in Kandy?',
            options: ['King Sri Veera Parakrama Narendrasinghe', 'King Vimaladharmasuriya I', 'King Rajasinghe II', 'King Kirti Sri Rajasinghe'],
            correct: 'King Sri Veera Parakrama Narendrasinghe'
          },
          {
            id: 3,
            question: 'In which city is the Temple of the Tooth Relic located?',
            options: ['Kandy', 'Colombo', 'Galle', 'Jaffna'],
            correct: 'Kandy'
          },
          {
            id: 4,
            question: 'Which figure is associated with the revival of higher ordination through the Siyam Nikaya?',
            options: ['Ven. Weliwita Sri Saranankara Thero', 'Anagarika Dharmapala', 'Hiripitiye Rala', 'King Rajasinghe II'],
            correct: 'Ven. Weliwita Sri Saranankara Thero'
          },
          {
            id: 5,
            question: 'The Kandyan Convention of 1815 ceded the kingdom to which colonial power?',
            options: ['British', 'Portuguese', 'Dutch', 'French'],
            correct: 'British'
          }
        ]
      }
    ]
  },
  PUZZLE: {
    id: 'puzzle',
    name: 'Picture Puzzle',
    description: 'Arrange shuffled picture squares to complete the image',
    type: 'puzzle',
    marks: 1,
    icon: '🧩',
    images: [
      { id: 'puzzle-1', url: 'Ex_01', title: 'Hiripitiye Rala', gridSize: 4 },
      { id: 'puzzle-2', url: 'Ex_02', title: 'Ven. Devanagala', gridSize: 4 },
      { id: 'puzzle-3', url: 'Ex_03', title: 'King Vimaladharmasuriya I', gridSize: 4 }
    ]
  },
  TIMELINE: {
    id: 'timeline',
    name: 'Timeline Master',
    description: 'Arrange historical events in chronological order',
    type: 'timeline',
    marks: 1,
    icon: '📅',
    events: [
      {
        id: 1,
        event: 'King Vimaladharmasuriya I brings Tooth Relic to Kandy',
       
      },
      {
        id: 2,
        event: 'King Rajasinghe II defeats Portuguese at Gannoruwa',
        
      },
      {
        id: 3,
        event: 'Siyam Upasampadā ordination re-established',
        
      },
      {
        id: 4,
        event: 'King Sri Veera Parakrama Narendrasinghe dies',
        
      },
      {
        id: 5,
        event: 'King Kirti Sri Rajasinghe restores Buddhism',
        
      }
    ]
  },
  TRUE_FALSE: {
    id: 'true-false',
    name: 'Historical Truths',
    description: 'Determine if the historical statements are true or false',
    type: 'true_false',
    marks: 1,
    icon: '✅',
    statements: [
      {
        id: 1,
        text: 'The Sacred Tooth Relic was hidden in an anthill to protect it from the Portuguese.',
        isTrue: true,
        explanation: 'Hiripitiye Rala hid it inside a grinding stone shaped like an anthill at Delgamuwa.'
      },
      {
        id: 2,
        text: 'King Rajasinghe II allied with the Dutch to defeat the Portuguese at Gannoruwa.',
        isTrue: true,
        explanation: 'He strategically allied with the Dutch East India Company to expel the Portuguese.'
      },
      {
        id: 3,
        text: 'Dutugemunu was the last king of the Kandyan Kingdom.',
        isTrue: false,
        explanation: 'Sri Wickrama Rajasinghe was the last king of Kandy.'
      },
      {
        id: 4,
        text: 'The Siyam Nnikaya was established to revive higher ordination (Upasampada) in Sri Lanka.',
        isTrue: true,
        explanation: 'Ven. Weliwita Sri Saranankara Thero led this revival with monks from Siam (Thailand).'
      },
      {
        id: 5,
        text: 'Queen Kusumasana Devi was a Portuguese monarch who invaded Kandy.',
        isTrue: false,
        explanation: 'She (also known as Dona Catarina) was a rightful Kandyan heir baptized by the Portuguese.'
      }
    ]
  },
  MEMORY: {
    id: 'memory',
    name: 'Memory Challenge',
    description: 'Find matching pairs of cards with historical figures',
    type: 'memory',
    marks: 1,
    icon: '🧠',
    cards: [
      { id: 1, pair: 'a', icon: '👑', label: 'Vimaladharmasuriya I' },
      { id: 2, pair: 'b', icon: '⚔️', label: 'Rajasinghe II' },
      { id: 3, pair: 'c', icon: '🙏', label: 'Ven. Saranankara' },
      { id: 4, pair: 'd', icon: '👸', label: 'Queen Kusumasana' },
      { id: 5, pair: 'e', icon: '📜', label: 'Buddhist Revival' },
      { id: 6, pair: 'a', icon: '👑', label: 'Vimaladharmasuriya I' },
      { id: 7, pair: 'b', icon: '⚔️', label: 'Rajasinghe II' },
      { id: 8, pair: 'c', icon: '🙏', label: 'Ven. Saranankara' },
      { id: 9, pair: 'd', icon: '👸', label: 'Queen Kusumasana' },
      { id: 10, pair: 'e', icon: '📜', label: 'Buddhist Revival' }
    ]
  }
};

export const GAME_LIST = [
  GAMES.QUIZ_TRIO,
  GAMES.PUZZLE,
  GAMES.TIMELINE,
  GAMES.TRUE_FALSE,
  GAMES.MEMORY
];

// Helper function to get random games (for Explore page)
export const getRandomGames = (count = 5) => {
  const shuffled = [...GAME_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to get game by ID
export const getGameById = (gameId) => {
  return GAME_LIST.find(game => game.id === gameId);
};
