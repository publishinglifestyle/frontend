export function formatMessageText() {
    const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    const newLineFormatted = boldFormatted.replace(/\n/g, '<br>');
    return newLineFormatted;
}
