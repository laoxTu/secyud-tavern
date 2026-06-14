const inputFields = document.createElement('div');
inputFields.id = 'user-input';
document.body.appendChild(inputFields);

function renderInputs(inputs) {
    inputFields.replaceChildren();
    for (const input of inputs) {
        const inputElement = document.createElement('div');
        inputElement.className = 'user-input';
        inputElement.innerHTML = input.replaceAll('\n', '<br>');
        inputFields.appendChild(inputElement);
    }
}

const outputField = document.createElement('div');
outputField.id = 'ai-output';
document.body.appendChild(outputField);

function renderOutput(output) {
    outputField.innerHTML = output.replaceAll('\n', '<br>');
}

window.addEventListener('message', (e) => {
    try {
        if (e.data.type === 'renderContent') {
            renderInputs(e.data.data.inputs);
            renderOutput(e.data.data.output);
        } else if (e.type === 'streamContent') {
            renderOutput(e.data.data.output);
        }
    } catch (e) {
        console.error(e);
    }
});