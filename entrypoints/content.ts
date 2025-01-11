import wantedEmojis from './emoji.json';

export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		console.log('Content script running');
		document.addEventListener('keyup', handleKeyUpEvent);
	},
});

function handleKeyUpEvent() {
	const activeElement = document.activeElement;
	if (!activeElement) return;
	if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
		// Handle input or textarea
		const match = activeElement.value.match(/:(\w+):/);
		if (match) {
			if (match[1] in wantedEmojis) {
				const emoji = wantedEmojis[match[1] as keyof typeof wantedEmojis];
				const newText = activeElement.value.replace(`:${match[1]}:`, emoji);
				activeElement.value = newText;
				const newCaretPos = newText.indexOf(emoji) + emoji.length;
				// Set caret position
				activeElement.setSelectionRange(newCaretPos, newCaretPos);
			}
		}
	} else if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
		// Handle contenteditable elements
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return;
		const range = selection.getRangeAt(0);
		const textNode = range.startContainer;
		if (textNode.nodeType === Node.TEXT_NODE) {
			const oldText = textNode.textContent || '';
			const match = oldText.match(/:(\w+):/);
			if (match) {
				if (match[1] in wantedEmojis) {
					const emoji = wantedEmojis[match[1] as keyof typeof wantedEmojis];
					const newText = oldText.replace(`:${match[1]}:`, emoji);
					textNode.textContent = newText;
					// Move caret to after the emoji
					const newCaretPos = newText.indexOf(emoji) + emoji.length;
					range.setStart(textNode, newCaretPos);
					range.collapse(true);
					selection.removeAllRanges();
					selection.addRange(range);
				}
			}
		}
	}
}
