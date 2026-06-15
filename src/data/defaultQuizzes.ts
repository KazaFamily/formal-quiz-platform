import { Quiz } from '../types';

export const defaultQuizzes: Quiz[] = [
  {
    id: 'software-architecture',
    name: 'Software Architecture & Design Patterns',
    description: 'Evaluate your understanding of SOLID design principles, architectural styles, and GoF patterns.',
    category: 'Engineering',
    difficulty: 'Intermediate',
    questions: [
      {
        id: 'sa-1',
        questionText: 'Under the SOLID principles of Object-Oriented Design, what does the Liskov Substitution Principle (LSP) state?',
        options: [
          'A class should have only one reason to change.',
          'Objects of a superclass should be replaceable with objects of its subclasses without breaking the application.',
          'Depend on abstractions, not on concretions.',
          'Many client-specific interfaces are better than one general-purpose interface.'
        ],
        correctAnswerIndex: 1,
        explanation: 'The Liskov Substitution Principle (LSP) states that subclasses must be substitutable for their base class. In other words, a pointer or reference to a base class should be able to use any of its derived classes without knowing the difference or encountering unexpected behavior.'
      },
      {
        id: 'sa-2',
        questionText: 'Which architectural style promotes building single-purpose, self-contained services that communicate via lightweight protocols (e.g., HTTP/gRPC)?',
        options: [
          'Monolithic Architecture',
          'Service-Oriented Architecture (SOA)',
          'Microservices Architecture',
          'Event-Driven Architecture'
        ],
        correctAnswerIndex: 2,
        explanation: 'Microservices Architecture decomposes an application into highly decoupled, independently deployable, and lightweight services focused on cohesive domain categories.'
      },
      {
        id: 'sa-3',
        questionText: 'In a design where you want to decouple an abstraction from its implementation so that the two can vary independently, which design pattern should you employ?',
        options: [
          'Adapter Pattern',
          'Bridge Pattern',
          'Decorator Pattern',
          'Proxy Pattern'
        ],
        correctAnswerIndex: 1,
        explanation: 'The Bridge Pattern uses encapsulation, aggregation, and inheritance to separate responsibilities into orthogonal class hierarchies, letting the abstraction and implementation vary independently.'
      },
      {
        id: 'sa-4',
        questionText: 'Which SOLID principle is directly violated if a client is forced to implement interface methods it does not use, leading to empty or dummy methods?',
        options: [
          'Single Responsibility Principle (SRP)',
          'Open/Closed Principle (OCP)',
          'Interface Segregation Principle (ISP)',
          'Dependency Inversion Principle (DIP)'
        ],
        correctAnswerIndex: 2,
        explanation: 'The Interface Segregation Principle (ISP) advocates that clients should not be forced to depend upon methods that they do not use, making lightweight, specific interfaces superior to bloated ones.'
      },
      {
        id: 'sa-5',
        questionText: 'Which pattern provides a unified simplified interface to a set of interfaces in a subsystem, effectively shielding clients from the underlying complexity?',
        options: [
          'Facade Pattern',
          'Flyweight Pattern',
          'Composite Pattern',
          'Mediator Pattern'
        ],
        correctAnswerIndex: 0,
        explanation: 'A Facade pattern provides a higher-level, cleaner interface that makes the subsystem easier to interact with and reduces tight coupling.'
      }
    ]
  },
  {
    id: 'agile-project-mgmt',
    name: 'Professional Project Management & Scrum',
    description: 'Assess consensus methodologies, scrum ceremonies, task estimation, and servant-leadership principles.',
    category: 'Management',
    difficulty: 'Beginner',
    questions: [
      {
        id: 'pm-1',
        questionText: 'According to the official Scrum Guide, what is the maximum recommended duration for a Daily Scrum meeting?',
        options: [
          '10 minutes, strictly timed',
          '15 minutes, standard timebox',
          '30 minutes, or until the board is fully updated',
          'No limit, dependent on team sizing'
        ],
        correctAnswerIndex: 1,
        explanation: 'The Daily Scrum is always a 15-minute time-boxed event for the Developers of the Scrum Team to synch, inspect progress, and adapt the Sprint Backlog.'
      },
      {
        id: 'pm-2',
        questionText: 'Who is ultimately responsible for managing and maximizing the value of the Product Backlog in a Scrum environment?',
        options: [
          'The Agile Coach',
          'The Scrum Master',
          'The Product Owner',
          'The Lead Architect'
        ],
        correctAnswerIndex: 2,
        explanation: 'The Product Owner is the sole person accountable for maximizing the value of the product resulting from the work of the Scrum Team, including effective Backlog management.'
      },
      {
        id: 'pm-3',
        questionText: 'What is the primary benefit of using Fibonacci spacing (e.g., 1, 2, 3, 5, 8, 13) for estimating story points during Planning Poker?',
        options: [
          'It accurately calculates the calendar hours a developer requires.',
          'It models the increasing uncertainty as tasks grow larger and more complex.',
          'It guarantees absolute compliance with client-facing timelines.',
          'It assists QA teams in budgeting test suits directly.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Story point estimations are relative calculations. As complexity increases, uncertainty expands exponentially. The gaps in the Fibonacci chain reflect this natural cognitive forecasting variance.'
      },
      {
        id: 'pm-4',
        questionText: 'In Kanban, what is the designated purpose of introducing a Work in Progress (WIP) limit?',
        options: [
          'To restrict the total number of developers permitted in a workspace.',
          'To minimize context-switching and surface bottlenecks in the workflow pipeline.',
          'To ensure all team members work equal hours daily.',
          'To penalize slower team members explicitly.'
        ],
        correctAnswerIndex: 1,
        explanation: 'WIP limits optimize throughput by ensuring teams finish existing, active items before starting new ones, exposing blockers and reducing efficiency drains from excessive context switching.'
      }
    ]
  },
  {
    id: 'cloud-security',
    name: 'Cloud Security & Networking Essentials',
    description: 'Test cloud authorization concepts, virtual networking boundaries, and defense-in-depth principles.',
    category: 'Security',
    difficulty: 'Advanced',
    questions: [
      {
        id: 'cs-1',
        questionText: 'Which cybersecurity paradigm asserts that no entity inside or outside the network border should be trusted implicitly, requiring continuous verification?',
        options: [
          'Defense in Depth',
          'Zero Trust Architecture',
          'Security through Obscurity',
          'Perimeter Defense'
        ],
        correctAnswerIndex: 1,
        explanation: 'Zero Trust is an operational framework founded on the concepts of "never trust, always verify" and "least-privilege access," requiring strict verification for every single access request regardless of origin.'
      },
      {
        id: 'cs-2',
        questionText: 'Under the Shared Responsibility Model of major cloud providers, which of the following is typically the sole responsibility of the customer?',
        options: [
          'Physical security of hypervisor servers',
          'Disposal of redundant magnetic hard drives',
          'Configuration of firewall network access control logs (NACLs) and database IAM keys',
          'HVAC system upgrades on cloud regional facilities'
        ],
        correctAnswerIndex: 2,
        explanation: 'The customer is responsible for "security in the cloud," which encompasses customer data, identity access management (IAM), operating system setups, and firewall network rule configurations.'
      },
      {
        id: 'cs-3',
        questionText: 'What is the principal security risk of storing persistent cloud secret keys directly in application source code repositories?',
        options: [
          'The application will fail local runtime compilations.',
          'Version history is permanent, exposing keys to repository read accesses even if removed in subsequent commits.',
          'The files occupy too much disk volume in local caches.',
          'Public web indexers will downrank the website in search optimizations.'
        ],
        correctAnswerIndex: 1,
        explanation: 'Hardcoded secrets are dangerous because git/VCS logs preserve entire file states indefinitely. If a repository is compromised, or made public, early secret keys can be mined directly from historical snapshots.'
      }
    ]
  }
];
