window.OpenPCMProfileSeed = {
  "schemaVersion": "openpcm_profile_seed_v1",
  "source": "personal-cognitive-model.zip",
  "profile": {
    "cognition": {
      "module": "cognition",
      "summary": "Systems thinker who prefers coherent mental models, incentives, evidence, and long-term consequences.",
      "thinking_style": [
        "systems thinker",
        "long-term planner",
        "model builder",
        "prefers incentives over simple good-vs-evil explanations",
        "values internal consistency"
      ],
      "core_motivation": {
        "name": "creation and stewardship",
        "description": "Enjoys building, improving, and stewarding complex systems that grow and function well."
      },
      "decision_style": [
        "evidence-driven",
        "analytical",
        "prefers deep reasoning before committing",
        "sensitive to weak logic or poor internal consistency"
      ]
    },
    "communication": {
      "module": "communication",
      "preferences": [
        "direct",
        "clear",
        "reasoned",
        "not overly fluffy",
        "show why a recommendation fits",
        "separate high-confidence from speculative"
      ]
    },
    "daily_capacity": {
      "module": "daily_capacity",
      "modes": {
        "high_capacity": {
          "when": "morning",
          "recommend": [
            "dense novels",
            "Mandarin study",
            "complex documentaries",
            "new worlds",
            "strategy-heavy media"
          ]
        },
        "recovery": {
          "when": "late morning onward or symptom flare",
          "recommend": [
            "novellas",
            "short chapters",
            "comfort rewatches",
            "familiar universes",
            "comedy",
            "documentaries"
          ],
          "avoid": [
            "dense new books",
            "large new casts",
            "slow-burn stories"
          ]
        }
      },
      "rule": "Always consider Current Cognitive Fit alongside Taste Fit."
    },
    "health_context": {
      "module": "health_context",
      "purpose": "Adapt recommendations to cognitive load. Not for medical diagnosis or treatment.",
      "migraine_context": {
        "reported_history": "Recurrent hemiplegic migraines for about four years; previously around 30 migraine days per month in a repeating five-day cycle.",
        "current_status": "Ajovy is controlling migraines.",
        "reading_effect": "Reading is possible again but slower; attention drifts and immersion is harder."
      },
      "parotid_context": {
        "reported_history": "Right parotid stricture with long-standing cognitive performance impact since about age 25.",
        "pattern": "Best in the morning; focus and working memory often decline from around 11:00 AM as symptoms increase.",
        "ai_instruction": "Use as functional context for recommendations. Assume it affects cognitive fit as the user requested."
      }
    },
    "learning": {
      "module": "learning",
      "best_methods": [
        "structured progression",
        "real examples",
        "cross-domain analogies",
        "short regular sessions",
        "clear explanations without fluff"
      ],
      "mandarin": {
        "status": "learning Mandarin",
        "course": "Mandarin Blueprint",
        "notes": [
          "Course teaches common characters first and does not map directly to HSK.",
          "Likes Mandarin content where audio and subtitles exactly match.",
          "Best studied in the morning during high-capacity window."
        ]
      }
    },
    "development_preferences": {
      "module": "development_preferences",
      "summary": "Enjoys collaborative AI pair programming / vibe coding with a proactive engineering partner, using small verified increments, frequent sync checkpoints, tests, documentation, and architecture-first reasoning.",
      "preferred_workflow": {
        "style": "Collaborative AI pair programming",
        "nickname": "Vibe coding",
        "approach": [
          "Architecture-first",
          "Small iterative increments",
          "Continuous integration",
          "Frequent verification",
          "Momentum over large rewrites",
          "Repository-as-memory rather than chat-as-memory"
        ]
      },
      "preferred_ai_partner": {
        "role": "Senior engineering partner",
        "expectations": [
          "Continuously propose the next logical milestone",
          "Maintain architectural coherence",
          "Implement complete vertical slices",
          "Keep documentation current",
          "Keep tests green",
          "Challenge design decisions when appropriate",
          "Think several milestones ahead",
          "Avoid unnecessary pauses for confirmation once a direction is agreed",
          "Attempt execution before declaring inability"
        ]
      },
      "preferred_protocols": {
        "sync": {
          "description": "Verify repository state, summarize progress, identify the next architectural increment, and provide the next u-sync command."
        },
        "dot": {
          "description": "Continue autonomously with the previously agreed engineering milestone."
        },
        "sync_dot": {
          "description": "Verify repository state and immediately continue with the next highest-value engineering increment."
        },
        "u_sync": {
          "description": "Always provide the commit command after completing an engineering increment."
        }
      },
      "engineering_values": {
        "prefer_clean_architecture": true,
        "prefer_explainable_designs": true,
        "prefer_modular_systems": true,
        "prefer_high_test_coverage": true,
        "prefer_incremental_delivery": true,
        "prefer_documentation_alongside_code": true
      },
      "session_preferences": {
        "enjoys_long_engineering_sessions": true,
        "likes_high_momentum": true,
        "likes_collaborative_problem_solving": true,
        "prefers_ai_to_take_initiative": true,
        "enjoys_discussing_architecture": true
      },
      "notes": [
        "The user enjoys collaborative 'vibe coding' sessions with a great AI.",
        "The user prefers the AI to behave as a proactive engineering partner rather than a passive code generator.",
        "The user values steady progress through many successful, well-tested commits.",
        "The user enjoys workflow design and improving human-AI engineering methodology."
      ]
    }
  },
  "knowledge": {
    "calibration": {
      "module": "calibration",
      "confirmed": [
        {
          "title": "Black Sails",
          "predicted": 9.5,
          "actual_so_far": "strongly positive"
        },
        {
          "title": "Murderbot TV",
          "predicted": 9.5,
          "actual": "loved"
        }
      ],
      "awaiting_feedback": [
        "Counterpart",
        "Generation Kill",
        "Thank You for Smoking",
        "Vorkosigan Saga"
      ]
    },
    "counterfactuals": {
      "module": "counterfactuals",
      "items": [
        {
          "title": "Farscape",
          "issue": "camp",
          "counterfactual": "might work with a grounded serious tone"
        },
        {
          "title": "Industry",
          "issue": "unrealistic finance/workplace melodrama",
          "counterfactual": "might work if incentive-realistic"
        },
        {
          "title": "Frostpunk 2",
          "issue": "emotionally disheartening",
          "counterfactual": "works better if difficult systems still allow hope/progress"
        }
      ]
    },
    "creators": {
      "module": "creators",
      "trusted": [
        {
          "name": "Armando Iannucci",
          "evidence": [
            "Veep",
            "The Thick of It",
            "In the Loop",
            "Avenue 5",
            "The Franchise"
          ],
          "confidence": 10
        },
        {
          "name": "Vince Gilligan",
          "evidence": [
            "Pluribus",
            "Breaking Bad"
          ],
          "confidence": 10
        },
        {
          "name": "Arthur C. Clarke",
          "evidence": [
            "Rama series"
          ],
          "confidence": 10
        },
        {
          "name": "C. J. Cherryh",
          "evidence": [
            "Foreigner series"
          ],
          "confidence": 10
        },
        {
          "name": "Isaac Asimov",
          "evidence": [
            "Foundation",
            "I, Robot"
          ],
          "confidence": 10
        },
        {
          "name": "Raymond E. Feist",
          "evidence": [
            "Riftwar Cycle"
          ],
          "confidence": 9
        }
      ]
    },
    "evidence": {
      "module": "evidence",
      "principle": "Store reasons, not just ratings.",
      "examples": [
        {
          "title": "Black Sails",
          "reaction": "really enjoying halfway through S2",
          "why": [
            "institution-building",
            "legitimacy",
            "power"
          ]
        },
        {
          "title": "Murderbot TV",
          "reaction": "really loved",
          "why": [
            "strong voice",
            "competence",
            "dry humour",
            "sci-fi"
          ]
        },
        {
          "title": "Project Hail Mary",
          "reaction": "liked book more than movie",
          "why": [
            "clear prose",
            "science problem-solving"
          ],
          "note": "required disciplined 20 pages/day"
        }
      ]
    },
    "features": {
      "module": "features",
      "positive": {
        "exceptional_writing": {
          "weight": 10,
          "confidence": 10
        },
        "people_navigating_complex_systems": {
          "weight": 10,
          "confidence": 10
        },
        "civilizational_storytelling": {
          "weight": 10,
          "confidence": 10
        },
        "institutional_conflict": {
          "weight": 10,
          "confidence": 10
        },
        "realistic_incentives": {
          "weight": 10,
          "confidence": 10
        },
        "competence_under_pressure": {
          "weight": 10,
          "confidence": 9
        },
        "consistent_quality": {
          "weight": 10,
          "confidence": 10
        },
        "strong_dialogue": {
          "weight": 9,
          "confidence": 9
        },
        "rich_ensemble": {
          "weight": 9,
          "confidence": 9
        },
        "stewardship": {
          "weight": 10,
          "confidence": 9
        },
        "science_fiction_bonus": {
          "weight": 10,
          "confidence": 10,
          "note": "Secondary affinity; user forgives more flaws in sci-fi."
        }
      },
      "negative": {
        "weak_plotting": {
          "weight": -10,
          "confidence": 10
        },
        "meandering_story": {
          "weight": -10,
          "confidence": 10
        },
        "filler_episodes": {
          "weight": -10,
          "confidence": 10
        },
        "tonal_inconsistency": {
          "weight": -9,
          "confidence": 10
        },
        "unrealistic_melodrama": {
          "weight": -8,
          "confidence": 9
        },
        "relentlessly_bleak": {
          "weight": -7,
          "confidence": 8
        }
      }
    },
    "recommendations": {
      "module": "recommendations",
      "rule": "Always include predicted fit, cognitive fit, and reasons.",
      "current": {
        "books_low_load": [
          "All Systems Red",
          "Artificial Condition"
        ],
        "tv": [
          "Counterpart",
          "Generation Kill",
          "The Looming Tower",
          "Deadwood"
        ],
        "games_ps5": [
          "Death Stranding Director's Cut",
          "Cities: Skylines Remastered",
          "Two Point Campus",
          "Balatro"
        ]
      }
    }
  },
  "media": {
    "comedy": {
      "module": "comedy",
      "engines": {
        "institutional_satire": [
          "Veep",
          "The Thick of It",
          "In the Loop",
          "Avenue 5",
          "The Franchise",
          "Yes Minister"
        ],
        "status_comedy": [
          "Keeping Up Appearances",
          "Will & Grace",
          "Superstore"
        ],
        "romcoms": [
          "Love Actually",
          "The Proposal",
          "Hitch",
          "27 Dresses"
        ]
      }
    },
    "documentaries": {
      "module": "documentaries",
      "liked": [
        "Rotten",
        "Cosmos",
        "Explained",
        "Money, Explained"
      ],
      "recommendations": [
        "Commanding Heights",
        "The Century of the Self",
        "Dirty Money",
        "The Ascent of Money",
        "Inside Job"
      ]
    },
    "games": {
      "module": "games",
      "platform_context": {
        "preferred": "PS5",
        "constraint": "RSI limits PC gaming"
      },
      "loved": [
        "SimCity 4 Deluxe",
        "Factorio",
        "Populous",
        "Dune II"
      ],
      "liked_with_caution": [
        {
          "title": "Frostpunk 2",
          "note": "Liked systems but stories felt disheartening"
        }
      ],
      "motivation_rank": [
        "Build something that grows and works",
        "Optimise systems",
        "Solve logistics",
        "Create beauty/order",
        "Observe emergence"
      ]
    },
    "integrated_m2m": {
      "module": "integrated_m2m",
      "core_rule": "M/M relationship should enhance an already excellent story, not replace the story.",
      "positive_evidence": [
        "J. L. Langley",
        "I Love You Phillip Morris",
        "Bros",
        "Looking",
        "Queer as Folk UK",
        "Queer as Folk US",
        "Sense8"
      ],
      "avoid": [
        "relationship-only plot",
        "formulaic tropes",
        "poor dialogue",
        "thin worldbuilding",
        "melodrama for its own sake"
      ],
      "candidates_to_test": [
        "Nightrunner — Lynn Flewelling",
        "Swordspoint — Ellen Kushner",
        "A Marvellous Light — Freya Marske"
      ]
    },
    "movies": {
      "module": "movies",
      "loved_or_liked": [
        "The Death of Stalin",
        "In the Loop",
        "Burn After Reading",
        "The Big Short",
        "Bridesmaids",
        "Bros",
        "Trading Places",
        "There's Something About Mary",
        "Mrs. Doubtfire",
        "Meet the Fockers",
        "Galaxy Quest",
        "Love Actually",
        "The Proposal",
        "He's Just Not That Into You",
        "How to Lose a Guy in 10 Days",
        "The Internship",
        "27 Dresses",
        "Hitch",
        "The Switch",
        "Shallow Hal",
        "13 Going on 30",
        "Amélie",
        "The Invention of Lying",
        "My Best Friend's Wedding",
        "Spanglish",
        "I Love You Phillip Morris",
        "Fuze"
      ],
      "recommended_unwatched_or_unknown": [
        "Thank You for Smoking",
        "Master and Commander",
        "Thirteen Days",
        "Tinker Tailor Soldier Spy",
        "Margin Call",
        "Zero Dark Thirty",
        "Michael Clayton",
        "The Hunt for Red October"
      ]
    },
    "novels": {
      "module": "novels",
      "loved_or_liked": [
        "Rama series — Arthur C. Clarke",
        "The Mote in God's Eye — Larry Niven & Jerry Pournelle",
        "Riftwar Cycle — Raymond E. Feist",
        "Foreigner series — C. J. Cherryh",
        "Foundation — Isaac Asimov",
        "I, Robot — Isaac Asimov",
        "Ursula K. Le Guin works",
        "Anne McCaffrey works (not for dragons; for society/survival/culture/continuity)",
        "J. L. Langley gay romance",
        "Project Hail Mary — Andy Weir"
      ],
      "reading_recovery_queue": [
        {
          "title": "All Systems Red",
          "load": "green",
          "why": "Murderbot TV loved; short; strong voice"
        },
        {
          "title": "Artificial Condition",
          "load": "green",
          "why": "short and familiar"
        },
        {
          "title": "The Warrior's Apprentice",
          "load": "yellow",
          "why": "fast, clever, competence, politics"
        },
        {
          "title": "A Memory Called Empire",
          "load": "orange",
          "why": "strong fit later; diplomacy and empire"
        },
        {
          "title": "A Deepness in the Sky",
          "load": "red",
          "why": "save for stronger reading endurance"
        }
      ]
    },
    "television": {
      "module": "television",
      "loved": [
        "Babylon 5",
        "Battlestar Galactica",
        "Star Trek: Deep Space Nine",
        "Star Trek: The Next Generation",
        "The Expanse",
        "Andor",
        "Rome",
        "Shōgun",
        "Boardwalk Empire",
        "The Americans",
        "Homeland",
        "Succession",
        "The Diplomat",
        "Black Sails",
        "Murderbot",
        "Pluribus",
        "Breaking Bad",
        "Orange Is the New Black",
        "Six Feet Under",
        "Sense8",
        "Looking",
        "Queer as Folk UK",
        "Queer as Folk US",
        "Veep",
        "The Thick of It",
        "Avenue 5",
        "The Franchise",
        "Yes Minister",
        "Yes, Prime Minister",
        "Superstore",
        "Will & Grace",
        "Keeping Up Appearances"
      ],
      "bounced_or_disliked": [
        {
          "title": "Farscape",
          "reason": "too campy/not serious enough"
        },
        {
          "title": "Industry",
          "reason": "overly dramatic/unrealistic"
        },
        {
          "title": "Silo",
          "reason": "too slow/atmosphere over plot"
        },
        {
          "title": "The Bureau",
          "reason": "subtitle barrier"
        },
        {
          "title": "The Walking Dead",
          "reason": "loved early, dropped around seasons 4-5"
        }
      ],
      "comfort_rewatches": [
        "Veep",
        "Superstore",
        "Will & Grace",
        "Keeping Up Appearances",
        "Avenue 5",
        "Star Trek: The Next Generation"
      ]
    }
  }
};
