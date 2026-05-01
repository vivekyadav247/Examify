# Examify topic graph — subject/topic mapping for all supported exams
# Topic descriptions for AI context are in engines/topic_descriptions.py


EXAM_SUBJECTS = {
    "JEE_Mains": {
        "Physics": [
            "Units & Measurement",
            "Kinematics",
            "Laws of Motion",
            "Work Energy Power",
            "Rotational Motion",
            "Gravitation",
            "Thermodynamics",
            "Waves",
            "Electrostatics",
            "Current Electricity",
            "Magnetism",
            "Optics",
            "Modern Physics",
        ],
        "Chemistry": [
            "Mole Concept",
            "Atomic Structure",
            "Chemical Bonding",
            "States of Matter",
            "Thermodynamics",
            "Equilibrium",
            "Electrochemistry",
            "Organic Basics",
            "Hydrocarbons",
            "Biomolecules",
            "Polymers",
        ],
        "Mathematics": [
            "Sets & Relations",
            "Trigonometry",
            "Complex Numbers",
            "Matrices",
            "Permutations",
            "Binomial Theorem",
            "Sequences",
            "Limits",
            "Differentiation",
            "Integration",
            "Differential Equations",
            "Coordinate Geometry",
            "Vectors",
            "3D Geometry",
            "Probability",
            "Statistics",
        ],
    },
    "UPSC_CSE": {
        "General Studies 1": [
            "History of India",
            "Indian Culture",
            "World History",
            "Indian Society",
            "Geography of India",
            "World Geography",
        ],
        "General Studies 2": [
            "Indian Constitution",
            "Polity",
            "Governance",
            "International Relations",
            "Social Justice",
        ],
        "General Studies 3": [
            "Indian Economy",
            "Agriculture",
            "Science & Technology",
            "Environment & Ecology",
            "Disaster Management",
            "Internal Security",
        ],
        "General Studies 4": [
            "Ethics Integrity",
            "Attitude",
            "Case Studies",
        ],
        "CSAT": [
            "Reading Comprehension",
            "Interpersonal Skills",
            "Logical Reasoning",
            "Analytical Ability",
            "Data Interpretation",
            "Basic Numeracy",
        ],
    },
    "NDA": {
        "Mathematics": [
            "Algebra", "Matrices & Determinants", "Trigonometry", 
            "Analytical Geometry 2D/3D", "Differential Calculus", 
            "Integral Calculus", "Vector Algebra", "Statistics & Probability"
        ],
        "General Ability Test": [
            "English Grammar", "Vocabulary", "Physics", "Chemistry", 
            "General Science", "History & Freedom Movement", 
            "Geography", "Current Events"
        ]
    },
    "CAT": {
        "Verbal Ability": [
            "Reading Comprehension",
            "Para Jumbles",
            "Para Summary",
            "Odd Sentence Out",
            "Fill in the Blanks",
        ],
        "DILR": [
            "Data Interpretation Sets",
            "Logical Reasoning Sets",
            "Arrangements",
            "Games & Tournaments",
            "Networks & Routes",
        ],
        "Quantitative Ability": [
            "Arithmetic",
            "Algebra",
            "Geometry",
            "Number System",
            "Modern Maths",
        ],
    },
    "GATE": {
        "Engineering Mathematics": [
            "Linear Algebra",
            "Calculus",
            "Probability",
            "Discrete Math",
            "Numerical Methods",
        ],
        "Core CS": [
            "Algorithms",
            "Data Structures",
            "DBMS",
            "Operating Systems",
            "Computer Networks",
            "TOC",
            "Compiler Design",
            "Digital Logic",
            "Computer Organization",
            "Software Engineering",
        ],
    },
    "GRE": {
        "Verbal Reasoning": [
            "Text Completion",
            "Sentence Equivalence",
            "Reading Comprehension",
            "Vocabulary",
        ],
        "Quantitative Reasoning": [
            "Arithmetic",
            "Algebra",
            "Geometry",
            "Data Analysis",
        ],
        "Analytical Writing": [
            "Issue Essay",
            "Argument Essay",
        ],
    },
    "NEET": {
        "Physics": [
            "Mechanics",
            "Thermodynamics",
            "Electrostatics",
            "Current Electricity",
            "Magnetism",
            "Optics",
            "Modern Physics",
            "Waves",
        ],
        "Chemistry": [
            "Physical Chemistry",
            "Organic Chemistry",
            "Inorganic Chemistry",
            "Mole Concept",
            "Chemical Bonding",
            "Electrochemistry",
            "Coordination Compounds",
        ],
        "Botany": [
            "Cell Biology",
            "Plant Physiology",
            "Plant Morphology",
            "Plant Anatomy",
            "Genetics",
            "Ecology",
            "Plant Reproduction",
            "Biotechnology",
        ],
        "Zoology": [
            "Human Physiology",
            "Animal Kingdom",
            "Structural Organisation",
            "Evolution",
            "Human Reproduction",
            "Human Health and Disease",
            "Biomolecules",
        ],
    },
    "SSC_CGL": {
        "General Intelligence": [
            "Analogies",
            "Classification",
            "Series",
            "Coding Decoding",
            "Non Verbal Reasoning",
        ],
        "Quantitative Aptitude": [
            "Number System",
            "Algebra",
            "Geometry",
            "Mensuration",
            "Data Interpretation",
        ],
        "English Comprehension": [
            "Vocabulary",
            "Grammar",
            "Reading Comprehension",
            "Cloze Test",
        ],
        "General Awareness": [
            "Current Affairs",
            "History",
            "Geography",
            "Polity",
            "Science",
        ],
    },
    "GMAT": {
        "Quantitative": [
            "Arithmetic",
            "Algebra",
            "Geometry",
            "Word Problems",
        ],
        "Verbal": [
            "Reading Comprehension",
            "Critical Reasoning",
            "Sentence Correction",
        ],
        "Integrated Reasoning": [
            "Graphics Interpretation",
            "Multi Source Reasoning",
            "Two Part Analysis",
            "Table Analysis",
        ],
        "Analytical Writing": [
            "Argument Essay",
        ],
    },
    "SAT": {
        "Reading": [
            "Passage Interpretation",
            "Vocabulary in Context",
            "Evidence Support",
        ],
        "Writing and Language": [
            "Grammar",
            "Expression of Ideas",
            "Sentence Structure",
        ],
        "Math": [
            "Heart of Algebra",
            "Problem Solving and Data Analysis",
            "Passport to Advanced Math",
            "Additional Topics",
        ],
    },
    "CUET": {
        "General Test": [
            "General Knowledge",
            "Current Affairs",
            "General Mental Ability",
            "Numerical Ability",
            "Logical and Analytical Reasoning",
        ],
        "Physics": [
            "Electrostatics",
            "Current Electricity",
            "Magnetic Effects of Current",
            "Electromagnetic Induction",
            "Optics",
            "Modern Physics",
        ],
        "Chemistry": [
            "Physical Chemistry",
            "Organic Chemistry",
            "Inorganic Chemistry",
            "Chemical Kinetics",
        ],
        "Mathematics": [
            "Algebra",
            "Calculus",
            "Differential Equations",
            "Probability Distributions",
        ],
        "Biology": [
            "Reproduction",
            "Genetics and Evolution",
            "Biology and Human Welfare",
            "Biotechnology",
            "Ecology and Environment",
        ],
    },
}


def _slugify(value):
    cleaned = []
    previous_underscore = False
    for char in value.lower():
        if char.isalnum():
            cleaned.append(char)
            previous_underscore = False
        elif char in {" ", "-", "_", "/", "&"}:
            if not previous_underscore:
                cleaned.append("_")
                previous_underscore = True
        else:
            if not previous_underscore:
                cleaned.append("_")
                previous_underscore = True

    slug = "".join(cleaned).strip("_")
    while "__" in slug:
        slug = slug.replace("__", "_")
    return slug


def get_exam_subjects(exam_target):
    return EXAM_SUBJECTS.get(exam_target, {})


def build_topic_graph(exam_target):
    subjects = get_exam_subjects(exam_target)
    nodes = []
    columns = 6
    index = 0

    for subject, topics in subjects.items():
        previous_slug = None
        for topic_index, topic_name in enumerate(topics):
            slug = _slugify(topic_name)
            row = index // columns
            col = index % columns
            x = col if row % 2 == 0 else (columns - 1 - col)
            y = row

            if topic_index < 3:
                level_required = 1
            elif topic_index < 6:
                level_required = 2
            else:
                level_required = 3

            prerequisites = [previous_slug] if previous_slug else []
            nodes.append(
                {
                    "id": slug,
                    "name": topic_name,
                    "subject": subject,
                    "x": x,
                    "y": y,
                    "prerequisites": prerequisites,
                    "level_required": level_required,
                }
            )

            previous_slug = slug
            index += 1

    return nodes


def get_topic_unlock_status(topic_graph, user_profiles):
    profiles = user_profiles or {}
    profile_by_slug = {}
    user_level = 1

    for topic_name, profile in profiles.items():
        profile_by_slug[_slugify(topic_name)] = profile
        if hasattr(profile, "user") and getattr(profile.user, "level", None) is not None:
            user_level = profile.user.level

    enriched = []
    for node in topic_graph or []:
        profile = profile_by_slug.get(node["id"])
        if profile:
            ability_score = getattr(profile, "ability_score", 0.0)
            stars = getattr(profile, "stars", 0)
            is_flagged = getattr(profile, "is_flagged_complete", False)
        else:
            ability_score = 0.0
            stars = 0
            is_flagged = False

        prerequisites_met = True
        for prereq in node.get("prerequisites", []):
            prereq_profile = profile_by_slug.get(prereq)
            if not prereq_profile or not getattr(prereq_profile, "is_flagged_complete", False):
                prerequisites_met = False
                break

        is_unlocked = prerequisites_met or node.get("level_required", 1) <= user_level

        enriched.append(
            {
                **node,
                "is_unlocked": is_unlocked,
                "ability_score": ability_score,
                "stars": stars,
                "is_flagged": is_flagged,
            }
        )

    return enriched


def _chunk_topics(topics, chunk_size=4):
    chunks = []
    for index in range(0, len(topics), chunk_size):
        chunks.append(topics[index : index + chunk_size])
    return chunks


def build_vertical_plan_graph(exam_target, user_profiles=None):
    """Build hierarchical vertical plan graph: exam -> subject -> chapter -> topic.

    Chapters are derived from syllabus ordering in fixed-size groups to keep
    vertical progression clear and stable for premium users.
    """
    subjects = get_exam_subjects(exam_target)
    profiles = user_profiles or {}
    profile_by_slug = {_slugify(name): profile for name, profile in profiles.items()}

    subject_nodes = []
    chapter_nodes = []
    topic_nodes = []
    edges = []

    lane_x = 0
    for subject, topics in subjects.items():
        subject_id = f"subject_{_slugify(subject)}"
        subject_nodes.append(
            {
                "id": subject_id,
                "name": subject,
                "type": "subject",
                "x": lane_x,
                "y": 0,
            }
        )

        chapters = _chunk_topics(topics, chunk_size=4)
        last_topic_id = None
        for chapter_index, chapter_topics in enumerate(chapters, start=1):
            chapter_id = f"{subject_id}_chapter_{chapter_index}"
            chapter_nodes.append(
                {
                    "id": chapter_id,
                    "name": f"Chapter {chapter_index}",
                    "type": "chapter",
                    "subject": subject,
                    "x": lane_x,
                    "y": chapter_index,
                }
            )
            edges.append({"from": subject_id, "to": chapter_id, "type": "contains"})

            for topic_offset, topic_name in enumerate(chapter_topics):
                topic_slug = _slugify(topic_name)
                topic_id = f"topic_{topic_slug}"
                profile = profile_by_slug.get(topic_slug)
                topic_nodes.append(
                    {
                        "id": topic_id,
                        "name": topic_name,
                        "type": "topic",
                        "subject": subject,
                        "chapter": chapter_id,
                        "x": lane_x,
                        "y": chapter_index + (topic_offset + 1) * 0.18,
                        "ability_score": float(getattr(profile, "ability_score", 0.0)),
                        "stars": int(getattr(profile, "stars", 0)),
                        "is_flagged": bool(getattr(profile, "is_flagged_complete", False)),
                        "attempts": int(getattr(profile, "total_attempts", 0)),
                        "accuracy_pct": float(getattr(profile, "accuracy_pct", 0.0)),
                        "is_unlocked": bool(getattr(profile, "is_unlocked", chapter_index == 1)),
                    }
                )
                edges.append({"from": chapter_id, "to": topic_id, "type": "contains"})
                if last_topic_id:
                    edges.append({"from": last_topic_id, "to": topic_id, "type": "progression"})
                last_topic_id = topic_id
        lane_x += 1

    return {
        "exam_target": exam_target,
        "subjects": subject_nodes,
        "chapters": chapter_nodes,
        "topics": topic_nodes,
        "edges": edges,
    }