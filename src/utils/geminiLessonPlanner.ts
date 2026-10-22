// Client-side helper to interface with /api/gemini/lesson-planner
// with resilient fallback generators for Ghana NaCCA standard curriculum

export interface GeneratedLessonPlan {
  topic: string;
  strand: string;
  subStrand: string;
  contentStandard: string;
  indicators: string[];
  coreCompetencies: string[];
  learningMaterials: string[];
  phase1Starter: string;
  phase2MainActivities: string;
  phase3Reflection: string;
  assessmentRemarks: string;
}

export async function generateLessonPlanWithAI(params: {
  subject: string;
  classLevel: string;
  weekNumber: number;
  topic: string;
  curriculumFocus?: string;
}): Promise<GeneratedLessonPlan> {
  try {
    const res = await fetch('/api/gemini/lesson-planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data && data.data.contentStandard) {
        return data.data as GeneratedLessonPlan;
      }
    }
  } catch (err) {
    console.warn('[Gemini AI] Server call fallback triggered:', err);
  }

  // Resilient NaCCA curriculum generator fallback
  return generateOfflineCurriculumPlan(params);
}

function generateOfflineCurriculumPlan(params: {
  subject: string;
  classLevel: string;
  weekNumber: number;
  topic: string;
  curriculumFocus?: string;
}): GeneratedLessonPlan {
  const { subject, classLevel, weekNumber, topic } = params;
  const sub = subject.toLowerCase();
  const cleanTopic = topic || 'Foundational Principles';

  if (sub.includes('comput') || sub.includes('ict')) {
    return {
      topic: cleanTopic,
      strand: 'Computing Systems & Digital Literacy',
      subStrand: 'Hardware, Software & Network Systems',
      contentStandard: `B7.1.1.1: Demonstrate progressive competence in ${cleanTopic} and its functional applications in educational technology.`,
      indicators: [
        `B7.1.1.1.1: Explain the conceptual and practical framework of ${cleanTopic}.`,
        `B7.1.1.1.2: Identify key hardware/software components and execute safe operating procedures.`,
        `B7.1.1.1.3: Apply troubleshooting techniques and collaborate on digital classroom exercises.`
      ],
      coreCompetencies: [
        'Digital Literacy (DL)',
        'Critical Thinking and Problem Solving (CP)',
        'Collaboration and Leadership (CL)'
      ],
      learningMaterials: [
        'Computer workstation lab units',
        'Salem VClass interactive simulator module',
        'Tactile hardware identification flashcards',
        'NaCCA Computing Learner Resource Pack'
      ],
      phase1Starter: `Display interactive diagrams and prompt students with a guiding inquiry: "How does ${cleanTopic} influence modern data processing?" Brainstorm prior observations for 7 minutes.`,
      phase2MainActivities: `1. Teacher models key concepts of ${cleanTopic} using projector step-by-step.\\n2. Pair learners to execute hands-on terminal exercise exploring directories and functional commands.\\n3. Montessori tactile link: Physical card sorting of input-process-output stages.\\n4. Teacher conducts formative round-robin checks across student pairs.`,
      phase3Reflection: `Pupils present 2-minute synthesis of their workstation findings. Conduct rapid oral recap with 3 exit questions on core terms.`,
      assessmentRemarks: `Hands-on task: 5-question practical exercise on Salem VClass. Target mastery benchmark: 85%.`
    };
  }

  if (sub.includes('math')) {
    return {
      topic: cleanTopic,
      strand: 'Number Systems & Algebraic Reasoning',
      subStrand: 'Patterns, Relations and Problem Solving',
      contentStandard: `B7.2.1.1: Apply mathematical models and properties to solve multi-step problems involving ${cleanTopic}.`,
      indicators: [
        `B7.2.1.1.1: Formulate mathematical representations and balance models for ${cleanTopic}.`,
        `B7.2.1.1.2: Compute solutions using inverse operations and algorithmic precision.`,
        `B7.2.1.1.3: Verify numerical accuracy through partner cross-checking and real-life context word problems.`
      ],
      coreCompetencies: [
        'Critical Thinking and Problem Solving (CP)',
        'Mathematical Thinking and Communication',
        'Personal Development and Leadership (PL)'
      ],
      learningMaterials: [
        'Montessori algebra tiles and balance beam scales',
        'Grid whiteboards and marker sets',
        'Salem VClass dynamic graphing tool',
        'NaCCA Mathematics JHS Teacher Guide'
      ],
      phase1Starter: `Hook: Present a real-world shopping or construction scenario on the board. Ask: "What variable is unknown?" Elicit student hypotheses for 5 minutes.`,
      phase2MainActivities: `1. Teacher uses Montessori concrete balance tiles to visually demonstrate equality principles.\\n2. Guide students through 3 worked examples from basic to intermediate difficulty.\\n3. Paired practice on mini-whiteboards with peer checking.\\n4. Differentiated tier: Extension challenge provided for advanced learners while teacher supports group needing scaffolding.`,
      phase3Reflection: `Students summarize the "golden rule" of the lesson in their math journals. One student pair demonstrates their solution at the board.`,
      assessmentRemarks: `Formative quiz: 4 structured equations. Homework assigned via Salem VClass portal.`
    };
  }

  if (sub.includes('scien')) {
    return {
      topic: cleanTopic,
      strand: 'Diversity of Matter & Living Systems',
      subStrand: 'Scientific Enquiry and Natural Phenomena',
      contentStandard: `B8.1.1.1: Investigate the scientific properties, biological structures, or environmental interactions of ${cleanTopic}.`,
      indicators: [
        `B8.1.1.1.1: Describe and illustrate the structural and functional aspects of ${cleanTopic}.`,
        `B8.1.1.1.2: Conduct simple scientific investigations or observations following safety protocols.`,
        `B8.1.1.1.3: Record empirical data and draw evidence-based conclusions.`
      ],
      coreCompetencies: [
        'Critical Thinking and Problem Solving (CP)',
        'Scientific Enquiry and Research Skills',
        'Cultural Identity and Global Citizenship (CG)'
      ],
      learningMaterials: [
        'Laboratory apparatus, specimen samples, and magnifying glasses',
        'Montessori 3D tactile anatomy/matter models',
        'Salem VClass virtual laboratory simulation',
        'NaCCA Integrated Science Learner Companion'
      ],
      phase1Starter: `Display contrasting specimens or digital video micro-footage. Challenge learners to spot three differences and write them in their observation notes.`,
      phase2MainActivities: `1. Safety briefing and lab apparatus distribution.\\n2. Guided step-by-step observation and recording of specimen characteristics.\\n3. Group discussion on ecological and technological significance.\\n4. Montessori tactile component: 3D puzzle assembly or specimen handling.`,
      phase3Reflection: `Each lab group presents one key finding. Plenary summary linking the observations to the general NaCCA syllabus strand.`,
      assessmentRemarks: `Laboratory report evaluation using standard scientific rubric (Hypothesis, Method, Observation, Conclusion).`
    };
  }

  // Default General NaCCA Format
  return {
    topic: cleanTopic,
    strand: `${subject} Core Curriculum Strand`,
    subStrand: `${cleanTopic} & Applied Skills`,
    contentStandard: `B7.1.1.1: Demonstrate comprehension and practical execution of ${cleanTopic} within the ${classLevel} curriculum.`,
    indicators: [
      `B7.1.1.1.1: Define and discuss key terminologies and foundational concepts of ${cleanTopic}.`,
      `B7.1.1.1.2: Participate actively in guided teacher-learner activities and collaborative group tasks.`,
      `B7.1.1.1.3: Apply acquired skills in personal study and structured evaluation exercises.`
    ],
    coreCompetencies: [
      'Critical Thinking and Problem Solving (CP)',
      'Communication and Collaboration (CC)',
      'Personal Development and Leadership (PL)'
    ],
    learningMaterials: [
      'Approved NaCCA Course Syllabus & Textbooks',
      'Salem VClass multimedia slide deck',
      'Montessori tactile learning aids and flashcards',
      'Student study guides and chart paper'
    ],
    phase1Starter: `Engage learners with an interactive question of the day on ${cleanTopic}. Activate prior knowledge from Week ${Math.max(1, weekNumber - 1)} with a 5-minute quick-fire recall.`,
    phase2MainActivities: `1. Teacher leads structured exposition on ${cleanTopic} using visual prompts and real-world examples.\\n2. Collaborative team task: Small groups analyze case studies or practice questions.\\n3. Individual reflection and recorded notebook entry.\\n4. Teacher circulates to provide immediate formative feedback and guidance.`,
    phase3Reflection: `Consolidate learning through a 3-2-1 exit ticket: 3 things learned, 2 questions remaining, 1 key concept mastered today.`,
    assessmentRemarks: `Continuous assessment task: Complete practice worksheet on Salem VClass. Review score during next class meeting.`
  };
}
