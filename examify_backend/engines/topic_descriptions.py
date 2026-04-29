# Topic descriptions for AI question generation context
# Maps exam|subject|topic keys to subtopics, exam patterns, and difficulty notes

TOPIC_DESCRIPTIONS = {   'CAT|DILR|Arrangements': {   'difficulty_notes': 'Easy=linear 5 people. Medium=circular + 2 conditions. '
                                                     'Hard=double-row + 5+ conditions.',
                                 'exam_pattern': 'Constraint-based deduction. Traps: not-adjacent ≠ not-together in '
                                                 'circular, partial deduction traps.',
                                 'subtopics': [   'Linear arrangement with constraints',
                                                  'Circular arrangement',
                                                  'Double-row arrangement',
                                                  'Floor-based puzzle',
                                                  'Box stacking puzzle']},
    'CAT|DILR|Data Interpretation Sets': {   'difficulty_notes': 'Easy=direct read. Medium=two-step calculation. '
                                                                 'Hard=multi-chart + complex calculation.',
                                             'exam_pattern': '4-6 questions per set. Traps: approximate vs exact '
                                                             'answer, percentage change vs absolute change.',
                                             'subtopics': [   'Pie charts + tables',
                                                              'Bar graphs + line graphs',
                                                              'Mixed DI (2-3 charts combined)',
                                                              'Percentage calculations',
                                                              'Ratio and proportion in DI',
                                                              'Growth rate and index numbers']},
    'CAT|DILR|Games & Tournaments': {   'difficulty_notes': 'Easy=simple points table. Medium=deduce winner from '
                                                            'partial results. Hard=multi-group + tiebreaker.',
                                        'exam_pattern': 'Logical deduction from match results. Traps: assumption about '
                                                        'draws, tiebreaker rules.',
                                        'subtopics': [   'Round-robin tournament',
                                                         'Knockout tournament',
                                                         'Points table analysis',
                                                         'Win-loss-draw matrices',
                                                         'Group stage + knockout combined']},
    'CAT|DILR|Logical Reasoning Sets': {   'difficulty_notes': 'Easy=linear arrangement. Medium=circular + conditions. '
                                                               'Hard=binary logic + scheduling combined.',
                                           'exam_pattern': 'Set-based 4 questions. Traps: incomplete deduction, '
                                                           'multiple possibilities in early solving.',
                                           'subtopics': [   'Seating arrangements (linear, circular)',
                                                            'Blood relations (coded)',
                                                            'Scheduling and sequencing',
                                                            'Binary logic (truther/liar)',
                                                            'Rankings and comparisons']},
    'CAT|DILR|Networks & Routes': {   'difficulty_notes': 'Easy=direct shortest path. Medium=constrained route. '
                                                          'Hard=flow network + optimization.',
                                      'exam_pattern': 'Visual grid/network. Traps: diagonal moves allowed vs not, '
                                                      'counting unique routes.',
                                      'subtopics': [   'Shortest path problems',
                                                       'Grid movement puzzles',
                                                       'Flow network basics',
                                                       'Network with constraints',
                                                       'Route counting']},
    'CAT|Quantitative Ability|Algebra': {   'difficulty_notes': 'Easy=quadratic roots. Medium=inequalities + log. '
                                                                'Hard=function composition + series.',
                                            'exam_pattern': 'Equation solving + inequalities. Traps: modulus '
                                                            'inequalities, log base changes.',
                                            'subtopics': [   'Linear and quadratic equations',
                                                             'Inequalities',
                                                             'Logarithms',
                                                             'Functions and graphs',
                                                             'Sequences and series',
                                                             'Polynomials']},
    'CAT|Quantitative Ability|Arithmetic': {   'difficulty_notes': 'Easy=direct formula. Medium=two equations. '
                                                                   'Hard=circular/iterative problems.',
                                               'exam_pattern': 'Word problems requiring equation setup. Traps: '
                                                               'upstream/downstream speed, equivalent fractions in '
                                                               'mixture.',
                                               'subtopics': [   'Percentages and profit-loss',
                                                                'Ratio-proportion',
                                                                'Time-speed-distance',
                                                                'Time and work',
                                                                'Mixtures and alligations',
                                                                'Simple and compound interest',
                                                                'Partnership']},
    'CAT|Quantitative Ability|Geometry': {   'difficulty_notes': 'Easy=basic triangle. Medium=circle property. Hard=3D '
                                                                 'mensuration + co-ordinate.',
                                             'exam_pattern': 'Property-based + calculation. Traps: tangent-secant '
                                                             'theorem, similar triangle ratio, diagonal of polyhedron.',
                                             'subtopics': [   'Lines and angles',
                                                              'Triangles (similarity, congruence)',
                                                              'Circles (chord, tangent properties)',
                                                              'Polygons',
                                                              'Mensuration (area, perimeter, volume)',
                                                              'Coordinate geometry basics']},
    'CAT|Quantitative Ability|Modern Maths': {   'difficulty_notes': 'Easy=nCr direct. Medium=probability with '
                                                                     'conditions. Hard=geometric probability + '
                                                                     'combined counting.',
                                                 'exam_pattern': 'Counting + probability. Traps: ordered vs unordered '
                                                                 'selection, conditional probability.',
                                                 'subtopics': [   'Permutations and combinations',
                                                                  'Probability',
                                                                  'Set theory and Venn diagrams',
                                                                  'Binomial theorem basics',
                                                                  'Coordinate geometry']},
    'CAT|Quantitative Ability|Number System': {   'difficulty_notes': 'Easy=HCF/LCM. Medium=remainder theorem. '
                                                                      'Hard=Euler + Chinese remainder theorem.',
                                                  'exam_pattern': "Remainder and number property. Traps: Euler's "
                                                                  'theorem conditions, trailing zeros in factorial.',
                                                  'subtopics': [   'Divisibility rules',
                                                                   'HCF and LCM',
                                                                   'Prime factorisation',
                                                                   "Remainders and Euler's theorem",
                                                                   'Cyclicity of units digit',
                                                                   'Factorials and trailing zeroes']},
    'CAT|Verbal Ability|Fill in the Blanks': {   'difficulty_notes': 'Easy=single blank direct. Medium=two blanks '
                                                                     'tone. Hard=paired blanks with contrast/analogy.',
                                                 'exam_pattern': 'Two-blank questions are common. Traps: plausible '
                                                                 "words that don't fit the second blank.",
                                                 'subtopics': [   'Vocabulary in context',
                                                                  'Grammatical consistency',
                                                                  'Logical coherence',
                                                                  'Paired blanks',
                                                                  'Register and tone match']},
    'CAT|Verbal Ability|Odd Sentence Out': {   'difficulty_notes': 'Easy=clearly off-topic sentence. Medium=subtle '
                                                                   'topic shift. Hard=logically connected but '
                                                                   'grammatically odd.',
                                               'exam_pattern': 'Find the non-fitting sentence from 4-5 options. Traps: '
                                                               'topic drift vs new but related information.',
                                               'subtopics': [   'Thematic consistency',
                                                                'Sentence that introduces new topic',
                                                                'Pronoun mismatch',
                                                                'Tense inconsistency',
                                                                'Logical flow break']},
    'CAT|Verbal Ability|Para Jumbles': {   'difficulty_notes': 'Easy=clear connector. Medium=pronoun chain. '
                                                               'Hard=abstract argument with no clear connector.',
                                           'exam_pattern': '4-5 sentences to arrange. Traps: two plausible sequences, '
                                                           'pronoun reference confusion.',
                                           'subtopics': [   'Sentence connector words (however, therefore, but)',
                                                            'Opening and closing sentence identification',
                                                            'Pronoun-antecedent chains',
                                                            'Logical flow of argument',
                                                            'Topic sentence first']},
    'CAT|Verbal Ability|Para Summary': {   'difficulty_notes': 'Easy=clear main point. Medium=nuanced argument. '
                                                               'Hard=abstract passage with implied conclusion.',
                                           'exam_pattern': 'Choose best one-sentence summary. Traps: too specific '
                                                           '(example-focused) vs too broad.',
                                           'subtopics': [   'Central argument identification',
                                                            'Eliminating extreme options',
                                                            'Tone matching',
                                                            'Conciseness without distortion',
                                                            'Scope of summary']},
    'CAT|Verbal Ability|Reading Comprehension': {   'difficulty_notes': 'Easy=directly stated fact. Medium=inference. '
                                                                        'Hard=abstract passage + author viewpoint.',
                                                    'exam_pattern': '5-6 questions per passage, no negative marking '
                                                                    'for RC. Traps: extreme inferences, misreading '
                                                                    'author tone.',
                                                    'subtopics': [   'Academic passages (science, philosophy)',
                                                                     'Business and economics passages',
                                                                     'Opinion/editorial passages',
                                                                     'Main idea and title',
                                                                     'Inference and tone',
                                                                     'Para-level questions']},
    'GATE|Core CS|Algorithms': {   'difficulty_notes': 'Easy=Big-O of standard algorithm. Medium=DP recurrence. '
                                                       'Hard=graph algorithm trace + complexity proof.',
                                   'exam_pattern': 'Complexity analysis + trace. Traps: worst vs average case, DP '
                                                   'recurrence, MST vs shortest path algorithm choice.',
                                   'subtopics': [   'Time and space complexity (Big-O)',
                                                    'Sorting algorithms (merge, quick, heap)',
                                                    'Searching (binary search, hash)',
                                                    'Dynamic programming',
                                                    'Greedy algorithms',
                                                    'Graph algorithms (Dijkstra, Bellman-Ford, Floyd-Warshall, MST)',
                                                    'Divide and conquer']},
    'GATE|Core CS|Compiler Design': {   'difficulty_notes': 'Easy=FIRST/FOLLOW. Medium=parser table. Hard=SDT + code '
                                                            'generation + optimisation.',
                                        'exam_pattern': 'Parser table construction + SDT. Traps: FIRST and FOLLOW '
                                                        'calculation errors, SLR vs LALR distinction.',
                                        'subtopics': [   'Lexical analysis (tokens, regex)',
                                                         'Parsing (LL(1), LR(0), SLR, LALR)',
                                                         'Syntax directed translation',
                                                         'Semantic analysis',
                                                         'Code generation',
                                                         'Optimisation (common subexpression, loop)',
                                                         'Symbol table and scope']},
    'GATE|Core CS|Computer Networks': {   'difficulty_notes': 'Easy=OSI layer function. Medium=subnetting. '
                                                              'Hard=routing algorithm trace + TCP congestion.',
                                          'exam_pattern': 'Calculation + protocol. Traps: subnetting CIDR math, '
                                                          'sequence number in TCP, CRC divisor degree.',
                                          'subtopics': [   'OSI and TCP/IP model layers',
                                                           'IP addressing and subnetting (CIDR)',
                                                           'Routing (distance vector, link state)',
                                                           'TCP (3-way handshake, congestion control)',
                                                           'DNS, HTTP, FTP (application layer)',
                                                           'Data link (CSMA/CD, sliding window)',
                                                           'Error detection (CRC, checksum, Hamming)']},
    'GATE|Core CS|Computer Organization': {   'difficulty_notes': 'Easy=cache mapping. Medium=pipeline stages. '
                                                                  'Hard=cache + pipeline + memory hierarchy combined.',
                                              'exam_pattern': 'Cache calculation + pipeline. Traps: cache miss rate '
                                                              'formula, pipeline hazard types, IEEE 754 encoding.',
                                              'subtopics': [   'Data representation (IEEE 754 floating point)',
                                                               'CPU design (ALU, registers, control unit)',
                                                               'Instruction set architecture (RISC vs CISC)',
                                                               'Memory hierarchy (cache, RAM, virtual memory)',
                                                               'Cache mapping (direct, associative, set-associative)',
                                                               'I/O organisation (DMA, interrupts)',
                                                               'Pipelining']},
    'GATE|Core CS|DBMS': {   'difficulty_notes': 'Easy=SQL query. Medium=normalisation. Hard=serializability + '
                                                 'concurrency + SQL combined.',
                             'exam_pattern': 'SQL query output + normalisation. Traps: BCNF vs 3NF distinction, '
                                             'conflict vs view serializability.',
                             'subtopics': [   'ER model to relational schema',
                                              'Relational algebra and SQL',
                                              'Functional dependencies and normalisation (1NF-BCNF)',
                                              'Transaction (ACID, serializability)',
                                              'Concurrency control (2PL, timestamp)',
                                              'Recovery and logging',
                                              'Indexing (B+ tree)']},
    'GATE|Core CS|Data Structures': {   'difficulty_notes': 'Easy=stack/queue operation. Medium=BST insert/delete. '
                                                            'Hard=AVL rotation + B-tree + hash combined.',
                                        'exam_pattern': 'Trace + complexity. Traps: AVL rotation types, hash collision '
                                                        'resolution steps, DFS vs BFS tree.',
                                        'subtopics': [   'Arrays, linked lists, stacks, queues',
                                                         'Trees (BST, AVL, B-trees)',
                                                         'Heaps and priority queues',
                                                         'Hash tables (collision resolution)',
                                                         'Tries',
                                                         'Graphs (representation, traversal BFS/DFS)']},
    'GATE|Core CS|Digital Logic': {   'difficulty_notes': 'Easy=K-map simplification. Medium=flip-flop circuit. '
                                                          'Hard=sequential circuit state diagram + timing.',
                                      'exam_pattern': 'Circuit trace + K-map. Traps: JK flip-flop characteristic '
                                                      'equation, K-map grouping, race condition.',
                                      'subtopics': [   'Boolean algebra and simplification (K-map)',
                                                       'Logic gates and combinational circuits',
                                                       'Flip-flops (SR, JK, D, T)',
                                                       'Sequential circuits (counters, registers)',
                                                       'ADC and DAC',
                                                       'Number systems (binary, hex, BCD)',
                                                       'Multiplexers and decoders']},
    'GATE|Core CS|Operating Systems': {   'difficulty_notes': 'Easy=Gantt chart scheduling. Medium=page replacement. '
                                                              "Hard=Banker's algorithm + deadlock combined.",
                                          'exam_pattern': 'Trace-based questions. Traps: preemptive vs non-preemptive '
                                                          "scheduling, Belady's anomaly, Banker's algorithm safety.",
                                          'subtopics': [   'Process management (scheduling: FCFS, SJF, Round Robin, '
                                                           'Priority)',
                                                           "Synchronisation (mutex, semaphores, Peterson's)",
                                                           "Deadlock (detection, prevention, avoidance — Banker's)",
                                                           'Memory management (paging, segmentation, virtual memory)',
                                                           'Page replacement (LRU, FIFO, Optimal)',
                                                           'File systems',
                                                           'I/O management']},
    'GATE|Core CS|Software Engineering': {   'difficulty_notes': 'Easy=SDLC model. Medium=cohesion ranking. Hard=CPM '
                                                                 'critical path + cyclomatic + testing combined.',
                                             'exam_pattern': 'Conceptual + calculation. Traps: cyclomatic complexity '
                                                             'formula, coupling types ranking.',
                                             'subtopics': [   'SDLC models (waterfall, agile, spiral)',
                                                              'Requirements engineering',
                                                              'Software design (coupling, cohesion)',
                                                              'Testing types (black box, white box)',
                                                              'Software metrics (LOC, cyclomatic complexity)',
                                                              'Project management (PERT, CPM)',
                                                              'Quality assurance']},
    'GATE|Core CS|TOC': {   'difficulty_notes': 'Easy=DFA for simple language. Medium=CFG derivation. Hard=Turing '
                                                'machine + decidability proof.',
                            'exam_pattern': 'Construct automaton or check membership. Traps: NFA to DFA conversion, '
                                            'CFL vs regular pumping lemma.',
                            'subtopics': [   'DFA and NFA construction',
                                             'Regular expressions and regular languages',
                                             'Context-free grammars and PDAs',
                                             'Turing machines',
                                             'Decidability (halting problem)',
                                             'Chomsky hierarchy',
                                             'Pumping lemma']},
    'GATE|Engineering Mathematics|Calculus': {   'difficulty_notes': 'Easy=partial derivative. Medium=multiple '
                                                                     'integrals. Hard=vector calculus theorems + NAT.',
                                                 'exam_pattern': "Often NAT (numerical answer type). Traps: Green's "
                                                                 'theorem orientation, partial derivative notation.',
                                                 'subtopics': [   'Limits and continuity',
                                                                  'Partial derivatives',
                                                                  'Maxima and minima (Lagrange multipliers)',
                                                                  'Multiple integrals',
                                                                  'Vector calculus (gradient, divergence, curl)',
                                                                  "Green's, Stokes', Gauss' theorems"]},
    'GATE|Engineering Mathematics|Discrete Math': {   'difficulty_notes': 'Easy=logic truth table. Medium=graph '
                                                                          'property. Hard=recurrence + combinatorics + '
                                                                          'graph combined.',
                                                      'exam_pattern': 'Logic and graph theory dominate GATE CS. Traps: '
                                                                      'predicate logic quantifier scope, graph '
                                                                      'isomorphism.',
                                                      'subtopics': [   'Sets, relations, functions',
                                                                       'Propositional and predicate logic',
                                                                       'Graph theory (trees, connectivity, coloring)',
                                                                       'Combinatorics',
                                                                       'Recurrence relations',
                                                                       'Number theory (modular arithmetic)']},
    'GATE|Engineering Mathematics|Linear Algebra': {   'difficulty_notes': 'Easy=determinant/eigenvalue. '
                                                                           'Medium=diagonalisation. Hard=null space + '
                                                                           'system of equations.',
                                                       'exam_pattern': 'Numerical and MCQ. Traps: rank-nullity '
                                                                       'theorem, eigenvalue of matrix power, '
                                                                       'consistent vs inconsistent system.',
                                                       'subtopics': [   'Matrix rank',
                                                                        'Eigenvalues and eigenvectors',
                                                                        'Cayley-Hamilton theorem',
                                                                        'System of linear equations',
                                                                        'Diagonalisation',
                                                                        'Null space and column space']},
    'GATE|Engineering Mathematics|Numerical Methods': {   'difficulty_notes': 'Easy=direct iteration. Medium=error '
                                                                              'calculation. Hard=convergence analysis '
                                                                              '+ combined methods.',
                                                          'exam_pattern': "NAT type calculation. Traps: Simpson's 1/3 "
                                                                          'vs 3/8 rule conditions, convergence of '
                                                                          'Newton-Raphson.',
                                                          'subtopics': [   'Root finding (bisection, Newton-Raphson)',
                                                                           'Numerical integration (trapezoidal, '
                                                                           "Simpson's)",
                                                                           'Gaussian elimination',
                                                                           'Interpolation (Newton, Lagrange)',
                                                                           'ODE (Euler, Runge-Kutta)',
                                                                           'Error analysis']},
    'GATE|Engineering Mathematics|Probability': {   'difficulty_notes': 'Easy=basic probability. Medium=Bayes + '
                                                                        'distribution. Hard=joint distribution + '
                                                                        'conditional expectation.',
                                                    'exam_pattern': 'Calculation-heavy NAT. Traps: CDF vs PDF, '
                                                                    'conditional expectation, normal distribution '
                                                                    'Z-table.',
                                                    'subtopics': [   'Probability axioms',
                                                                     'Conditional probability and Bayes',
                                                                     'Random variables (discrete, continuous)',
                                                                     'Distributions (Binomial, Poisson, Normal)',
                                                                     'Expectation and variance',
                                                                     'Joint distributions']},
    'GMAT|Analytical Writing|Argument Essay': {   'difficulty_notes': 'Easy=obvious assumption. Medium=causal fallacy. '
                                                                      'Hard=subtle analogy flaw + missing data.',
                                                  'exam_pattern': 'Critique, do not write own view. Traps: writing a '
                                                                  'counter-argument (wrong task) vs critiquing '
                                                                  'reasoning.',
                                                  'subtopics': [   'Identify central claim',
                                                                   'Logical fallacies (hasty generalisation, false '
                                                                   'analogy)',
                                                                   'Unwarranted assumptions',
                                                                   'Missing evidence',
                                                                   'Causal claims',
                                                                   'Recommendations critique']},
    'GMAT|Integrated Reasoning|Graphics Interpretation': {   'difficulty_notes': 'Easy=direct value read. Medium=trend '
                                                                                 'interpretation. Hard=multi-variable '
                                                                                 'graph + calculation.',
                                                             'exam_pattern': 'Fill-in-the-blank from graph. Traps: '
                                                                             'reading approximate values, correlation '
                                                                             'vs causation.',
                                                             'subtopics': [   'Bar chart interpretation',
                                                                              'Scatter plot',
                                                                              'Timeline graph',
                                                                              'Box plot',
                                                                              'Interpreting trend lines']},
    'GMAT|Integrated Reasoning|Multi Source Reasoning': {   'difficulty_notes': 'Easy=single source fact. '
                                                                                'Medium=cross-tab inference. '
                                                                                'Hard=contradiction + calculation '
                                                                                'across sources.',
                                                            'exam_pattern': 'True/false/cannot determine. Traps: '
                                                                            "'cannot determine' when data is absent, "
                                                                            'contradictions between sources.',
                                                            'subtopics': [   'Cross-referencing 2-3 tabs',
                                                                             'Combining numerical + text data',
                                                                             'Timeline alignment',
                                                                             'Contradiction detection',
                                                                             'Inference across sources']},
    'GMAT|Integrated Reasoning|Table Analysis': {   'difficulty_notes': 'Easy=direct column read. Medium=percentage '
                                                                        'from table. Hard=multi-column sort + '
                                                                        'condition.',
                                                    'exam_pattern': 'Sort table then answer 5-6 T/F. Traps: sorting '
                                                                    'one column changes row context, percentage vs '
                                                                    'absolute.',
                                                    'subtopics': [   'Sorting and filtering',
                                                                     'Percentage calculations',
                                                                     'Ranking from table',
                                                                     'Column comparison',
                                                                     'True/false determination from sorted data']},
    'GMAT|Integrated Reasoning|Two Part Analysis': {   'difficulty_notes': 'Easy=two independent parts. Medium=linked '
                                                                           'equations. Hard=logical constraint + '
                                                                           'optimisation.',
                                                       'exam_pattern': 'Two answers must both be correct '
                                                                       'simultaneously. Traps: finding one correct '
                                                                       'answer and ignoring constraint on second.',
                                                       'subtopics': [   'Simultaneous equation solving',
                                                                        'Profit optimisation',
                                                                        'Statement equivalence',
                                                                        'Logical deduction pairs',
                                                                        'Rate and ratio']},
    'GMAT|Quantitative|Algebra': {   'difficulty_notes': 'Easy=equation solve. Medium=inequality DS. Hard=combined '
                                                         'quadratic + inequality + DS.',
                                     'exam_pattern': 'DS heavily. Traps: positive constraint not given, absolute value '
                                                     'DS edge cases.',
                                     'subtopics': [   'Linear and quadratic equations',
                                                      'Inequalities and absolute value',
                                                      'Functions',
                                                      'Exponents and roots',
                                                      'Systems of equations',
                                                      'Word problem translation']},
    'GMAT|Quantitative|Arithmetic': {   'difficulty_notes': 'Easy=PS calculation. Medium=DS with one statement. '
                                                            'Hard=DS with interaction between statements.',
                                        'exam_pattern': "Data Sufficiency (DS) is GMAT-specific. Traps: 'each alone "
                                                        "sufficient' vs 'together sufficient', integer vs non-integer "
                                                        'constraint.',
                                        'subtopics': [   'Number properties',
                                                         'Percentages and ratios',
                                                         'Profit and loss',
                                                         'Work and rate',
                                                         'Data sufficiency traps',
                                                         'Absolute value']},
    'GMAT|Quantitative|Geometry': {   'difficulty_notes': 'Easy=area/perimeter PS. Medium=circle properties. Hard=3D + '
                                                          'coordinate DS.',
                                      'exam_pattern': 'Figure-based + DS. Traps: DS with geometric figure that looks '
                                                      'fixed but has degrees of freedom.',
                                      'subtopics': [   'Lines and angles',
                                                       'Triangles',
                                                       'Circles',
                                                       'Quadrilaterals',
                                                       'Coordinate geometry',
                                                       '3D shapes']},
    'GMAT|Quantitative|Word Problems': {   'difficulty_notes': 'Easy=direct rate. Medium=overlapping sets. '
                                                               'Hard=combined probability + combinatorics.',
                                           'exam_pattern': 'Multi-step. Traps: weighted average ≠ simple average, '
                                                           'overlapping set formula error.',
                                           'subtopics': [   'Rate problems',
                                                            'Mixture and alligation',
                                                            'Probability',
                                                            'Combinatorics (permutations and combinations)',
                                                            'Statistics (mean, weighted average)',
                                                            'Overlapping sets (double/triple)']},
    'GMAT|Verbal|Critical Reasoning': {   'difficulty_notes': 'Easy=direct strengthen/weaken. Medium=assumption. '
                                                              'Hard=evaluate + boldface combined.',
                                          'exam_pattern': 'Assumption + strengthen/weaken dominate GMAT. Traps: scope '
                                                          'shift, strengthen ≠ prove.',
                                          'subtopics': [   'Strengthen argument',
                                                           'Weaken argument',
                                                           'Find the assumption',
                                                           'Evaluate the argument',
                                                           'Boldface questions',
                                                           'Paradox resolution',
                                                           'Draw a conclusion']},
    'GMAT|Verbal|Reading Comprehension': {   'difficulty_notes': 'Easy=stated detail. Medium=inference. Hard=abstract '
                                                                 '+ application.',
                                             'exam_pattern': "3-4 passages. Traps: 'best supports' vs 'must be true', "
                                                             'EXCEPT questions.',
                                             'subtopics': [   'Science passages',
                                                              'Social science passages',
                                                              'Humanities passages',
                                                              'Main point and purpose',
                                                              'Inference',
                                                              'Detail questions',
                                                              'Application questions']},
    'GMAT|Verbal|Sentence Correction': {   'difficulty_notes': 'Easy=obvious agreement error. Medium=modifier. '
                                                               'Hard=multiple errors + idiom combined.',
                                           'exam_pattern': 'Eliminate 2-3 options on grammar. Traps: collective noun '
                                                           'agreement, which vs that, subjunctive mood.',
                                           'subtopics': [   'Subject-verb agreement',
                                                            'Pronoun reference',
                                                            'Parallelism',
                                                            'Modifiers (dangling, misplaced)',
                                                            'Verb tense and mood',
                                                            'Idiom usage',
                                                            'Comparison structure']},
    'GRE|Analytical Writing|Argument Essay': {   'difficulty_notes': 'Easy=obvious fallacy. Medium=multiple '
                                                                     'assumptions. Hard=subtle fallacy + '
                                                                     'counter-assumption.',
                                                 'exam_pattern': 'Evaluate argument, not write own opinion. Traps: '
                                                                 'agreeing/disagreeing with conclusion instead of '
                                                                 'evaluating reasoning.',
                                                 'subtopics': [   'Identifying logical fallacies',
                                                                  'Assumption identification',
                                                                  'Causation vs correlation',
                                                                  'Generalisation flaws',
                                                                  'Missing evidence',
                                                                  'Alternative explanations']},
    'GRE|Analytical Writing|Issue Essay': {   'difficulty_notes': 'Easy=clear position + basic support. Medium=nuanced '
                                                                  'position + counterargument. Hard=complex thesis + '
                                                                  'sophisticated examples.',
                                              'exam_pattern': '30-minute essay. Traps: ignoring specific task '
                                                              'instructions (agree/disagree vs consider both sides).',
                                              'subtopics': [   'Thesis development',
                                                               'Evidence and examples',
                                                               'Counterargument',
                                                               'Logical structure',
                                                               'Transitions and cohesion',
                                                               'Academic vocabulary use']},
    'GRE|Quantitative Reasoning|Algebra': {   'difficulty_notes': 'Easy=linear equation. Medium=quadratic + '
                                                                  'inequality. Hard=function + system + word problem.',
                                              'exam_pattern': 'Equation setup + solving. Traps: inequality direction '
                                                              'flip for negative, extraneous roots.',
                                              'subtopics': [   'Linear equations and inequalities',
                                                               'Quadratic equations',
                                                               'Functions and graphs',
                                                               'Systems of equations',
                                                               'Absolute value equations',
                                                               'Word problems (age, rate, work)']},
    'GRE|Quantitative Reasoning|Arithmetic': {   'difficulty_notes': 'Easy=direct calculation. Medium=QC with '
                                                                     'variable. Hard=multiple cases + edge case '
                                                                     'analysis.',
                                                 'exam_pattern': 'Quantitative comparison (QC) heavy. Traps: negative '
                                                                 'numbers in QC, 0 and 1 edge cases.',
                                                 'subtopics': [   'Number properties (even, odd, prime)',
                                                                  'Fractions, decimals, percentages',
                                                                  'Ratios and proportions',
                                                                  'Absolute value',
                                                                  'Exponents and roots',
                                                                  'Number line and ordering']},
    'GRE|Quantitative Reasoning|Data Analysis': {   'difficulty_notes': 'Easy=mean/median. Medium=standard deviation '
                                                                        'interpretation. Hard=combined probability + '
                                                                        'normal distribution.',
                                                    'exam_pattern': 'Data reading + statistical calculation. Traps: '
                                                                    'median for even set, percentile interpretation.',
                                                    'subtopics': [   'Mean, median, mode, range',
                                                                     'Standard deviation and normal distribution',
                                                                     'Percentile',
                                                                     'Probability',
                                                                     'Data interpretation (tables, graphs)',
                                                                     'Counting and combinations']},
    'GRE|Quantitative Reasoning|Geometry': {   'difficulty_notes': 'Easy=area/perimeter. Medium=composite shapes. '
                                                                   'Hard=3D + coordinate combined.',
                                               'exam_pattern': 'Property application + calculation. Traps: 30-60-90 '
                                                               'and 45-45-90 triangle ratios, sector formula.',
                                               'subtopics': [   'Lines and angles',
                                                                'Triangles (area, Pythagoras, special triangles)',
                                                                'Circles (area, circumference, arc, sector)',
                                                                'Polygons',
                                                                '3D shapes (cylinder, cone, sphere volume)',
                                                                'Coordinate geometry (slope, midpoint, distance)']},
    'GRE|Verbal Reasoning|Reading Comprehension': {   'difficulty_notes': 'Easy=directly stated. Medium=inference from '
                                                                          'detail. Hard=abstract academic passage + '
                                                                          'tone.',
                                                      'exam_pattern': 'EXCEPT questions and inference. Traps: '
                                                                      "'supported by passage' vs 'author agrees with', "
                                                                      'too narrow vs too broad.',
                                                      'subtopics': [   'Short passages (2-4 questions)',
                                                                       'Long passages (4-5 questions)',
                                                                       'Single-sentence questions',
                                                                       'Main idea and primary purpose',
                                                                       'Inference',
                                                                       "Author's tone and attitude",
                                                                       'Evaluate the argument']},
    'GRE|Verbal Reasoning|Sentence Equivalence': {   'difficulty_notes': 'Easy=obvious synonym pair. '
                                                                         'Medium=context-dependent. Hard=both blanks '
                                                                         'require nuanced vocabulary.',
                                                     'exam_pattern': 'Choose 2 words that produce equivalent meaning. '
                                                                     'Traps: words that are synonyms of each other but '
                                                                     "don't fit context.",
                                                     'subtopics': [   'Synonym pairs',
                                                                      'Contextual meaning',
                                                                      'Eliminating near-synonyms',
                                                                      'Structural clues (semicolon, colon)',
                                                                      'Positive vs negative charge']},
    'GRE|Verbal Reasoning|Text Completion': {   'difficulty_notes': 'Easy=single blank with clear clue. '
                                                                    'Medium=two-blank. Hard=three-blank with subtle '
                                                                    'logic.',
                                                'exam_pattern': 'Choose word(s) that logically complete. Traps: words '
                                                                'with similar meaning but different connotation, '
                                                                'comma-driven contrast.',
                                                'subtopics': [   'Single blank',
                                                                 'Two-blank',
                                                                 'Three-blank (independent)',
                                                                 'Logic-based word choice',
                                                                 'Contrast/concession clues',
                                                                 'Cause-effect clues']},
    'GRE|Verbal Reasoning|Vocabulary': {   'difficulty_notes': 'Easy=high-frequency word. Medium=nuanced connotation. '
                                                               'Hard=archaic or academic words in context.',
                                           'exam_pattern': 'Vocabulary used in TC and SE. Traps: common words with '
                                                           "uncommon meanings (e.g., 'sanction' = approve or "
                                                           'penalise).',
                                           'subtopics': [   'High-frequency GRE words',
                                                            'Word roots and prefixes',
                                                            'Context clues for unknown words',
                                                            'Connotation (positive/negative/neutral)',
                                                            'Register (formal vs informal)',
                                                            'Antonyms and synonyms']},
    'JEE_Mains|Chemistry|Atomic Structure': {   'difficulty_notes': 'Easy=electronic config. Medium=quantum number for '
                                                                    'an electron. Hard=spectral series + uncertainty + '
                                                                    'orbital node count.',
                                                'exam_pattern': 'Electronic configuration and quantum number '
                                                                'questions. Traps: filling d-orbitals (Cr, Cu '
                                                                'exceptions), magnetic quantum number range, node '
                                                                'calculation.',
                                                'subtopics': [   'Bohr model and hydrogen spectrum',
                                                                 'Quantum numbers (n, l, m, s)',
                                                                 'Aufbau, Hund, Pauli principles',
                                                                 'Electronic configuration',
                                                                 'Wave-particle duality',
                                                                 'Heisenberg uncertainty',
                                                                 'Shapes of orbitals']},
    'JEE_Mains|Chemistry|Biomolecules': {   'difficulty_notes': 'Easy=definition and example. '
                                                                'Medium=structure-function. Hard=integration of '
                                                                'biomolecule chemistry with reactions.',
                                            'exam_pattern': 'Factual + conceptual. Traps: anomeric carbon, peptide '
                                                            'bond formation, purine vs pyrimidine bases.',
                                            'subtopics': [   'Monosaccharides (glucose, fructose)',
                                                             'Disaccharides and polysaccharides',
                                                             'Amino acids and proteins',
                                                             'Enzymes',
                                                             'Nucleic acids (DNA, RNA)',
                                                             'Vitamins and hormones']},
    'JEE_Mains|Chemistry|Chemical Bonding': {   'difficulty_notes': 'Easy=hybridisation prediction. Medium=VSEPR + '
                                                                    'formal charge. Hard=MO theory + resonance hybrid.',
                                                'exam_pattern': 'Shape + hybridisation + bond angle. Traps: lone pair '
                                                                'effect on bond angle, formal charge calculation, MO '
                                                                'bond order.',
                                                'subtopics': [   'Ionic and covalent bonding',
                                                                 'Lewis structures and formal charge',
                                                                 'VSEPR theory (geometry and shape)',
                                                                 'Hybridisation (sp, sp2, sp3, etc.)',
                                                                 'Resonance',
                                                                 'Molecular orbital theory',
                                                                 'Hydrogen bonding and Van der Waals']},
    'JEE_Mains|Chemistry|Electrochemistry': {   'difficulty_notes': 'Easy=cell EMF direct. Medium=Nernst equation. '
                                                                    'Hard=electrolysis + Kohlrausch + concentration '
                                                                    'cells.',
                                                'exam_pattern': 'EMF calculation using Nernst. Traps: sign of cell '
                                                                'potential, electrode at which oxidation occurs, '
                                                                'electrolysis product at different electrodes.',
                                                'subtopics': [   'Electrochemical cells (Daniel cell)',
                                                                 'Standard electrode potential',
                                                                 'Nernst equation',
                                                                 "Faraday's laws of electrolysis",
                                                                 "Conductance and Kohlrausch's law",
                                                                 'Batteries and fuel cells']},
    'JEE_Mains|Chemistry|Equilibrium': {   'difficulty_notes': 'Easy=Le Chatelier shift. Medium=pH of buffer. '
                                                               'Hard=multi-equilibrium + solubility + common ion '
                                                               'combined.',
                                           'exam_pattern': 'Equilibrium constant calculation and shift prediction. '
                                                           'Traps: Kp vs Kc (Δn gas), pH of buffer using Henderson '
                                                           'equation, Ksp vs solubility.',
                                           'subtopics': [   'Kc and Kp relationship',
                                                            "Le Chatelier's principle",
                                                            'Ionic product of water',
                                                            'pH of strong/weak acids and bases',
                                                            'Buffer solution',
                                                            'Common ion effect',
                                                            'Solubility product (Ksp)']},
    'JEE_Mains|Chemistry|Hydrocarbons': {   'difficulty_notes': 'Easy=product of simple addition. Medium=EAS with two '
                                                                'substituents. Hard=multi-step synthesis + Birch.',
                                            'exam_pattern': 'Predicting the major product. Traps: Markovnikov vs '
                                                            'anti-Markovnikov conditions, regioselectivity, EAS '
                                                            'directing groups.',
                                            'subtopics': [   'Alkane nomenclature and reactions (halogenation)',
                                                             'Alkene addition reactions (Markovnikov, '
                                                             'anti-Markovnikov)',
                                                             'Alkyne reactions',
                                                             'Benzene and aromaticity (EAS reactions)',
                                                             'Ozonolysis',
                                                             'Birch reduction']},
    'JEE_Mains|Chemistry|Mole Concept': {   'difficulty_notes': 'Easy=simple mole calculation. Medium=limiting reagent '
                                                                '+ yield. Hard=back-titration + equivalent concept.',
                                            'exam_pattern': 'Multi-step stoichiometry. Traps: limiting reagent '
                                                            'identification, water of crystallisation, mixing '
                                                            'solutions of different concentrations.',
                                            'subtopics': [   'Molar mass and Avogadro number',
                                                             'Empirical and molecular formula',
                                                             'Stoichiometry and limiting reagent',
                                                             'Percentage composition',
                                                             'Concentration units (molarity, molality, mole fraction)',
                                                             'Equivalent concept']},
    'JEE_Mains|Chemistry|Organic Basics': {   'difficulty_notes': 'Easy=IUPAC name. Medium=stability order. '
                                                                  'Hard=multi-step mechanism prediction.',
                                              'exam_pattern': 'Stability order of intermediates is very common. Traps: '
                                                              'hyperconjugation vs inductive effect, ortho-para vs '
                                                              'meta directors.',
                                              'subtopics': [   'IUPAC nomenclature',
                                                               'Hybridisation and bond angles in organic molecules',
                                                               'Inductive and resonance effects',
                                                               'Carbocation, carbanion, free radical stability',
                                                               'Reaction intermediates',
                                                               'Types of organic reactions (addition, substitution, '
                                                               'elimination)']},
    'JEE_Mains|Chemistry|Polymers': {   'difficulty_notes': 'Easy=name the polymer. Medium=identify monomer. '
                                                            'Hard=mechanism of polymerisation.',
                                        'exam_pattern': 'Identification of monomer or polymer type from structure. '
                                                        'Traps: condensation vs addition identification, Buna-S vs '
                                                        'Buna-N difference.',
                                        'subtopics': [   'Addition and condensation polymerisation',
                                                         'Natural vs synthetic polymers',
                                                         'Rubber (natural and synthetic)',
                                                         'Plastics and fibres',
                                                         'Biodegradable polymers',
                                                         'Copolymers']},
    'JEE_Mains|Chemistry|States of Matter': {   'difficulty_notes': "Easy=PV=nRT. Medium=van der Waals + Graham's law. "
                                                                    'Hard=real gas deviation + critical constants.',
                                                'exam_pattern': 'Numerical gas law problems. Traps: unit conversion '
                                                                '(atm to Pa), van der Waals correction signs, effusion '
                                                                'vs diffusion.',
                                                'subtopics': [   'Ideal gas law and deviations (van der Waals)',
                                                                 'Kinetic molecular theory',
                                                                 "Graham's law of effusion",
                                                                 'Critical temperature and pressure',
                                                                 'Liquefaction of gases',
                                                                 'Surface tension and viscosity']},
    'JEE_Mains|Chemistry|Thermodynamics': {   'difficulty_notes': "Easy=direct Hess's law. Medium=Gibbs + spontaneity. "
                                                                  "Hard=Kirchhoff's law + temperature dependence of "
                                                                  'ΔH.',
                                              'exam_pattern': "Hess's law multi-step. Traps: sign of enthalpy for bond "
                                                              'breaking vs formation, entropy change for phase '
                                                              'transition, ΔG = ΔH - TΔS.',
                                              'subtopics': [   'Internal energy, enthalpy, entropy',
                                                               "Hess's law",
                                                               'Bond enthalpy calculations',
                                                               'Gibbs free energy and spontaneity',
                                                               "Kirchhoff's equation",
                                                               'Standard enthalpy of formation/combustion']},
    'JEE_Mains|Mathematics|3D Geometry': {   'difficulty_notes': 'Easy=angle between planes. Medium=point-plane '
                                                                 'distance. Hard=skew line SD + image of point in '
                                                                 'plane.',
                                             'exam_pattern': 'Intersection of line and plane, skew line SD. Traps: '
                                                             'l²+m²+n²=1 for DC, SD formula between skew lines.',
                                             'subtopics': [   'Direction cosines and ratios',
                                                              'Equation of line in 3D (symmetric and parametric)',
                                                              'Equation of plane (normal form, intercept form)',
                                                              'Angle between lines/planes',
                                                              'Distance of point from plane',
                                                              'Skew lines and shortest distance']},
    'JEE_Mains|Mathematics|Binomial Theorem': {   'difficulty_notes': 'Easy=general term. Medium=term independent of '
                                                                      'x. Hard=multinomial + greatest term + '
                                                                      'coefficient sum.',
                                                  'exam_pattern': 'Finding specific terms. Traps: index r vs r+1, '
                                                                  'middle term for even vs odd n, sum of coefficients.',
                                                  'subtopics': [   'General term T(r+1)',
                                                                   'Middle term',
                                                                   'Term independent of x',
                                                                   "Binomial coefficients and Pascal's triangle",
                                                                   'Multinomial theorem',
                                                                   'Greatest term']},
    'JEE_Mains|Mathematics|Complex Numbers': {   'difficulty_notes': 'Easy=algebra of complex. Medium=De Moivre. '
                                                                     'Hard=locus + roots of unity + geometry.',
                                                 'exam_pattern': 'Geometric interpretation is frequent. Traps: '
                                                                 'argument vs principal argument, cube roots of unity '
                                                                 'properties, distance/locus in Argand plane.',
                                                 'subtopics': [   'Algebra of complex numbers',
                                                                  'Modulus and argument',
                                                                  "Polar form and De Moivre's theorem",
                                                                  'Roots of unity',
                                                                  'Geometry in Argand plane',
                                                                  'Locus problems']},
    'JEE_Mains|Mathematics|Coordinate Geometry': {   'difficulty_notes': 'Easy=distance/slope. Medium=tangent to '
                                                                         'circle/conic. Hard=chord of contact + family '
                                                                         'of circles + combined.',
                                                     'exam_pattern': 'Tangent and normal conditions are very common. '
                                                                     'Traps: condition for tangency (c² = a²m² + b² '
                                                                     'for ellipse), chord of contact formula.',
                                                     'subtopics': [   'Straight lines (slope, distance, angle between)',
                                                                      'Circle (general equation, tangent, chord)',
                                                                      'Parabola (focus, directrix, tangent)',
                                                                      'Ellipse (eccentricity, foci, tangent)',
                                                                      'Hyperbola',
                                                                      'Pair of lines']},
    'JEE_Mains|Mathematics|Differential Equations': {   'difficulty_notes': 'Easy=variable separable. Medium=linear '
                                                                            'first order. Hard=exact + orthogonal '
                                                                            'trajectory.',
                                                        'exam_pattern': 'Identifying the type and solving. Traps: '
                                                                        'degree of DE (must be polynomial in '
                                                                        'derivatives), IF method vs homogeneous.',
                                                        'subtopics': [   'Order and degree',
                                                                         'Variable separable',
                                                                         'Homogeneous equations',
                                                                         'Linear first order (integrating factor)',
                                                                         'Exact equations',
                                                                         'Orthogonal trajectories']},
    'JEE_Mains|Mathematics|Differentiation': {   'difficulty_notes': 'Easy=basic rules. Medium=implicit + parametric. '
                                                                     'Hard=higher-order + log differentiation '
                                                                     'combined.',
                                                 'exam_pattern': 'Multi-rule chain differentiation. Traps: forgetting '
                                                                 'chain rule inside, sign errors in implicit '
                                                                 'differentiation, d/dx(x^x) via logarithmic.',
                                                 'subtopics': [   'Chain rule, product rule, quotient rule',
                                                                  'Implicit differentiation',
                                                                  'Parametric differentiation',
                                                                  'Higher order derivatives',
                                                                  'Derivative of inverse trig functions',
                                                                  'Logarithmic differentiation']},
    'JEE_Mains|Mathematics|Integration': {   'difficulty_notes': 'Easy=standard integral. Medium=by parts or '
                                                                 'substitution. Hard=multi-method + definite integral '
                                                                 '+ area.',
                                             'exam_pattern': 'Choosing the right technique. Traps: ILATE order, '
                                                             'definite integral king property, adding and subtracting '
                                                             'in partial fractions.',
                                             'subtopics': [   'Standard integrals',
                                                              'Substitution method',
                                                              'Integration by parts (ILATE)',
                                                              'Partial fractions',
                                                              'Definite integral properties',
                                                              'Area under curves',
                                                              'Reduction formulae']},
    'JEE_Mains|Mathematics|Limits': {   'difficulty_notes': 'Easy=direct substitution or standard limit. '
                                                            "Medium=L'Hopital. Hard=continuity + piecewise function + "
                                                            'limit at discontinuity.',
                                        'exam_pattern': "Indeterminate forms (0/0, ∞/∞). Traps: applying L'Hopital "
                                                        'when not in indeterminate form, continuity at a point '
                                                        'requiring LHL=RHL=f(a).',
                                        'subtopics': [   'Standard limits (sin x/x, (1+1/n)^n)',
                                                         "L'Hopital's rule",
                                                         'Sandwich theorem',
                                                         'Continuity and types of discontinuity',
                                                         'Left and right hand limits',
                                                         'Limits at infinity']},
    'JEE_Mains|Mathematics|Matrices': {   'difficulty_notes': 'Easy=matrix multiplication. Medium=determinant + '
                                                              'inverse. Hard=consistency of linear system + '
                                                              'Cayley-Hamilton.',
                                          'exam_pattern': 'Determinant calculation and system of equations. Traps: '
                                                          'non-commutativity of multiplication, adjoint vs inverse, '
                                                          '|AB| = |A||B|.',
                                          'subtopics': [   'Matrix operations (add, multiply, transpose)',
                                                           'Determinants and properties',
                                                           'Inverse of matrix (Cayley-Hamilton)',
                                                           "System of linear equations (Cramer's rule)",
                                                           'Eigenvalues (elementary)',
                                                           'Skew-symmetric matrices']},
    'JEE_Mains|Mathematics|Permutations': {   'difficulty_notes': 'Easy=nCr direct. Medium=word arrangement with '
                                                                  'restrictions. Hard=distribution + circular + '
                                                                  'multinomial.',
                                              'exam_pattern': 'Word arrangement and selection. Traps: identical items '
                                                              'in permutation, circular arrangement formula, '
                                                              'distributing identical vs distinct objects.',
                                              'subtopics': [   'Fundamental counting principle',
                                                               'Permutations (nPr)',
                                                               'Combinations (nCr)',
                                                               'Circular permutations',
                                                               'Repetition allowed/not allowed',
                                                               'Distribution problems']},
    'JEE_Mains|Mathematics|Probability': {   'difficulty_notes': 'Easy=classical probability. Medium=conditional + '
                                                                 'Bayes. Hard=binomial + expectation + combined.',
                                             'exam_pattern': 'Bayes + binomial are most tested. Traps: mutually '
                                                             'exclusive vs independent events, P(A∩B) = P(A)P(B) only '
                                                             'if independent.',
                                             'subtopics': [   'Classical probability',
                                                              'Conditional probability',
                                                              "Bayes' theorem",
                                                              'Binomial distribution',
                                                              'Poisson distribution (basics)',
                                                              'Random variable and expectation',
                                                              'Independent events']},
    'JEE_Mains|Mathematics|Sequences': {   'difficulty_notes': 'Easy=AP/GP nth term. Medium=AGP or infinite sum. '
                                                               'Hard=complex telescoping + inequalities.',
                                           'exam_pattern': 'Series sum calculation. Traps: AM ≥ GM condition, infinite '
                                                           'GP condition |r|<1, AGP sum formula.',
                                           'subtopics': [   'AP (nth term, sum)',
                                                            'GP (nth term, sum, sum to infinity)',
                                                            'HP and AM-GM-HM inequalities',
                                                            'Arithmetico-geometric series',
                                                            'Telescoping series',
                                                            'Sum of natural numbers, squares, cubes']},
    'JEE_Mains|Mathematics|Sets & Relations': {   'difficulty_notes': 'Easy=Venn diagram. Medium=equivalence relation. '
                                                                      'Hard=composition of functions + counting.',
                                                  'exam_pattern': 'Venn diagram counting and relation properties. '
                                                                  'Traps: reflexive vs symmetric, number of relations '
                                                                  'vs functions formula.',
                                                  'subtopics': [   'Types of sets (null, universal, power set)',
                                                                   'Set operations (union, intersection, difference, '
                                                                   'complement)',
                                                                   'Venn diagrams',
                                                                   'Types of relations (reflexive, symmetric, '
                                                                   'transitive, equivalence)',
                                                                   'Functions (domain, range, onto, one-one, '
                                                                   'bijective)']},
    'JEE_Mains|Mathematics|Statistics': {   'difficulty_notes': 'Easy=mean/median. Medium=variance + SD. Hard=combined '
                                                                'data statistics + change of origin/scale.',
                                            'exam_pattern': 'Calculation of variance and SD. Traps: variance formula '
                                                            '(about mean vs arbitrary point), SD vs variance units.',
                                            'subtopics': [   'Mean, median, mode',
                                                             'Variance and standard deviation',
                                                             'Mean deviation',
                                                             'Quartiles and percentiles',
                                                             'Skewness and kurtosis (basics)',
                                                             'Frequency distribution']},
    'JEE_Mains|Mathematics|Trigonometry': {   'difficulty_notes': 'Easy=exact value. Medium=inverse trig range. '
                                                                  'Hard=general solution + compound angle identity.',
                                              'exam_pattern': 'Equation solving + identity manipulation. Traps: range '
                                                              'of inverse trig, principal vs general solution, '
                                                              'sin^-1(sin(x)) simplification.',
                                              'subtopics': [   'Trigonometric identities and values',
                                                               'General solutions of trig equations',
                                                               'Inverse trig functions (domain/range)',
                                                               'Heights and distances',
                                                               'Product-to-sum formulae',
                                                               'Graphs of trig functions']},
    'JEE_Mains|Mathematics|Vectors': {   'difficulty_notes': 'Easy=dot/cross direct. Medium=projection + triple '
                                                             'product. Hard=coplanarity + geometric proof.',
                                         'exam_pattern': 'Geometric proofs using vectors. Traps: scalar triple product '
                                                         '= 0 for coplanarity, cross product order (non-commutative).',
                                         'subtopics': [   'Dot product and cross product',
                                                          'Angle between vectors',
                                                          'Projection',
                                                          'Triple product (scalar and vector)',
                                                          'Section formula in 3D',
                                                          'Collinearity and coplanarity']},
    'JEE_Mains|Physics|Current Electricity': {   'difficulty_notes': 'Easy=series/parallel resistance. '
                                                                     'Medium=Kirchhoff multi-loop. Hard=potentiometer '
                                                                     '+ Wheatstone + RC transient.',
                                                 'exam_pattern': 'Circuit analysis with Kirchhoff. Traps: forgetting '
                                                                 'internal resistance, potentiometer balance '
                                                                 'condition, RC time constant.',
                                                 'subtopics': [   "Ohm's law and resistance",
                                                                  "Kirchhoff's laws (KVL, KCL)",
                                                                  'Wheatstone bridge',
                                                                  'Meter bridge and potentiometer',
                                                                  'Internal resistance of battery',
                                                                  'RC circuit (charging/discharging)',
                                                                  'Power in resistors']},
    'JEE_Mains|Physics|Electrostatics': {   'difficulty_notes': 'Easy=Coulomb direct. Medium=Gauss law + capacitor '
                                                                'network. Hard=multiple conductors + dielectric + '
                                                                'energy.',
                                            'exam_pattern': "Gauss's law questions for symmetric charge distributions. "
                                                            'Traps: E field vs potential sign, energy in capacitor '
                                                            'with/without dielectric inserted.',
                                            'subtopics': [   "Coulomb's law",
                                                             'Electric field (point charge, dipole, sheet)',
                                                             "Gauss's law applications",
                                                             'Electric potential and potential energy',
                                                             'Capacitors (series/parallel)',
                                                             'Energy stored in capacitor',
                                                             'Dielectrics']},
    'JEE_Mains|Physics|Gravitation': {   'difficulty_notes': 'Easy=direct formula for g or orbital speed. '
                                                             "Hard=multi-body gravity + Kepler's laws combined.",
                                         'exam_pattern': 'Conceptual + numerical. Traps: escape velocity vs orbital '
                                                         'velocity confusion, g at depth vs height, energy of '
                                                         'satellite (negative total energy).',
                                         'subtopics': [   "Newton's law of gravitation",
                                                          'Gravitational field and potential',
                                                          'Escape velocity and orbital velocity',
                                                          "Kepler's laws",
                                                          'Satellite motion and energy',
                                                          'Variation of g with height/depth/latitude']},
    'JEE_Mains|Physics|Kinematics': {   'difficulty_notes': 'Easy=direct SUVAT. Medium=projectile with angles. '
                                                            'Hard=relative motion + constraint equations + graph '
                                                            'reading.',
                                        'exam_pattern': 'Multi-step calculations. Traps: sign convention for '
                                                        'deceleration, forgetting to split velocity into components, '
                                                        'mixing average speed vs average velocity. Graph-based '
                                                        'questions are frequent.',
                                        'subtopics': [   'SUVAT equations',
                                                         'Projectile motion (range, max height, time of flight)',
                                                         'Relative velocity in 1D and 2D',
                                                         'River-boat problems',
                                                         'Position-time and velocity-time graphs',
                                                         'Motion on inclined plane']},
    'JEE_Mains|Physics|Laws of Motion': {   'difficulty_notes': 'Easy=single block on surface. Medium=Atwood or '
                                                                'incline+friction. Hard=non-inertial frame + friction '
                                                                '+ constraint.',
                                            'exam_pattern': 'Always requires FBD. Traps: forgetting to resolve forces '
                                                            'along incline, neglecting friction direction, wrong sign '
                                                            'for pseudo force. Multi-body pulley questions are very '
                                                            'common at medium-hard difficulty.',
                                            'subtopics': [   "Newton's three laws with FBD",
                                                             'Static and kinetic friction',
                                                             'Tension in strings over pulleys',
                                                             'Normal force on inclines',
                                                             'Pseudo force in non-inertial frames',
                                                             'Atwood machine variants',
                                                             'Wedge-block systems']},
    'JEE_Mains|Physics|Magnetism': {   'difficulty_notes': 'Easy=force on charge in uniform B. Medium=Faraday + Lenz. '
                                                           'Hard=LCR + mutual inductance + energy.',
                                       'exam_pattern': 'Lorentz force direction using right-hand rule. Traps: '
                                                       "direction of induced current (Lenz's law), self-inductance "
                                                       'energy, resonance in LCR.',
                                       'subtopics': [   'Biot-Savart law',
                                                        "Ampere's law",
                                                        'Force on moving charge (Lorentz)',
                                                        'Force on current-carrying conductor',
                                                        'Magnetic field of solenoid and toroid',
                                                        'Electromagnetic induction (Faraday, Lenz)',
                                                        'Self and mutual inductance',
                                                        'AC circuits (LCR)']},
    'JEE_Mains|Physics|Modern Physics': {   'difficulty_notes': 'Easy=photoelectric formula. Medium=Bohr energy '
                                                                'levels. Hard=multi-step nuclear + decay + '
                                                                'relativistic energy.',
                                            'exam_pattern': 'Formula-heavy. Traps: stopping potential vs maximum KE, '
                                                            'energy levels in Bohr model, radioactive decay law.',
                                            'subtopics': [   'Photoelectric effect (Einstein equation)',
                                                             'De Broglie wavelength',
                                                             'Bohr model of hydrogen atom',
                                                             'Nuclear fission and fusion',
                                                             'Radioactive decay (half-life)',
                                                             'Mass-energy equivalence',
                                                             'X-rays']},
    'JEE_Mains|Physics|Optics': {   'difficulty_notes': 'Easy=mirror/lens formula. Medium=prism + TIR. Hard=YDSE with '
                                                        'multiple wavelengths + diffraction.',
                                    'exam_pattern': 'Ray diagram + formula. Traps: sign convention for mirrors/lenses, '
                                                    'fringe width formula, resolving power vs magnification.',
                                    'subtopics': [   'Reflection from plane and curved mirrors',
                                                     "Refraction and Snell's law",
                                                     'Total internal reflection',
                                                     'Prism (deviation, dispersion)',
                                                     'Lens formula and magnification',
                                                     "Young's double slit experiment",
                                                     'Single slit diffraction',
                                                     'Optical instruments']},
    'JEE_Mains|Physics|Rotational Motion': {   'difficulty_notes': 'Easy=direct MI formula. Medium=rolling on incline. '
                                                                   'Hard=combined rotation+translation+friction.',
                                               'exam_pattern': 'Very calculative. Traps: forgetting to add '
                                                               'translational KE in rolling, using wrong axis for MI, '
                                                               'angular momentum sign. Often combined with Laws of '
                                                               'Motion.',
                                               'subtopics': [   'Torque and angular acceleration',
                                                                'Moment of inertia (various shapes)',
                                                                'Parallel and perpendicular axis theorems',
                                                                'Rolling without slipping',
                                                                'Angular momentum conservation',
                                                                'Rotational kinetic energy',
                                                                'Combined translation+rotation']},
    'JEE_Mains|Physics|Thermodynamics': {   'difficulty_notes': 'Easy=first law direct. Medium=PV diagram area '
                                                                'calculation. Hard=Carnot + multi-process cycles.',
                                            'exam_pattern': 'PV diagram reading is essential. Traps: sign of work '
                                                            '(done BY gas vs ON gas), adiabatic process equations, '
                                                            'efficiency vs COP.',
                                            'subtopics': [   'Zeroth, First, Second laws',
                                                             'Isothermal, adiabatic, isochoric, isobaric processes',
                                                             'Work done by gas (PV diagram area)',
                                                             'Carnot engine efficiency',
                                                             'Entropy',
                                                             'Internal energy of ideal gas',
                                                             'Heat engines and refrigerators']},
    'JEE_Mains|Physics|Units & Measurement': {   'difficulty_notes': 'Easy=direct dimension formula. Hard=derive '
                                                                     'unknown constant dimension from a given '
                                                                     'equation.',
                                                 'exam_pattern': 'JEE often asks to derive dimensions of a physical '
                                                                 'quantity or check dimensional correctness of an '
                                                                 'equation. Traps: confusing radian (dimensionless) '
                                                                 'with other units, forgetting to square/cube '
                                                                 'dimensions.',
                                                 'subtopics': [   'SI units and dimensions',
                                                                  'Dimensional analysis',
                                                                  'Significant figures',
                                                                  'Error propagation (absolute, relative, percentage)',
                                                                  'Vernier caliper and screw gauge']},
    'JEE_Mains|Physics|Waves': {   'difficulty_notes': 'Easy=wave speed from equation. Medium=beats + Doppler. '
                                                       'Hard=standing wave with two sources + resonance.',
                                   'exam_pattern': 'Equation interpretation questions. Traps: wavelength vs '
                                                   'wavenumber, phase difference in standing waves, Doppler sign '
                                                   'convention (source vs observer motion).',
                                   'subtopics': [   'Wave equation y=A sin(kx-wt)',
                                                    'Superposition and interference',
                                                    'Standing waves and resonance',
                                                    'Doppler effect',
                                                    'Beats',
                                                    'Sound intensity and decibel',
                                                    'Resonance in pipes and strings']},
    'JEE_Mains|Physics|Work Energy Power': {   'difficulty_notes': 'Easy=direct KE/PE. Medium=spring+collision. '
                                                                   'Hard=variable force integration + energy in '
                                                                   'non-inertial frame.',
                                               'exam_pattern': 'Questions test energy conservation with friction or '
                                                               'spring. Traps: forgetting work done by normal force '
                                                               '(zero), sign of work by friction, kinetic energy in '
                                                               'COM frame.',
                                               'subtopics': [   'Work done by constant and variable force',
                                                                'Kinetic and potential energy',
                                                                'Work-energy theorem',
                                                                'Conservation of mechanical energy',
                                                                'Power and efficiency',
                                                                'Spring potential energy',
                                                                'Collision (elastic, inelastic, perfectly inelastic)']},
    'NEET|Botany|Biotechnology': {   'difficulty_notes': 'Easy=rDNA steps. Medium=PCR. Hard=gene therapy + bioethics + '
                                                         'combined process.',
                                     'exam_pattern': 'Process-based. Traps: sticky ends vs blunt ends, restriction '
                                                     'enzyme action, Bt crops mechanism.',
                                     'subtopics': [   'Recombinant DNA technology',
                                                      'PCR and gel electrophoresis',
                                                      'Genetically modified organisms',
                                                      'Cloning vectors',
                                                      'Bioreactors',
                                                      'Ethical issues']},
    'NEET|Botany|Cell Biology': {   'difficulty_notes': 'Easy=organelle function. Medium=cell cycle stages. '
                                                        'Hard=mitosis vs meiosis comparison.',
                                    'exam_pattern': 'Diagram-based + factual. Traps: mitosis vs meiosis stages, '
                                                    'organelle function.',
                                    'subtopics': [   'Cell organelles',
                                                     'Cell cycle and division (mitosis, meiosis)',
                                                     'Biomembranes',
                                                     'Cell signalling',
                                                     'Prokaryotic vs eukaryotic']},
    'NEET|Botany|Ecology': {   'difficulty_notes': 'Easy=definitions. Medium=population models. Hard=ecosystem energy '
                                                   '+ biodiversity indices.',
                               'exam_pattern': 'Conceptual + data-based. Traps: logistic vs exponential growth, '
                                               'primary vs secondary productivity.',
                               'subtopics': [   'Biotic and abiotic factors',
                                                'Population ecology (logistic growth)',
                                                'Community ecology',
                                                'Ecosystems (energy flow, food chain)',
                                                'Nutrient cycles',
                                                'Biodiversity and conservation',
                                                'Environmental issues']},
    'NEET|Botany|Genetics': {   'difficulty_notes': 'Easy=monohybrid cross. Medium=dihybrid + linkage. Hard=pedigree + '
                                                    'sex-linked + quantitative genetics.',
                                'exam_pattern': 'Punnett square + ratio. Traps: codominance vs incomplete dominance, '
                                                'linkage vs independent assortment.',
                                'subtopics': [   "Mendel's laws",
                                                 'Chromosomal basis of inheritance',
                                                 'Linkage and crossing over',
                                                 'Sex determination',
                                                 'Blood groups',
                                                 'DNA structure and replication',
                                                 'Mutation']},
    'NEET|Botany|Plant Anatomy': {   'difficulty_notes': 'Easy=tissue type. Medium=TS identification. Hard=secondary '
                                                         'growth + comparative anatomy.',
                                     'exam_pattern': 'TS diagram questions. Traps: dicot vs monocot anatomy, xylem vs '
                                                     'phloem position.',
                                     'subtopics': [   'Meristematic and permanent tissues',
                                                      'Vascular bundles',
                                                      'Secondary growth',
                                                      'Cork cambium',
                                                      'Anatomy of root, stem, leaf (dicot vs monocot)']},
    'NEET|Botany|Plant Morphology': {   'difficulty_notes': 'Easy=modification example. Medium=floral formula. '
                                                            'Hard=taxonomy + morphology combined.',
                                        'exam_pattern': 'Diagram identification. Traps: epigynous vs hypogynous, '
                                                        'stipulate vs exstipulate.',
                                        'subtopics': [   'Root, stem, leaf modifications',
                                                         'Inflorescence types',
                                                         'Fruit and seed structure',
                                                         'Floral formula',
                                                         'Leaf venation and arrangement']},
    'NEET|Botany|Plant Physiology': {   'difficulty_notes': 'Easy=hormone function. Medium=photosynthesis pathways. '
                                                            'Hard=water potential + mineral deficiency.',
                                        'exam_pattern': 'NCERT-level conceptual. Traps: cyclic vs non-cyclic '
                                                        'photophosphorylation, C3 vs C4 plants.',
                                        'subtopics': [   'Photosynthesis (light+dark reactions)',
                                                         'Respiration',
                                                         'Plant hormones',
                                                         'Transpiration and water potential',
                                                         'Mineral nutrition',
                                                         'Nitrogen fixation']},
    'NEET|Botany|Plant Reproduction': {   'difficulty_notes': 'Easy=type of pollination. Medium=double fertilisation. '
                                                              'Hard=embryo development + apomixis.',
                                          'exam_pattern': 'Diagram + process questions. Traps: double fertilisation '
                                                          '(triple fusion), pollination vs fertilisation.',
                                          'subtopics': [   'Vegetative reproduction',
                                                           'Sexual reproduction in angiosperms',
                                                           'Pollination types',
                                                           'Double fertilisation',
                                                           'Seed and fruit development',
                                                           'Apomixis and polyembryony']},
    'NEET|Chemistry|Chemical Bonding': {   'difficulty_notes': 'Easy=hybridisation. Medium=VSEPR. Hard=MO + resonance.',
                                           'exam_pattern': 'Shape + bond angle. Traps: lone pair effect, MO bond '
                                                           'order.',
                                           'subtopics': ['VSEPR', 'Hybridisation', 'MO theory', 'Hydrogen bonding']},
    'NEET|Chemistry|Coordination Compounds': {   'difficulty_notes': 'Easy=oxidation state. Medium=isomerism. Hard=CFT '
                                                                     '+ magnetic properties.',
                                                 'exam_pattern': 'Naming + isomerism. Traps: oxidation state of metal, '
                                                                 'geometry prediction.',
                                                 'subtopics': [   'IUPAC nomenclature',
                                                                  "Werner's theory",
                                                                  'Isomerism',
                                                                  'Crystal field theory',
                                                                  'EAN rule',
                                                                  'Applications']},
    'NEET|Chemistry|Electrochemistry': {   'difficulty_notes': 'Easy=cell EMF. Medium=Nernst. Hard=electrolysis + '
                                                               'conductance.',
                                           'exam_pattern': "EMF calculation. Traps: cell notation, Faraday's law "
                                                           'units.',
                                           'subtopics': [   'Galvanic cells',
                                                            'Nernst equation',
                                                            'Electrolysis',
                                                            'Conductance']},
    'NEET|Chemistry|Inorganic Chemistry': {   'difficulty_notes': 'Easy=periodic trends. Medium=coordination compound. '
                                                                  'Hard=multi-topic integration.',
                                              'exam_pattern': 'Fact-based + properties. Traps: anomalous behaviour of '
                                                              '2nd period, coordination compound naming.',
                                              'subtopics': [   'Periodic table trends',
                                                               'Chemical bonding',
                                                               'S-block elements',
                                                               'P-block elements',
                                                               'D and F block',
                                                               'Coordination compounds',
                                                               'Qualitative analysis']},
    'NEET|Chemistry|Mole Concept': {   'difficulty_notes': 'Easy=mole to mass. Medium=limiting reagent. '
                                                           'Hard=back-titration.',
                                       'exam_pattern': 'Stoichiometry chains. Traps: limiting reagent, hydrated salts.',
                                       'subtopics': [   'Molar mass',
                                                        'Empirical formula',
                                                        'Stoichiometry',
                                                        'Limiting reagent',
                                                        'Concentration units']},
    'NEET|Chemistry|Organic Chemistry': {   'difficulty_notes': 'Easy=simple product. Medium=multi-step. '
                                                                'Hard=synthesis + retrosynthesis.',
                                            'exam_pattern': 'Product prediction and mechanism. Traps: Markovnikov, EAS '
                                                            'directing groups.',
                                            'subtopics': [   'Reaction mechanisms',
                                                             'Named reactions',
                                                             'Biomolecules',
                                                             'Polymers',
                                                             'Practical organic chemistry']},
    'NEET|Chemistry|Physical Chemistry': {   'difficulty_notes': 'Easy=mole calc. Medium=equilibrium. Hard=kinetics + '
                                                                 'electrochemistry combined.',
                                             'exam_pattern': 'Numerical + conceptual blend. Traps: Kp vs Kc, rate law '
                                                             'vs mechanism.',
                                             'subtopics': [   'Mole concept',
                                                              'Equilibrium',
                                                              'Thermodynamics',
                                                              'Electrochemistry',
                                                              'Chemical kinetics',
                                                              'Solutions']},
    'NEET|Physics|Current Electricity': {   'difficulty_notes': 'Easy=series/parallel. Medium=Kirchhoff. '
                                                                'Hard=potentiometer + Wheatstone.',
                                            'exam_pattern': 'Circuit analysis. Traps: potentiometer balance, internal '
                                                            'resistance effect.',
                                            'subtopics': [   "Ohm's law",
                                                             "Kirchhoff's laws",
                                                             'Potentiometer',
                                                             'Internal resistance']},
    'NEET|Physics|Electrostatics': {   'difficulty_notes': 'Easy=Coulomb. Medium=Gauss. Hard=capacitor networks.',
                                       'exam_pattern': 'Conceptual + formula. Traps: E inside conductor = 0, energy '
                                                       'stored in capacitor.',
                                       'subtopics': ["Coulomb's law", "Gauss's law", 'Capacitors', 'Potential energy']},
    'NEET|Physics|Magnetism': {   'difficulty_notes': 'Easy=force direction. Medium=Faraday. Hard=transformer + '
                                                      'back-EMF.',
                                  'exam_pattern': "Direction of force using hand rule. Traps: Lenz's law direction, "
                                                  'transformer turns ratio.',
                                  'subtopics': ['Biot-Savart', 'Lorentz force', "Faraday's law", 'Transformer']},
    'NEET|Physics|Mechanics': {   'difficulty_notes': 'Easy=direct formula. Medium=SHM + circular motion combined. '
                                                      'Hard=multi-body + constraint + SHM.',
                                  'exam_pattern': 'NEET Mechanics tests conceptual understanding + single formula. '
                                                  'Traps: centripetal vs centrifugal, SHM restoring force sign, fluid '
                                                  'pressure at depth.',
                                  'subtopics': [   "Newton's laws + FBD",
                                                   'Work-energy theorem',
                                                   'Momentum and collisions',
                                                   'Circular motion',
                                                   'Gravitation',
                                                   'Simple harmonic motion',
                                                   'Fluid statics (pressure, Archimedes)']},
    'NEET|Physics|Modern Physics': {   'difficulty_notes': 'Easy=photoelectric. Medium=Bohr. Hard=nuclear reactions + '
                                                           'decay combined.',
                                       'exam_pattern': 'Fact-heavy + formula. Traps: stopping potential, energy level '
                                                       'calculation.',
                                       'subtopics': [   'Photoelectric effect',
                                                        'Bohr model',
                                                        'Nuclear physics',
                                                        'Radioactive decay']},
    'NEET|Physics|Optics': {   'difficulty_notes': 'Easy=mirror formula. Medium=lens + prism. Hard=optical instruments '
                                                   '+ aberration.',
                               'exam_pattern': 'Sign convention + ray diagram. Traps: lens vs mirror sign, '
                                               'magnification formula.',
                               'subtopics': ['Reflection', 'Refraction', 'Lens formula', 'Microscope and telescope']},
    'NEET|Physics|Thermodynamics': {   'difficulty_notes': 'Easy=calorimetry. Medium=first law + Carnot. Hard=Stefan + '
                                                           "Newton's cooling combined.",
                                       'exam_pattern': "Heat transfer modes + first law. Traps: Newton's cooling vs "
                                                       "Stefan's law, calorimetry mixing sign convention.",
                                       'subtopics': [   'Thermal expansion',
                                                        'Specific heat and calorimetry',
                                                        'First and second law',
                                                        'Carnot engine',
                                                        'Kinetic theory of gases',
                                                        'Heat transfer (conduction, convection, radiation)',
                                                        "Stefan's law"]},
    'NEET|Physics|Waves': {   'difficulty_notes': 'Easy=wave speed. Medium=Doppler. Hard=beats + resonance + Doppler '
                                                  'combined.',
                              'exam_pattern': 'Doppler and resonance. Traps: open vs closed pipe harmonics, Doppler '
                                              'sign.',
                              'subtopics': ['Wave speed', 'Sound intensity', 'Doppler effect', 'Resonance in pipes']},
    'NEET|Zoology|Animal Kingdom': {   'difficulty_notes': 'Easy=phylum name. Medium=characteristic feature matching. '
                                                           'Hard=comparative anatomy + classification.',
                                       'exam_pattern': 'Identification from description. Traps: coelom types, '
                                                       'notochord presence, symmetry.',
                                       'subtopics': [   'Classification criteria',
                                                        'Phyla (Porifera to Chordata)',
                                                        'Characteristic features of each phylum',
                                                        'Non-chordate vs chordate',
                                                        'Vertebrate classes']},
    'NEET|Zoology|Biomolecules': {   'difficulty_notes': 'Easy=monomer of polymer. Medium=enzyme kinetics. '
                                                         'Hard=allosteric + competitive + enzyme regulation.',
                                     'exam_pattern': 'Structure-function and enzyme kinetics. Traps: Km '
                                                     'interpretation, protein structure levels, enzyme inhibition '
                                                     'types.',
                                     'subtopics': [   'Carbohydrates (structure and function)',
                                                      'Proteins (structure levels)',
                                                      'Lipids',
                                                      'Enzymes (cofactors, inhibition, kinetics)',
                                                      'Nucleic acids']},
    'NEET|Zoology|Evolution': {   'difficulty_notes': 'Easy=theory statement. Medium=Hardy-Weinberg calculation. '
                                                      'Hard=speciation + evidence integration.',
                                  'exam_pattern': 'Conceptual + factual. Traps: Lamarck vs Darwin distinction, '
                                                  'Hardy-Weinberg conditions.',
                                  'subtopics': [   'Theories of evolution (Lamarck, Darwin)',
                                                   'Evidence for evolution',
                                                   'Natural selection types',
                                                   'Speciation',
                                                   'Human evolution',
                                                   'Hardy-Weinberg principle']},
    'NEET|Zoology|Human Health and Disease': {   'difficulty_notes': 'Easy=disease-pathogen. Medium=immunity types. '
                                                                     'Hard=immune mechanism + drug abuse physiology.',
                                                 'exam_pattern': 'Factual + mechanism. Traps: active vs passive '
                                                                 'immunity, B vs T cell roles.',
                                                 'subtopics': [   'Innate and adaptive immunity',
                                                                  'Antibody structure',
                                                                  'Vaccines',
                                                                  'Common diseases (bacterial, viral, parasitic)',
                                                                  'Cancer (types and treatment)',
                                                                  'Drug and alcohol abuse',
                                                                  'AIDS']},
    'NEET|Zoology|Human Physiology': {   'difficulty_notes': 'Easy=organ function. Medium=process steps. '
                                                             'Hard=integration of multiple systems.',
                                         'exam_pattern': 'NCERT diagrams + process. Traps: enzyme in digestion '
                                                         'location, cardiac cycle, nephron filtration.',
                                         'subtopics': [   'Digestion and absorption',
                                                          'Breathing and gas exchange',
                                                          'Body fluids and circulation',
                                                          'Excretory system',
                                                          'Locomotion and movement',
                                                          'Neural control and coordination',
                                                          'Chemical coordination (endocrine)']},
    'NEET|Zoology|Human Reproduction': {   'difficulty_notes': 'Easy=organ function. Medium=gametogenesis stages. '
                                                               'Hard=menstrual + embryo development combined.',
                                           'exam_pattern': 'Diagram-based + process sequence. Traps: oogenesis vs '
                                                           'spermatogenesis ploidy, menstrual cycle phases.',
                                           'subtopics': [   'Male and female reproductive systems',
                                                            'Gametogenesis (spermatogenesis, oogenesis)',
                                                            'Menstrual cycle',
                                                            'Fertilisation and implantation',
                                                            'Embryo development',
                                                            'Reproductive health and contraception']},
    'NEET|Zoology|Structural Organisation': {   'difficulty_notes': 'Easy=tissue function. Medium=type identification. '
                                                                    'Hard=histology + function integration.',
                                                'exam_pattern': 'Tissue type identification. Traps: simple vs compound '
                                                                'epithelium, types of connective tissue.',
                                                'subtopics': [   'Epithelial tissues',
                                                                 'Connective tissue',
                                                                 'Muscular tissue',
                                                                 'Neural tissue',
                                                                 'Organ and organ system']},
    'SAT|Math|Additional Topics': {   'difficulty_notes': 'Easy=area/volume. Medium=trig ratio. Hard=circle equation + '
                                                          'trig + complex number.',
                                      'exam_pattern': 'Geometry + trig. Traps: radian vs degree, circle equation '
                                                      'standard form.',
                                      'subtopics': [   'Geometry (area, volume, circle equations)',
                                                       'Trigonometry (SOH-CAH-TOA, unit circle basics)',
                                                       'Complex numbers basics',
                                                       'Radian measure',
                                                       'Similarity and congruence']},
    'SAT|Math|Heart of Algebra': {   'difficulty_notes': 'Easy=solve linear equation. Medium=system of equations. '
                                                         'Hard=word problem + inequality + graph.',
                                     'exam_pattern': 'Both calculator and no-calculator. Traps: no-calculator '
                                                     'quadratic shortcut, inequality flip.',
                                     'subtopics': [   'Linear equations (one and two variables)',
                                                      'Systems of linear equations',
                                                      'Inequalities',
                                                      'Absolute value equations',
                                                      'Linear functions and graphs',
                                                      'Word problem translation']},
    'SAT|Math|Passport to Advanced Math': {   'difficulty_notes': 'Easy=quadratic formula. Medium=polynomial + '
                                                                  'rational. Hard=function composition + system.',
                                              'exam_pattern': 'Equation solving + function. Traps: extraneous '
                                                              'solutions in radical equations, vertex form of '
                                                              'quadratic.',
                                              'subtopics': [   'Quadratic equations and functions',
                                                               'Polynomial operations',
                                                               'Rational expressions',
                                                               'Radicals and exponents',
                                                               'Function notation and operations',
                                                               'Systems with quadratic and linear']},
    'SAT|Math|Problem Solving and Data Analysis': {   'difficulty_notes': 'Easy=percentage calculation. '
                                                                          'Medium=scatterplot + statistics. '
                                                                          'Hard=combined data + inference.',
                                                      'exam_pattern': 'Graphic-based + calculation. Traps: correlation '
                                                                      '≠ causation, mean shift with outlier.',
                                                      'subtopics': [   'Ratios and proportions',
                                                                       'Percentages',
                                                                       'Units and measurement',
                                                                       'Scatterplots and correlation',
                                                                       'Two-way tables',
                                                                       'Probability',
                                                                       'Statistics (mean, median, standard '
                                                                       'deviation)']},
    'SAT|Reading|Evidence Support': {   'difficulty_notes': 'Easy=direct quote support. Medium=inference + evidence '
                                                            'pair. Hard=complex claim + quantitative evidence.',
                                        'exam_pattern': 'Two-part questions (claim + evidence). Traps: choosing '
                                                        'evidence that only partially supports, graph data misread.',
                                        'subtopics': [   'Best evidence pairs',
                                                         'Citing textual evidence',
                                                         'Quantitative evidence from graphs',
                                                         'Supporting a claim',
                                                         'Undermining a claim',
                                                         "Author's purpose and perspective"]},
    'SAT|Reading|Passage Interpretation': {   'difficulty_notes': 'Easy=directly stated detail. Medium=inference + '
                                                                  'evidence. Hard=paired + graphic + synthesis.',
                                              'exam_pattern': 'Command of Evidence questions. Traps: selecting '
                                                              'evidence that supports wrong answer, graphic '
                                                              'interpretation mismatch.',
                                              'subtopics': [   'Literary narrative passages',
                                                               'Historical document passages',
                                                               'Social science passages',
                                                               'Natural science passages',
                                                               'Paired passages',
                                                               'Informational graphics paired with passage']},
    'SAT|Reading|Vocabulary in Context': {   'difficulty_notes': 'Easy=common word in clear context. Medium=ambiguous '
                                                                 'context. Hard=technical vocabulary in science '
                                                                 'passage.',
                                             'exam_pattern': 'Choose best meaning in context. Traps: primary '
                                                             'definition ≠ contextual definition.',
                                             'subtopics': [   'Multiple-meaning words',
                                                              'Contextual definition',
                                                              'Tone-matching vocabulary',
                                                              'Connotation in academic context',
                                                              'Idiomatic usage',
                                                              'Formal vs informal register']},
    'SAT|Writing and Language|Expression of Ideas': {   'difficulty_notes': 'Easy=obvious transition. Medium=logical '
                                                                            'sequence. Hard=relevance + argument '
                                                                            'structure combined.',
                                                        'exam_pattern': 'Which sentence best supports the argument? '
                                                                        'Traps: relevant-but-off-topic detail, weak vs '
                                                                        'strong transition.',
                                                        'subtopics': [   'Transitions (contrast, addition, '
                                                                         'cause-effect)',
                                                                         'Sentence combining',
                                                                         'Relevance of supporting detail',
                                                                         'Proposition and support',
                                                                         'Logical sequence of sentences',
                                                                         'Introductory and concluding sentences']},
    'SAT|Writing and Language|Grammar': {   'difficulty_notes': 'Easy=obvious agreement. Medium=pronoun reference. '
                                                                'Hard=complex sentence + multiple error types.',
                                            'exam_pattern': "Fix the underlined portion. Traps: 'NO CHANGE' is often "
                                                            'correct, collective noun agreement.',
                                            'subtopics': [   'Subject-verb agreement',
                                                             'Pronoun-antecedent agreement',
                                                             'Verb tense consistency',
                                                             'Apostrophe and possessives',
                                                             'Comma usage',
                                                             'Run-on sentences and fragments']},
    'SAT|Writing and Language|Sentence Structure': {   'difficulty_notes': 'Easy=obvious redundancy. Medium=parallel '
                                                                           'structure. Hard=modifier + conciseness + '
                                                                           'voice combined.',
                                                       'exam_pattern': 'Eliminate wordy or awkward option. Traps: '
                                                                       "'correct but verbose' vs 'concise and "
                                                                       "correct'.",
                                                       'subtopics': [   'Parallel structure',
                                                                        'Modifier placement',
                                                                        'Conciseness',
                                                                        'Awkward phrasing',
                                                                        'Passive vs active voice',
                                                                        'Clause structure']},
    'SSC_CGL|English Comprehension|Cloze Test': {   'difficulty_notes': 'Easy=grammar-clear blank. Medium=vocabulary. '
                                                                        'Hard=combined grammar + vocab + context.',
                                                    'exam_pattern': '10 blanks in passage. Traps: grammar + vocabulary '
                                                                    'combined, multiple grammatically correct but '
                                                                    'contextually wrong.',
                                                    'subtopics': [   'Grammar-based fill',
                                                                     'Vocabulary-based fill',
                                                                     'Contextual coherence',
                                                                     'Preposition and article fill',
                                                                     'Conjunction fill']},
    'SSC_CGL|English Comprehension|Grammar': {   'difficulty_notes': 'Easy=subject-verb error. Medium=tense sequence. '
                                                                     'Hard=complex sentence + multiple error types.',
                                                 'exam_pattern': 'Identify error or improve sentence. Traps: article '
                                                                 'usage (a/an/the), preposition pairs.',
                                                 'subtopics': [   'Error spotting (subject-verb, tense, article, '
                                                                  'preposition)',
                                                                  'Active-passive voice',
                                                                  'Direct-indirect speech',
                                                                  'Sentence improvement',
                                                                  'Cloze test']},
    'SSC_CGL|English Comprehension|Reading Comprehension': {   'difficulty_notes': 'Easy=stated fact. '
                                                                                   'Medium=inference. Hard=tone + '
                                                                                   'application.',
                                                               'exam_pattern': '5 questions per passage. Traps: '
                                                                               'extreme options (always/never), '
                                                                               'inference vs stated.',
                                                               'subtopics': [   'Main idea',
                                                                                'Inference',
                                                                                'Vocabulary in context',
                                                                                "Author's tone",
                                                                                'Specific detail']},
    'SSC_CGL|English Comprehension|Vocabulary': {   'difficulty_notes': 'Easy=common word synonym. Medium=idiom '
                                                                        'meaning. Hard=archaic + technical vocabulary.',
                                                    'exam_pattern': 'Direct MCQ. Traps: near-synonyms with different '
                                                                    'connotation, context-specific meaning.',
                                                    'subtopics': [   'Synonyms and antonyms',
                                                                     'One-word substitution',
                                                                     'Idioms and phrases',
                                                                     'Spelling correction',
                                                                     'Analogies (word pair)']},
    'SSC_CGL|General Awareness|Current Affairs': {   'difficulty_notes': 'Easy=major national event. '
                                                                         'Medium=international + sports. '
                                                                         'Hard=multi-domain current affairs.',
                                                     'exam_pattern': 'Fact-based. Traps: year-specific events, '
                                                                     'similar-sounding awards.',
                                                     'subtopics': [   'National events',
                                                                      'International events',
                                                                      'Awards and honours',
                                                                      'Sports results',
                                                                      'Economic news',
                                                                      'Government schemes',
                                                                      'Science and technology news']},
    'SSC_CGL|General Awareness|Geography': {   'difficulty_notes': 'Easy=capital/river. Medium=climate zone. '
                                                                   'Hard=multi-map + resource combined.',
                                               'exam_pattern': 'Location + feature. Traps: river tributary direction, '
                                                               'state boundary minerals.',
                                               'subtopics': [   'India physical geography',
                                                                'World geography',
                                                                'Climate and monsoon',
                                                                'Rivers and lakes',
                                                                'Natural resources and minerals',
                                                                'Economic geography of India']},
    'SSC_CGL|General Awareness|History': {   'difficulty_notes': 'Easy=major event year. Medium=Governor-General '
                                                                 'achievement. Hard=multi-event sequence.',
                                             'exam_pattern': 'Fact-based. Traps: year of events, first/last facts.',
                                             'subtopics': [   'Ancient India (Vedic, Mauryan, Gupta)',
                                                              'Medieval India (Sultanate, Mughal)',
                                                              'Modern India (Colonialism, freedom struggle)',
                                                              'Governor-Generals and Viceroys',
                                                              'Important dates and battles']},
    'SSC_CGL|General Awareness|Polity': {   'difficulty_notes': 'Easy=body name/function. Medium=constitutional '
                                                                'provision. Hard=article + case + provision combined.',
                                            'exam_pattern': 'Direct constitutional fact. Traps: article number, '
                                                            'composition of bodies.',
                                            'subtopics': [   'Constitution basics',
                                                             'Parliament + State legislature',
                                                             'Fundamental Rights',
                                                             'Directive Principles',
                                                             'Elections + Electoral body',
                                                             'Constitutional + Statutory bodies']},
    'SSC_CGL|General Awareness|Science': {   'difficulty_notes': 'Easy=basic science fact. Medium=application. '
                                                                 'Hard=combined science + current tech.',
                                             'exam_pattern': 'Fact-based GK. Traps: similar scientific names, inventor '
                                                             'vs discoverer.',
                                             'subtopics': [   'Physics (light, sound, electricity basics)',
                                                              'Chemistry (elements, compounds, reactions)',
                                                              'Biology (human body, plants, animals)',
                                                              'Science in daily life',
                                                              'Scientific inventions and inventors']},
    'SSC_CGL|General Intelligence|Analogies': {   'difficulty_notes': 'Easy=direct pair. Medium=double-step analogy. '
                                                                      'Hard=mixed type with GK.',
                                                  'exam_pattern': 'Fast solving. Traps: multiple valid relationships, '
                                                                  'number pattern in digit-based analogies.',
                                                  'subtopics': [   'Word analogies',
                                                                   'Number analogies',
                                                                   'Letter analogies',
                                                                   'GK-based analogies',
                                                                   'Functional analogies']},
    'SSC_CGL|General Intelligence|Classification': {   'difficulty_notes': 'Easy=clear category. Medium=subtle '
                                                                           'property. Hard=GK + reasoning combined.',
                                                       'exam_pattern': 'Identify the odd element. Traps: multiple '
                                                                       'potential answers — check all options.',
                                                       'subtopics': [   'Odd one out (words, numbers, letters, GK)',
                                                                        'Category identification',
                                                                        'Matrix classification']},
    'SSC_CGL|General Intelligence|Coding Decoding': {   'difficulty_notes': 'Easy=+1 letter shift. Medium=mixed '
                                                                            'number+letter. Hard=conditional + '
                                                                            'multi-step.',
                                                        'exam_pattern': 'Reverse-engineer the code. Traps: uppercase '
                                                                        'vs lowercase position, two-step encoding.',
                                                        'subtopics': [   'Letter shifting',
                                                                         'Number codes',
                                                                         'Symbol coding',
                                                                         'Word-to-code',
                                                                         'Condition-based coding']},
    'SSC_CGL|General Intelligence|Non Verbal Reasoning': {   'difficulty_notes': 'Easy=direct mirror image. '
                                                                                 'Medium=figure series. Hard=matrix + '
                                                                                 'embedded combined.',
                                                             'exam_pattern': 'Visual pattern. Traps: flipped vs '
                                                                             'rotated, paper fold directions.',
                                                             'subtopics': [   'Mirror and water images',
                                                                              'Figure series',
                                                                              'Embedded figures',
                                                                              'Paper folding and cutting',
                                                                              'Counting geometric figures',
                                                                              'Matrix completion']},
    'SSC_CGL|General Intelligence|Series': {   'difficulty_notes': 'Easy=single arithmetic pattern. Medium=mixed '
                                                                   'pattern. Hard=alphanumeric + two operations.',
                                               'exam_pattern': 'Pattern identification. Traps: two operations in same '
                                                               'series, position-based letter series.',
                                               'subtopics': [   'Number series (arithmetic, geometric, mixed)',
                                                                'Letter series',
                                                                'Alphanumeric series',
                                                                'Missing number in pattern']},
    'SSC_CGL|Quantitative Aptitude|Algebra': {   'difficulty_notes': 'Easy=simple identity. Medium=linear system. '
                                                                     'Hard=identity + polynomial + surd combined.',
                                                 'exam_pattern': 'Identity-based shortcuts. Traps: (a+b)² vs (a+b)³, '
                                                                 'surd simplification.',
                                                 'subtopics': [   'Basic algebraic identities',
                                                                  'Linear equations',
                                                                  'Quadratic equations',
                                                                  'Polynomial factorisation',
                                                                  'Surds and indices']},
    'SSC_CGL|Quantitative Aptitude|Data Interpretation': {   'difficulty_notes': 'Easy=single chart read. '
                                                                                 'Medium=two-step calculation. '
                                                                                 'Hard=mixed chart + comparison.',
                                                             'exam_pattern': 'Percentage and ratio. Traps: reading '
                                                                             'approximate values, total calculation '
                                                                             'from pie chart.',
                                                             'subtopics': [   'Bar charts',
                                                                              'Pie charts',
                                                                              'Line graphs',
                                                                              'Tables',
                                                                              'Mixed DI (2 charts)']},
    'SSC_CGL|Quantitative Aptitude|Geometry': {   'difficulty_notes': 'Easy=basic area. Medium=circle theorem. Hard=3D '
                                                                      'mensuration + coordinate combined.',
                                                  'exam_pattern': 'Circle theorem + mensuration dominate. Traps: '
                                                                  'inscribed angle vs central angle, incorrect formula '
                                                                  'use.',
                                                  'subtopics': [   'Triangle properties (similarity, congruence)',
                                                                   'Circle theorems',
                                                                   'Quadrilateral properties',
                                                                   'Mensuration (2D and 3D)',
                                                                   'Coordinate geometry basics',
                                                                   'Trigonometry in geometry']},
    'SSC_CGL|Quantitative Aptitude|Mensuration': {   'difficulty_notes': 'Easy=standard 2D area. Medium=3D volume. '
                                                                         'Hard=frustum + composite shape.',
                                                     'exam_pattern': 'Formula application. Traps: total surface area '
                                                                     'vs lateral surface area, frustum formula.',
                                                     'subtopics': [   'Area and perimeter (2D: triangle, circle, '
                                                                      'polygon)',
                                                                      'Volume and surface area (3D: cylinder, cone, '
                                                                      'sphere)',
                                                                      'Combination of shapes',
                                                                      'Unit conversion',
                                                                      'Frustum']},
    'SSC_CGL|Quantitative Aptitude|Number System': {   'difficulty_notes': 'Easy=HCF/LCM. Medium=remainder + unit '
                                                                           'digit. Hard=cyclicity + divisibility '
                                                                           'combined.',
                                                       'exam_pattern': 'SSC focuses on fast calculation. Traps: HCF vs '
                                                                       'LCM use, cyclicity of 2/3/7.',
                                                       'subtopics': [   'Divisibility rules',
                                                                        'HCF and LCM',
                                                                        'Prime numbers',
                                                                        'Unit digit',
                                                                        'Cyclicity',
                                                                        'Remainders']},
    'UPSC_CSE|CSAT|Analytical Ability': {   'difficulty_notes': 'Easy=direct inference. Medium=assumption '
                                                                'identification. Hard=complex argument with multiple '
                                                                'premises.',
                                            'exam_pattern': 'Identify the assumption or inference. Traps: necessary vs '
                                                            'sufficient assumption.',
                                            'subtopics': [   'Critical reasoning',
                                                             'Assumption identification',
                                                             'Strengthening/weakening arguments',
                                                             'Cause and effect',
                                                             'Course of action']},
    'UPSC_CSE|CSAT|Basic Numeracy': {   'difficulty_notes': 'Easy=direct formula. Medium=two-variable equation. '
                                                            'Hard=combined work + compound interest.',
                                        'exam_pattern': 'Straightforward arithmetic. Traps: percentage of percentage, '
                                                        'net profit, relative speed.',
                                        'subtopics': [   'Number system and HCF/LCM',
                                                         'Percentage and ratio',
                                                         'Profit and loss',
                                                         'Time-speed-distance',
                                                         'Time and work',
                                                         'Simple and compound interest',
                                                         'Mensuration basics']},
    'UPSC_CSE|CSAT|Data Interpretation': {   'difficulty_notes': 'Easy=direct read from graph. Medium=two-step '
                                                                 'calculation. Hard=combined chart + approximation.',
                                             'exam_pattern': 'Calculation-heavy. Traps: percentage change vs absolute '
                                                             'change, reading exact vs approximate values.',
                                             'subtopics': [   'Bar charts',
                                                              'Pie charts',
                                                              'Line graphs',
                                                              'Tables',
                                                              'Caselets',
                                                              'Mixed DI']},
    'UPSC_CSE|CSAT|Interpersonal Skills': {   'difficulty_notes': 'Easy=best communication style. Medium=conflict '
                                                                  'resolution. Hard=leadership dilemma with multiple '
                                                                  'correct options.',
                                              'exam_pattern': 'Scenario-based best-response. Traps: avoid extreme '
                                                              'responses, consider all stakeholders.',
                                              'subtopics': [   'Communication skills',
                                                               'Leadership styles',
                                                               'Team dynamics',
                                                               'Conflict resolution',
                                                               'Motivation theories',
                                                               'Decision making models']},
    'UPSC_CSE|CSAT|Logical Reasoning': {   'difficulty_notes': 'Easy=direct syllogism. Medium=blood relations + '
                                                               'direction. Hard=complex coding + statement chain.',
                                           'exam_pattern': 'Fast-solving. Traps: Venn diagram syllogism errors, coding '
                                                           'pattern recognition.',
                                           'subtopics': [   'Syllogisms',
                                                            'Analogies',
                                                            'Blood relations',
                                                            'Directions',
                                                            'Coding-decoding',
                                                            'Input-output',
                                                            'Statement-conclusion']},
    'UPSC_CSE|CSAT|Reading Comprehension': {   'difficulty_notes': 'Easy=directly stated fact. Medium=inference. '
                                                                   'Hard=author tone + unstated assumption.',
                                               'exam_pattern': '4-5 questions per passage. Traps: extreme language '
                                                               '(always/never), inference vs stated fact.',
                                               'subtopics': [   'Main idea identification',
                                                                'Inference questions',
                                                                "Tone and author's purpose",
                                                                'Vocabulary in context',
                                                                'Passage-based fact questions']},
    'UPSC_CSE|General Studies 1|Geography of India': {   'difficulty_notes': 'Easy=river name/location. Medium=monsoon '
                                                                             'mechanism. Hard=economic geography + '
                                                                             'environmental linkage.',
                                                         'exam_pattern': 'Map-based and feature-based. Traps: '
                                                                         'Himalayan rivers vs Peninsular rivers, soil '
                                                                         'types and their regions.',
                                                         'subtopics': [   'Physiographic divisions',
                                                                          'Monsoon system',
                                                                          'River systems',
                                                                          'Soils and vegetation',
                                                                          'Natural disasters',
                                                                          'Economic geography (minerals, crops)',
                                                                          'Population distribution']},
    'UPSC_CSE|General Studies 1|History of India': {   'difficulty_notes': 'Easy=single fact. Medium=two-statement '
                                                                           'analysis. Hard=historiographical debate '
                                                                           'question.',
                                                       'exam_pattern': 'Statement-based (True/False multiple '
                                                                       'statements). Traps: dates, Harappan vs Vedic '
                                                                       'distinction, 1857 causes.',
                                                       'subtopics': [   'Ancient India (Indus Valley, Vedic, Maurya, '
                                                                        'Gupta)',
                                                                        'Medieval India (Delhi Sultanate, Mughal)',
                                                                        'British colonialism',
                                                                        'Freedom struggle',
                                                                        'Post-independence consolidation']},
    'UPSC_CSE|General Studies 1|Indian Culture': {   'difficulty_notes': 'Easy=capital city of art form. '
                                                                         'Medium=architectural style identification. '
                                                                         'Hard=cross-cultural synthesis question.',
                                                     'exam_pattern': 'Match-the-following and statement-based. Traps: '
                                                                     'Dravidian vs Nagara vs Vesara architecture, '
                                                                     'Carnatic vs Hindustani.',
                                                     'subtopics': [   'Art forms (classical dance, music, sculpture)',
                                                                      'Architecture (temple styles, Mughal)',
                                                                      'Literature',
                                                                      'Fairs and festivals',
                                                                      'Intangible cultural heritage',
                                                                      'UNESCO heritage sites in India']},
    'UPSC_CSE|General Studies 1|Indian Society': {   'difficulty_notes': 'Easy=concept definition. Medium=factor '
                                                                         'analysis. Hard=multi-dimensional social '
                                                                         'issue analysis.',
                                                     'exam_pattern': 'Conceptual and sociological. Traps: defining '
                                                                     'concepts precisely (secularism vs communalism).',
                                                     'subtopics': [   'Diversity and unity',
                                                                      'Social institutions (caste, tribe, family)',
                                                                      'Social change and mobility',
                                                                      'Communalism, regionalism, secularism',
                                                                      'Urbanisation',
                                                                      'Women and gender issues',
                                                                      'Poverty and inequality']},
    'UPSC_CSE|General Studies 1|World Geography': {   'difficulty_notes': 'Easy=continent/country. Medium=current '
                                                                          'effects. Hard=resource + geopolitics '
                                                                          'linkage.',
                                                      'exam_pattern': 'Location and feature matching. Traps: similar '
                                                                      'names, ocean current effects on climate.',
                                                      'subtopics': [   'Continents and oceans',
                                                                       'Climate zones',
                                                                       'Ocean currents',
                                                                       'Mountains and plateaus',
                                                                       'Important straits and passes',
                                                                       'International boundaries',
                                                                       'Resources distribution']},
    'UPSC_CSE|General Studies 1|World History': {   'difficulty_notes': 'Easy=event identification. '
                                                                        'Medium=cause-effect chain. Hard=comparative '
                                                                        'world history question.',
                                                    'exam_pattern': 'Statement-based cause-effect. Traps: '
                                                                    'year-specific events, ideological distinctions '
                                                                    '(Nazism vs Fascism).',
                                                    'subtopics': [   'Industrial revolution',
                                                                     'French revolution',
                                                                     'World War I and II',
                                                                     'Cold War',
                                                                     'Decolonisation',
                                                                     'Globalisation',
                                                                     'Rise of fascism']},
    'UPSC_CSE|General Studies 2|Governance': {   'difficulty_notes': 'Easy=scheme identification. Medium=governance '
                                                                     'mechanism. Hard=reform analysis.',
                                                 'exam_pattern': 'Current affairs linked + conceptual. Traps: RTI '
                                                                 'exemptions, Lokpal vs Lokayukta distinction.',
                                                 'subtopics': [   'e-Governance and digital India',
                                                                  'Transparency (RTI, Lokpal)',
                                                                  'Civil services reforms',
                                                                  'Public policy',
                                                                  'Social audit',
                                                                  'Decentralisation']},
    'UPSC_CSE|General Studies 2|Indian Constitution': {   'difficulty_notes': 'Easy=identify article. Medium=FR vs '
                                                                              'DPSP distinction. Hard=constitutional '
                                                                              'case analysis.',
                                                          'exam_pattern': 'Precise constitutional provisions. Traps: '
                                                                          'distinguishing FR from DPSP, Article '
                                                                          'numbers, justiciability.',
                                                          'subtopics': [   'Preamble',
                                                                           'Fundamental Rights and Duties',
                                                                           'Directive Principles',
                                                                           'Constitutional amendments',
                                                                           'Emergency provisions',
                                                                           'Constitutional bodies']},
    'UPSC_CSE|General Studies 2|International Relations': {   'difficulty_notes': 'Easy=organisation HQ. '
                                                                                  "Medium=India's position. "
                                                                                  'Hard=multi-actor geopolitics '
                                                                                  'analysis.',
                                                              'exam_pattern': 'Current-affairs heavy + concept. Traps: '
                                                                              "voting in UNSC, India's nuclear "
                                                                              'doctrine.',
                                                              'subtopics': [   "India's foreign policy",
                                                                               'SAARC, BRICS, G20',
                                                                               'India-USA, India-China, India-Pak '
                                                                               'relations',
                                                                               'UN and multilateral organisations',
                                                                               'Treaties and agreements',
                                                                               'Geopolitical hotspots']},
    'UPSC_CSE|General Studies 2|Polity': {   'difficulty_notes': 'Easy=body composition. Medium=procedural comparison. '
                                                                 'Hard=constitutional conflict analysis.',
                                             'exam_pattern': 'Statement-based procedural questions. Traps: President '
                                                             'vs Governor discretionary powers, ordinance '
                                                             'repromulgation.',
                                             'subtopics': [   'Parliament and state legislature',
                                                              'President and Governor (powers)',
                                                              'Cabinet and Council of Ministers',
                                                              'Judiciary (SC, HC, subordinate)',
                                                              'Federalism and Centre-State relations',
                                                              'Local self-government (73rd/74th amendment)']},
    'UPSC_CSE|General Studies 2|Social Justice': {   'difficulty_notes': 'Easy=scheme name. Medium=scheme comparison. '
                                                                         'Hard=policy evaluation + social outcome.',
                                                     'exam_pattern': 'Scheme + objective + beneficiary. Traps: scheme '
                                                                     'renaming, nodal ministry.',
                                                     'subtopics': [   'Poverty and welfare schemes',
                                                                      'Health policy',
                                                                      'Education policy',
                                                                      'Reservation and affirmative action',
                                                                      'Gender equality schemes',
                                                                      'Tribal welfare']},
    'UPSC_CSE|General Studies 3|Agriculture': {   'difficulty_notes': 'Easy=crop identification. Medium=scheme '
                                                                      'objective. Hard=agricultural reform analysis.',
                                                  'exam_pattern': 'Fact + policy. Traps: MSP vs MRP, crop-season '
                                                                  'mapping.',
                                                  'subtopics': [   'Cropping patterns (Kharif, Rabi, Zaid)',
                                                                   'Green Revolution',
                                                                   'Land reforms',
                                                                   'Agricultural marketing',
                                                                   'Food security schemes',
                                                                   'Irrigation types',
                                                                   'Organic farming']},
    'UPSC_CSE|General Studies 3|Disaster Management': {   'difficulty_notes': 'Easy=disaster type. Medium=framework '
                                                                              'objective. Hard=multi-hazard + policy '
                                                                              'analysis.',
                                                          'exam_pattern': 'Framework + mechanism. Traps: NDMA vs NDRF '
                                                                          'role, Sendai goals.',
                                                          'subtopics': [   'Natural disaster types',
                                                                           'NDMA and NDRF',
                                                                           'Sendai Framework',
                                                                           'Disaster risk reduction',
                                                                           'Early warning systems',
                                                                           'Post-disaster management']},
    'UPSC_CSE|General Studies 3|Environment & Ecology': {   'difficulty_notes': 'Easy=convention name. '
                                                                                'Medium=endangered species criteria. '
                                                                                'Hard=multi-convention + policy '
                                                                                'linkage.',
                                                            'exam_pattern': 'Statement-based + match. Traps: '
                                                                            'convention scope, critical tiger reserve '
                                                                            'vs wildlife sanctuary.',
                                                            'subtopics': [   'Biodiversity (hotspots, endemic species)',
                                                                             'Climate change (IPCC, Paris Agreement)',
                                                                             'Pollution types and control',
                                                                             'Environmental laws and bodies',
                                                                             'Wildlife protection',
                                                                             'International conventions (CITES, '
                                                                             'Ramsar, CBD)']},
    'UPSC_CSE|General Studies 3|Indian Economy': {   'difficulty_notes': 'Easy=definition. Medium=policy mechanism. '
                                                                         'Hard=macro linkage + data interpretation.',
                                                     'exam_pattern': 'Conceptual + data. Traps: GDP vs GNP vs NNP '
                                                                     'formulas, repo vs reverse repo, current vs '
                                                                     'capital account.',
                                                     'subtopics': [   'GDP, GNP, NNP measurement',
                                                                      'Fiscal policy and Union Budget',
                                                                      'Monetary policy and RBI',
                                                                      'Banking system',
                                                                      'Inflation types',
                                                                      'Five-Year Plans and NITI Aayog',
                                                                      'FDI and FII',
                                                                      'Balance of Payments']},
    'UPSC_CSE|General Studies 3|Internal Security': {   'difficulty_notes': 'Easy=agency role. Medium=security '
                                                                            'challenge analysis. Hard=multi-threat + '
                                                                            'policy response.',
                                                        'exam_pattern': 'Conceptual + current affairs. Traps: agency '
                                                                        'jurisdiction, cyber crime types.',
                                                        'subtopics': [   'Terrorism and counter-terrorism',
                                                                         'Left-wing extremism',
                                                                         'Border management',
                                                                         'Cyber security',
                                                                         'Money laundering',
                                                                         'Role of external agencies (RAW, IB)']},
    'UPSC_CSE|General Studies 3|Science & Technology': {   'difficulty_notes': 'Easy=mission name. Medium=technology '
                                                                               'application. Hard=policy + technology '
                                                                               'integration.',
                                                           'exam_pattern': 'Current-affairs linked. Traps: mission '
                                                                           'objectives, technology classification.',
                                                           'subtopics': [   'Space technology (ISRO missions)',
                                                                            'Defence technology (missiles, DRDO)',
                                                                            'Biotechnology',
                                                                            'Nanotechnology',
                                                                            'Cyber security',
                                                                            'Nuclear technology',
                                                                            'Recent innovations']},
    'UPSC_CSE|General Studies 4|Attitude': {   'difficulty_notes': 'Easy=attitude definition. Medium=attitude change '
                                                                   'mechanism. Hard=EI in conflict resolution.',
                                               'exam_pattern': 'Psychological concepts applied to administration. '
                                                               'Traps: attitude vs value distinction.',
                                               'subtopics': [   'Components of attitude (ABC model)',
                                                                'Attitude change',
                                                                'Emotional intelligence',
                                                                'Moral and political attitudes',
                                                                'Social influence']},
    'UPSC_CSE|General Studies 4|Case Studies': {   'difficulty_notes': 'Easy=identify stakeholders. Medium=list '
                                                                       'options. Hard=justify best decision with '
                                                                       'ethical reasoning.',
                                                   'exam_pattern': 'Open-ended case analysis. Traps: jumping to '
                                                                   'solution without stakeholder analysis.',
                                                   'subtopics': [   'Ethical dilemmas in public service',
                                                                    'Conflict of interest',
                                                                    'Whistleblowing',
                                                                    'Family vs duty conflict',
                                                                    'Corruption case analysis',
                                                                    'Gender + social bias in administration']},
    'UPSC_CSE|General Studies 4|Ethics Integrity': {   'difficulty_notes': 'Easy=theory definition. Medium=theory '
                                                                           'application. Hard=conflicting values case.',
                                                       'exam_pattern': 'Statement + justification. Traps: applying '
                                                                       'right ethical theory to scenario.',
                                                       'subtopics': [   'Ethical theories (consequentialism, '
                                                                        'deontology, virtue)',
                                                                        'Public service values',
                                                                        'Integrity and impartiality',
                                                                        'Objectivity and non-partisanship',
                                                                        'Probity in governance']}}

