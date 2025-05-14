window.addEventListener('load', function() {
  checkAndAddButtons();
});

function checkAndAddButtons() {
  if (isPredictionForm()) {
    addPredictionButtons();
  }
}

function isPredictionForm() {
  const radioInputs = document.querySelectorAll('input[type="radio"]');
  
  const formRows = document.querySelectorAll('.formRow--input');
  let hasPredictionFormat = false;
  
  formRows.forEach(row => {
    const radios = row.querySelectorAll('input[type="radio"]');
    if (radios.length >= 2) {
      hasPredictionFormat = true;
    }
  });
  
  return hasPredictionFormat;
}

function addPredictionButtons() {
  const form = document.querySelector('form[data-xf-init*="ajax-submit"]');
  
  if (!form) {
    console.error("Form not found - trying alternative selectors");
    const alternativeForms = document.querySelectorAll('form');
    if (alternativeForms.length > 0) {
      addButtonsToForm(alternativeForms[0]);
    } else {
      console.error("No forms found on the page");
    }
    return;
  }
  
  addButtonsToForm(form);
}

function addButtonsToForm(form) {
  const blockBody = form.querySelector('.block-body');
  const container = blockBody || form;
  
  const firstFormRow = container.querySelector('.formRow');
  if (!firstFormRow) {
    console.error("No form rows found");
    return;
  }
  
  const randomContainer = document.createElement('div');
  randomContainer.className = 'formRow smogon-predictor-random';
  randomContainer.style.marginBottom = '15px';
  
  const randomButton = document.createElement('button');
  randomButton.textContent = 'Fill Random Predictions';
  randomButton.className = 'button--primary';
  randomButton.type = 'button'; // Prevent form submission
  randomButton.addEventListener('click', fillRandomPredictions);
  
  randomContainer.appendChild(randomButton);
  
  container.insertBefore(randomContainer, firstFormRow);
  
  // Find the submit row for the save button
  const submitButton = form.querySelector('button[type="submit"]');
  let submitRow = null;
  
  if (submitButton) {
    submitRow = submitButton.closest('.formRow') || submitButton.parentNode;
  } else {
    const selectors = ['.formSubmitRow', '.formRow:last-child'];
    for (const selector of selectors) {
      submitRow = form.querySelector(selector);
      if (submitRow) break;
    }
    
    if (!submitRow) {
      const allRows = form.querySelectorAll('.formRow');
      if (allRows.length > 0) {
        submitRow = allRows[allRows.length - 1];
      }
    }
  }
  
  if (!submitRow) {
    console.error("Submit row not found - using form for save button");
    submitRow = form;
  }
  
  const saveContainer = document.createElement('div');
  saveContainer.className = 'smogon-predictor-save';
  saveContainer.style.marginTop = '10px';
  
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Predictions';
  saveButton.className = 'button';
  saveButton.type = 'button'; // Prevent form submission
  saveButton.addEventListener('click', savePredictions);
  
  saveContainer.appendChild(saveButton);
  
  if (submitRow === form) {
    form.appendChild(saveContainer);
  } else {
    submitRow.parentNode.insertBefore(saveContainer, submitRow);
  }
}

function fillRandomPredictions() {
  const matchupRows = document.querySelectorAll('.formRow--input');
  
  matchupRows.forEach(row => {
    const radioButtons = row.querySelectorAll('input[type="radio"]');
    
    if (radioButtons.length >= 2) {
      const randomIndex = Math.floor(Math.random() * radioButtons.length);
      radioButtons[randomIndex].checked = true;
      
      const event = new Event('change', { bubbles: true });
      radioButtons[randomIndex].dispatchEvent(event);
    }
  });
}

function savePredictions() {
  let tournamentName = document.querySelector('h1, .p-title-value');
  tournamentName = tournamentName ? tournamentName.textContent.trim() : "Tournament Prediction";
  
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  
  let textContent = `${tournamentName}\n`;
  textContent += `Predicted on: ${dateStr} ${timeStr}\n\n`;
  
  const matchupRows = document.querySelectorAll('.formRow--input');
  let hasPredictions = false;
  
  matchupRows.forEach((row, index) => {
    const radioButtons = row.querySelectorAll('input[type="radio"]');
    
    if (radioButtons.length >= 2) {
      const playerLabels = row.querySelectorAll('.iconic-label');
      const playerNames = Array.from(playerLabels).map(label => label.textContent.trim());
      
      let selectedIndex = -1;
      radioButtons.forEach((radio, idx) => {
        if (radio.checked) {
          selectedIndex = idx;
        }
      });
      
      if (selectedIndex >= 0 && playerNames.length >= 2) {
        hasPredictions = true;
        
        let matchupText = '';
        playerNames.forEach((name, idx) => {
          if (idx === selectedIndex) {
            matchupText += `*${name}*`;
          } else {
            matchupText += name;
          }
          
          if (idx < playerNames.length - 1) {
            matchupText += ' vs. ';
          }
        });
        
        textContent += matchupText + '\n';
      }
    }
  });
  
  if (!hasPredictions) {
    alert("No predictions found. Please make some predictions first.");
    return;
  }
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tournamentName.replace(/[^a-z0-9]/gi, '_')}_predictions.txt`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  const msg = document.createElement('div');
  msg.textContent = 'Predictions downloaded!';
  msg.className = 'message message--success';
  msg.style.marginBottom = '10px';
  
  const saveContainer = document.querySelector('.smogon-predictor-save');
  if (saveContainer) {
    saveContainer.parentNode.insertBefore(msg, saveContainer);
  } else {
    const form = document.querySelector('form');
    if (form) form.appendChild(msg);
  }
  
  setTimeout(() => {
    msg.remove();
  }, 3000);
}