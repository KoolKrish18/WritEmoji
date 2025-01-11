import wantedEmojis from './emoji.json';

export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		console.log('Content script running');

		document.addEventListener('keyup', (event) => {
			const activeElement = document.activeElement;

			if (!activeElement) return;

			if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
				// Handle input or textarea
				const inputElement = activeElement;
				const text = inputElement.value; // Current value

				const match = text.match(/:(\w+):/);
				if (match) {
					console.log('Detected text:', match[0]);
					const word = match[1];
					if (word in wantedEmojis) {
						const emoji = wantedEmojis[word as keyof typeof wantedEmojis];
						const newText = text.replace(`:${word}:`, emoji);

						inputElement.value = newText;
						const newCaretPos = newText.indexOf(emoji) + emoji.length;

						// Set caret position
						inputElement.setSelectionRange(newCaretPos, newCaretPos);
					}
				}
			} else if (activeElement instanceof HTMLElement && activeElement.isContentEditable) {
				// Handle contenteditable elements
				const selection = window.getSelection();
				if (!selection || selection.rangeCount === 0) return;

				const range = selection.getRangeAt(0);
				const textNode = range.startContainer;

				if (textNode.nodeType === Node.TEXT_NODE) {
					const text = textNode.textContent || '';

					const match = text.match(/:(\w+):/);
					if (match) {
						console.log('Detected text:', match[0]);
						const word = match[1];
						if (word in wantedEmojis) {
							const emoji = wantedEmojis[word as keyof typeof wantedEmojis];
							const newText = text.replace(`:${word}:`, emoji);

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
		});
	},
});
