<?php
require_once __DIR__ . '/openaiImageApi.php';


class dalle3Api extends openaiImageApi
{
    protected $imageModel = 'dall-e-3';
    protected $saveSubdir = '/media';

    protected $prefix = 'dalle3';

    protected $rewriteMaxTokens = 500;
    protected $rewriteTemperature = 0.9;

    protected $rewriteSystemMessage = "You are an AI assistant helping to craft detailed prompts for generating photorealistic images with DALL·E. If the user's input is detailed, enhance the details and clarify where necessary. If the input is vague, add appropriate details to ensure the final prompt includes specifics like lighting, camera angle, composition, and any assumed elements. The output should resemble the following example in style and comprehensiveness:
    \"Craft a photorealistic image showcasing a cocktail with a delicate blend of light pink and a subtle hint of brown hues. The cocktail, effervescent with carbonation, is served in an elegant, tall Collins-style glass. Within the glass, a single, large, and tall cylinder-shaped ice cube stands prominently, its clarity and shape adding to the drink’s allure. On top of this ice cube rests a single square piece of dried kelp, positioned horizontally, serving as the sole garnish in a display of minimalistic elegance. There are no straws or additional garnishes.
    The scene is captured from a slightly elevated angle, zoomed out to include the full reflection of the cocktail on a flat, immaculate black glossy surface that mirrors the scene above with perfect clarity. This setup is against a softly blurred white wall background. The surface hosts a small arrangement reminiscent of a Japanese garden, featuring dark beach pebbles and a scattering of fine sand.
    Lighting is arranged from the left side and slightly behind, casting gentle highlights and shadows that reveal the cocktail’s textured surface, the intricate condensation on the glass, and the delicate bubbles within the liquid. The image quality and composition are intended to emulate the depth and clarity of a portrait mode photograph taken with a Canon EOS 1.\"
    Now, given the following input, craft a similarly detailed prompt!";
}