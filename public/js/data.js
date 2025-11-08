export const quizzes = [
  {
    id: 'fundamentals-html',
    title: 'HTML Fundamentals',
    description: 'Assess knowledge of semantic structure, accessibility, and modern HTML patterns.',
    tags: ['Frontend', 'Foundational'],
    difficulty: 'Intermediate',
    estimatedTime: 8,
    questions: [
      {
        id: 'html-1',
        text: 'Which HTML element provides a concise description of an entire page, primarily used by search engines?',
        options: [
          { id: 'meta-description', label: '<meta name="description">' },
          { id: 'header-tag', label: '<header>' },
          { id: 'summary', label: '<summary>' },
          { id: 'cite', label: '<cite>' }
        ],
        answerId: 'meta-description',
        rationale:
          'The description meta tag is a page-level summary consumed by SEO crawlers. Structural elements like <header> or <summary> serve different semantic roles.'
      },
      {
        id: 'html-2',
        text: 'Which attribute should be used to improve accessibility when providing text for assistive technologies?',
        options: [
          { id: 'data-alt', label: 'data-alt' },
          { id: 'alt-text', label: 'alt' },
          { id: 'aria-img', label: 'aria-img' },
          { id: 'longdesc', label: 'longdesc' }
        ],
        answerId: 'alt-text',
        rationale:
          'The alt attribute is the standard mechanism for supplying alternative text for images, enabling screen reader support.'
      },
      {
        id: 'html-3',
        text: 'Select the element that conveys self-contained, reusable compositions such as cards or widgets.',
        options: [
          { id: 'section', label: '<section>' },
          { id: 'div', label: '<div>' },
          { id: 'article', label: '<article>' },
          { id: 'aside', label: '<aside>' }
        ],
        answerId: 'article',
        rationale:
          '<article> is intended for independent, distributable content blocks. It is more descriptive than a <div> and differs from <section>, which organizes content into thematic groups.'
      }
    ]
  },
  {
    id: 'modern-css',
    title: 'Modern CSS Layouts',
    description: 'Evaluate proficiency with Flexbox, Grid, and responsive design tokens.',
    tags: ['Frontend', 'Design'],
    difficulty: 'Advanced',
    estimatedTime: 10,
    questions: [
      {
        id: 'css-1',
        text: 'Which CSS function allows components to respect user-configured minimum and maximum widths while remaining fluid?',
        options: [
          { id: 'clamp', label: 'clamp()' },
          { id: 'minmax', label: 'minmax()' },
          { id: 'fit-content', label: 'fit-content()' },
          { id: 'min', label: 'min()' }
        ],
        answerId: 'clamp',
        rationale:
          'clamp() accepts min, preferred, and max values and is ideal for fluid typography or element sizing responsive to container width.'
      },
      {
        id: 'css-2',
        text: 'When should you prefer CSS Grid over Flexbox for layout?',
        options: [
          { id: 'single-axis', label: 'When aligning elements along a single axis.' },
          { id: 'two-dimensional', label: 'When managing two-dimensional layouts with rows and columns.' },
          { id: 'simple-spacing', label: 'When distributing equal spacing between inline items.' },
          { id: 'text-flow', label: 'When content should follow text flow order only.' }
        ],
        answerId: 'two-dimensional',
        rationale:
          'Grid is optimized for two-dimensional control, enabling explicit row/column placement, whereas Flexbox thrives on one-dimensional flows.'
      },
      {
        id: 'css-3',
        text: 'Which property enables a grid item to span an entire implicit row?',
        options: [
          { id: 'grid-row', label: 'grid-row: 1 / -1' },
          { id: 'grid-area', label: 'grid-area: full' },
          { id: 'grid-auto-flow', label: 'grid-auto-flow: row dense' },
          { id: 'justify-self', label: 'justify-self: stretch' }
        ],
        answerId: 'grid-row',
        rationale:
          'Setting grid-row: 1 / -1 instructs the element to begin at the first line and end at the last line, spanning the entire row.'
      }
    ]
  },
  {
    id: 'js-async',
    title: 'JavaScript Async Patterns',
    description: 'Measure understanding of Promises, async/await, and concurrency controls.',
    tags: ['JavaScript'],
    difficulty: 'Intermediate',
    estimatedTime: 12,
    questions: [
      {
        id: 'js-1',
        text: 'What is the primary advantage of Promise.allSettled over Promise.all?',
        options: [
          { id: 'faster', label: 'It resolves faster by ignoring results.' },
          { id: 'partial-success', label: 'It resolves after the first fulfilled promise.' },
          { id: 'settled-results', label: 'It waits for all promises and reports each outcome.' },
          { id: 'single-error', label: 'It throws the first rejection immediately.' }
        ],
        answerId: 'settled-results',
        rationale:
          'Promise.allSettled returns after every promise settles, providing full visibility into both fulfilled and rejected results.'
      },
      {
        id: 'js-2',
        text: 'Which statement accurately describes the event loop?',
        options: [
          { id: 'single-thread', label: 'JavaScript runs on a single thread with a queue that the event loop processes.' },
          { id: 'multi-thread', label: 'Each asynchronous callback executes on its own thread managed by the loop.' },
          { id: 'blocking', label: 'The event loop blocks UI rendering until promises settle.' },
          { id: 'microtask', label: 'Microtasks are queued before the currently executing call stack completes.' }
        ],
        answerId: 'single-thread',
        rationale:
          'JavaScript executes on a single thread where the event loop pulls tasks from a queue after the current call stack empties. Microtasks queue after synchronous work completes.'
      },
      {
        id: 'js-3',
        text: 'How can you limit concurrency when issuing a batch of asynchronous requests?',
        options: [
          { id: 'promise-all', label: 'Use Promise.all to run them together.' },
          { id: 'queue-runner', label: 'Create a queue that processes a fixed number at a time.' },
          { id: 'async-await', label: 'Wrap everything in a single async function.' },
          { id: 'settimeout', label: 'Use setTimeout to delay every call equally.' }
        ],
        answerId: 'queue-runner',
        rationale:
          'Implementing a concurrency queue or semaphore ensures only a configurable number of tasks execute simultaneously, protecting APIs and resources.'
      }
    ]
  }
];

export const initialReports = [
  {
    id: 'rep-1001',
    learner: 'Mira Gonzalez',
    quizId: 'modern-css',
    score: 92,
    submittedAt: '2025-01-08T09:32:00Z',
    durationMinutes: 7
  },
  {
    id: 'rep-1002',
    learner: 'Noah Patel',
    quizId: 'js-async',
    score: 84,
    submittedAt: '2025-01-06T16:20:00Z',
    durationMinutes: 11
  },
  {
    id: 'rep-1003',
    learner: 'Aria Chen',
    quizId: 'fundamentals-html',
    score: 78,
    submittedAt: '2025-01-04T14:11:00Z',
    durationMinutes: 9
  }
];
