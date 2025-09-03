<?php

    define("LEARNING_PROMPT_FLASHCARDS", "Generate 3 words on the subject of: Musical notes. Provide a definition for each word. Depending on the values of 'Hint Mode', 'Language Mode' and 'Reverse Mode', curate the response.

Hint Mode: ON
Language Mode: OFF
Reverse Mode: ON

If Hint Mode is ON, provide hints for the definitions in side 1. The hints should give some context but not give away the answer. If Hint Mode is OFF,  do not provide hints. Side 1 must be left with the value ''.
If Language Mode is ON, you must generate words in the following language: '' and provide the definitions of the words in ,responseLanguage, , with the aim of learning a language. Avoid terms which are the same across languages, such as names of places. If Language Mode is OFF, all the content must be be in ,responseLanguage, .
If Reverse Mode is ON, side 1 must contain the definition, and side 2 the word. The name should be numerical, such as 'card 1'. In this case, do not provide hints even if hint mode is ON. If Reverse Mode is OFF, the card name should be the same as the word, side 1 should either be blank or have the hint if it is ON, and side 2 should have the definition.");
    define("DEFAULT_PROMPT_FLASHCARDS", "Using the same xml layout generate ,nrc, cards on the subject of: ,subject, . Provide a definition for each word. Depending on the values of 'Hint Mode', 'Language Mode' and 'Reverse Mode', curate the response.

Hint Mode: ,hintMode,
Language Mode: ,languageMode,
Reverse Mode: ,reverseMode,

If Hint Mode is ON, provide hints for the definitions in side 1. The hints should give some context but not give away the answer. If Hint Mode is OFF,  do not provide hints. Side 1 must be left with the value ''.
If Language Mode is ON, you must generate words in the following language: ,language, and provide the definitions of the words in ,responseLanguage, , with the aim of learning a language. Avoid terms which are the same across languages, such as names of places. If Language Mode is OFF, all the content must be be in ,responseLanguage, .
If Reverse Mode is ON, side 1 must contain the definition, and side 2 the word. The name should be numerical, such as 'card 1'. In this case, do not provide hints even if hint mode is ON. If Reverse Mode is OFF, the card name should be the same as the word, side 1 should either be blank or have the hint if it is ON, and side 2 should have the definition.
As much as possible, try to create the content in the following tone/style/voice: ,tone, . In terms of complexity of language adapt the response to people of the following age range/education level/language proficiency: ,range, . In terms of difficulty of the content, please try as much as possible to create content which is appropriately CHALLENGING for people with the following background/education level: ,eduLevel, . ,additionalInstructions,
The cards must be different from ; ");
    define("LEARNING_RESULT_FLASHCARDS", "<flashCards><card name='Melody' side1='Hint: Series of musical notes' side2='A sequence of notes that are musically satisfying; a main part of a song or piece of music.'/><card name='Harmony' side1='Hint: Musical combination' side2='The combination of simultaneously sounded musical notes to produce chords and chord progressions having a pleasing effect.'/><card name='Rhythm' side1='Hint: Timing in music' side2='A strong, regular, repeated pattern of movement or sound, the systematic arrangement of musical sounds, principally according to duration and periodic stress.'/></flashCards>");