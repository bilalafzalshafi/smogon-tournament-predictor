// Add this at the top of your content.js file
console.log("Smogon Predictor: Extension loaded on " + window.location.href);

// Modify the isPredictionForm function to give more debug info
function isPredictionForm() {
  console.log("Checking if this is a prediction form...");
  
  const radioInputs = document.querySelectorAll('input[type="radio"]');
  console.log("Found " + radioInputs.length + " radio inputs");
  
  const formRows = document.querySelectorAll('.formRow--input');
  console.log("Found " + formRows.length + " form rows with class .formRow--input");
  
  let hasPredictionFormat = false;
  
  formRows.forEach((row, index) => {
    const radios = row.querySelectorAll('input[type="radio"]');
    console.log("Row " + index + " has " + radios.length + " radio buttons");
    if (radios.length === 2) {
      hasPredictionFormat = true;
    }
  });
  
  console.log("Is prediction form? " + hasPredictionFormat);
  return hasPredictionFormat;
}

// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(checkAndAddButtons, 1000); // Give the page a bit more time to fully render
});

// Also try when the window has loaded
window.addEventListener('load', function() {
  checkAndAddButtons();
});

function checkAndAddButtons() {
  console.log("Smogon Predictor: Checking for prediction form");
  
  // Look for prediction form - based on your screenshots
  if (isPredictionForm()) {
    console.log("Smogon Predictor: Prediction form detected");
    addPredictionButtons();
  } else {
    console.log("Smogon Predictor: Not a prediction form");
  }
}

function isPredictionForm() {
  // Check for radio buttons in a form that looks like a prediction form
  const radioInputs = document.querySelectorAll('input[type="radio"]');
  if (radioInputs.length < 2) return false;
  
  // Look for pairs of radio buttons (for 1v1 matchups)
  const formRows = document.querySelectorAll('.formRow--input');
  let hasPredictionFormat = false;
  
  formRows.forEach(row => {
    const radios = row.querySelectorAll('input[type="radio"]');
    if (radios.length === 2) {
      hasPredictionFormat = true;
    }
  });
  
  return hasPredictionFormat;
}

function addPredictionButtons() {
  console.log("Attempting to add prediction buttons");
  
  // Try multiple possible selectors for the submit row
  const submitRowSelectors = [
    '.formSubmitRow', 
    '.formRow.formSubmitRow', 
    '.formSubmitRow--sticky',
    '.formRow.formSubmitRow--sticky',
    'dl.formSubmitRow',
    'dl.formRow.formSubmitRow',
    '.formRow:last-child',
    'form .block-outer:last-child',
    'form .formRow:last-of-type'
  ];
  
  let submitRow = null;
  for (const selector of submitRowSelectors) {
    submitRow = document.querySelector(selector);
    if (submitRow) {
      console.log("Found submit row with selector: " + selector);
      break;
    }
  }
  
  // If we still can't find it, try the last form row
  if (!submitRow) {
    const formRows = document.querySelectorAll('.formRow');
    if (formRows.length > 0) {
      submitRow = formRows[formRows.length - 1];
      console.log("Using last form row as submit row");
    }
  }
  
  if (!submitRow) {
    console.error("Submit row not found - trying form directly");
    submitRow = document.querySelector('form');
    if (!submitRow) {
      console.error("Form not found either - cannot add buttons");
      return;
    }
  }
  
  // Create our button container
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'smogon-predictor-buttons';
  buttonContainer.style.marginBottom = '10px';
  buttonContainer.style.padding = '10px';
  buttonContainer.style.background = '#f0f0f0';
  buttonContainer.style.borderRadius = '4px';
  
  // Random prediction button
  const randomButton = document.createElement('button');
  randomButton.textContent = 'Fill Random Predictions';
  randomButton.className = 'button--primary';
  randomButton.type = 'button'; // Prevent form submission
  randomButton.addEventListener('click', fillRandomPredictions);
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Predictions';
  saveButton.className = 'button';
  saveButton.type = 'button'; // Prevent form submission
  saveButton.addEventListener('click', savePredictions);
  
  // Add buttons to container
  buttonContainer.appendChild(randomButton);
  buttonContainer.appendChild(document.createTextNode(' '));
  buttonContainer.appendChild(saveButton);
  
  // Try different insertion methods depending on what we found
  try {
    if (submitRow.tagName === 'FORM') {
      // If we're using the form, prepend to it
      submitRow.prepend(buttonContainer);
    } else {
      // Insert before the submit row
      submitRow.parentNode.insertBefore(buttonContainer, submitRow);
    }
    console.log("Successfully added prediction buttons");
  } catch (error) {
    console.error("Error adding buttons:", error);
    // Last resort - append to body
    document.body.appendChild(buttonContainer);
    console.log("Buttons added to body as fallback");
  }
}

function fillRandomPredictions() {
  // Find all matchup rows from your screenshots
  const matchupRows = document.querySelectorAll('.formRow--input');
  
  matchupRows.forEach(row => {
    // Find the radio buttons for this matchup
    const radioButtons = row.querySelectorAll('input[type="radio"]');
    
    if (radioButtons.length === 2) {
      // This is a 1v1 matchup, randomly select one
      const randomIndex = Math.floor(Math.random() * 2);
      radioButtons[randomIndex].checked = true;
      
      // Trigger any XenForo events if needed
      const event = new Event('change', { bubbles: true });
      radioButtons[randomIndex].dispatchEvent(event);
    }
  });
  
  console.log("Random predictions filled");
}

function savePredictions() {
  // Get tournament information from URL
  const tournamentId = window.location.href;
  let tournamentName = document.querySelector('h1, .p-title-value');
  tournamentName = tournamentName ? tournamentName.textContent.trim() : "Tournament Prediction";
  
  // Collect all predictions
  const predictions = [];
  const matchupRows = document.querySelectorAll('.formRow--input');
  
  matchupRows.forEach((row, index) => {
    // Try to get matchup information
    const radioButtons = row.querySelectorAll('input[type="radio"]');
    
    if (radioButtons.length === 2) {
      // Get player names from labels
      const labels = row.querySelectorAll('label');
      const playerNames = Array.from(labels).map(label => label.textContent.trim());
      
      // Get selected choice
      const selectedIndex = radioButtons[0].checked ? 0 : (radioButtons[1].checked ? 1 : -1);
      
      predictions.push({
        matchup: `Match ${index + 1}`,
        player1: playerNames[0] || "Player 1",
        player2: playerNames[1] || "Player 2",
        prediction: selectedIndex >= 0 ? playerNames[selectedIndex] : "No selection"
      });
    }
  });
  
  // Save to extension storage
  chrome.storage.local.get('predictionHistory', function(data) {
    const history = data.predictionHistory || {};
    
    history[tournamentId] = {
      name: tournamentName,
      date: new Date().toISOString(),
      predictions: predictions
    };
    
    chrome.storage.local.set({ 'predictionHistory': history }, function() {
      // Show a success message
      const msg = document.createElement('div');
      msg.textContent = 'Predictions saved!';
      msg.className = 'message message--success';
      msg.style.marginBottom = '10px';
      
      // Add to page
      const buttonContainer = document.querySelector('.smogon-predictor-buttons');
      buttonContainer.parentNode.insertBefore(msg, buttonContainer);
      
      // Remove after 3 seconds
      setTimeout(() => {
        msg.remove();
      }, 3000);
    });
  });
}