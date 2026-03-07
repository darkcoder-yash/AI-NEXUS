export class MemoryScoring {
    // Simple rule-based sentiment analysis
    static estimateSentiment(text) {
        const positiveWords = ['happy', 'great', 'awesome', 'excellent', 'thanks', 'thank', 'love', 'perfect'];
        const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'error', 'failed', 'wrong', 'allergic'];
        const lowerText = text.toLowerCase();
        let score = 0;
        positiveWords.forEach(word => { if (lowerText.includes(word))
            score++; });
        negativeWords.forEach(word => { if (lowerText.includes(word))
            score--; });
        if (score > 0)
            return 'positive';
        if (score < 0)
            return 'negative';
        return 'neutral';
    }
    // Detect simple topics based on keywords
    static detectTopic(text) {
        const topics = {
            health: ['allergic', 'medicine', 'doctor', 'pain', 'workout'],
            project: ['code', 'build', 'deadline', 'task', 'feature'],
            preference: ['prefer', 'like', 'dislike', 'favorite', 'want'],
            emotion: ['feel', 'happy', 'sad', 'angry', 'upset']
        };
        const lowerText = text.toLowerCase();
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return topic;
            }
        }
        return 'general';
    }
    // Filtering logic: Should we store this memory?
    static shouldStore(userPrompt, aiResponse) {
        const combined = (userPrompt + ' ' + aiResponse).toLowerCase();
        // Rule 1: Ignore trivial greetings
        const greetings = ['hi', 'hello', 'hey', 'yo', 'greetings'];
        if (greetings.includes(userPrompt.trim().toLowerCase()) && aiResponse.length < 50) {
            return false;
        }
        // Rule 2: Ignore one-word/very short responses
        if (userPrompt.split(' ').length <= 2 && aiResponse.split(' ').length <= 5) {
            return false;
        }
        // Rule 3: Always store if it contains key triggers
        const triggers = ['prefer', 'allergic', 'remember', 'decided', 'project', 'deadline', 'goal'];
        if (triggers.some(t => combined.includes(t))) {
            return true;
        }
        // Rule 4: Store if AI response is substantial/informative
        if (aiResponse.length > 150) {
            return true;
        }
        return false;
    }
}
