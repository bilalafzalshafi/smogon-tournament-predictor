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
  
  // Find the form element more reliably
  const form = document.querySelector('form[data-xf-init*="ajax-submit"]');
  
  if (!form) {
    console.error("Form not found - trying alternative selectors");
    // Try alternative approaches to find the form
    const alternativeForms = document.querySelectorAll('form');
    if (alternativeForms.length > 0) {
      console.log("Found form with alternative selector");
      addButtonsToForm(alternativeForms[0]);
    } else {
      console.error("No forms found on the page");
    }
    return;
  }
  
  addButtonsToForm(form);
}

function addButtonsToForm(form) {
  // Find the block-body container
  const blockBody = form.querySelector('.block-body');
  const container = blockBody || form;
  
  // Find the first form row to insert before
  const firstFormRow = container.querySelector('.formRow');
  if (!firstFormRow) {
    console.error("No form rows found");
    return;
  }
  
  // Create random prediction button container
  const randomContainer = document.createElement('div');
  randomContainer.className = 'formRow smogon-predictor-random';
  randomContainer.style.marginBottom = '15px';
  
  // Random prediction button
  const randomButton = document.createElement('button');
  randomButton.textContent = 'Fill Random Predictions';
  randomButton.className = 'button--primary';
  randomButton.type = 'button'; // Prevent form submission
  randomButton.addEventListener('click', fillRandomPredictions);
  
  // Add random button to container
  randomContainer.appendChild(randomButton);
  
  // Insert at the top of the form content
  container.insertBefore(randomContainer, firstFormRow);
  
  // Find the submit row for the save button
  const submitButton = form.querySelector('button[type="submit"]');
  let submitRow = null;
  
  if (submitButton) {
    // Get the parent of the submit button
    submitRow = submitButton.closest('.formRow') || submitButton.parentNode;
  } else {
    // Try common selectors
    const selectors = ['.formSubmitRow', '.formRow:last-child'];
    for (const selector of selectors) {
      submitRow = form.querySelector(selector);
      if (submitRow) break;
    }
    
    // If still not found, use the last form row
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
  
  // Create save button container
  const saveContainer = document.createElement('div');
  saveContainer.className = 'smogon-predictor-save';
  saveContainer.style.marginTop = '10px';
  
  // Save button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save Predictions';
  saveButton.className = 'button';
  saveButton.type = 'button'; // Prevent form submission
  saveButton.addEventListener('click', savePredictions);
  
  // Add save button to container
  saveContainer.appendChild(saveButton);
  
  // Add the save button
  if (submitRow === form) {
    // Append to the end of the form
    form.appendChild(saveContainer);
  } else {
    // Insert before the submit row
    submitRow.parentNode.insertBefore(saveContainer, submitRow);
  }
  
  console.log("Successfully added prediction buttons");
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
  let tournamentName = document.querySelector('h1, .p-title-value');
  tournamentName = tournamentName ? tournamentName.textContent.trim() : "Tournament Prediction";
  
  // Get current date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  const timeStr = now.toLocaleTimeString();
  
  // Start building the text content
  let textContent = `${tournamentName}\n`;
  textContent += `Predicted on: ${dateStr} ${timeStr}\n\n`;
  
  // Collect all predictions
  const matchupRows = document.querySelectorAll('.formRow--input');
  let hasPredictions = false;
  
  matchupRows.forEach((row, index) => {
    // Get radio buttons for this matchup
    const radioButtons = row.querySelectorAll('input[type="radio"]');
    
    if (radioButtons.length === 2) {
      // Get player names from the label spans
      const playerLabels = row.querySelectorAll('.iconic-label');
      const playerNames = Array.from(playerLabels).map(label => label.textContent.trim());
      
      // Get selected choice
      const selectedIndex = radioButtons[0].checked ? 0 : (radioButtons[1].checked ? 1 : -1);
      
      if (selectedIndex >= 0 && playerNames.length === 2) {
        hasPredictions = true;
        // Format: Player1 vs. Player2 (with winner marked with *)
        if (selectedIndex === 0) {
          textContent += `**${playerNames[0]}** vs. ${playerNames[1]}\n`;
        } else {
          textContent += `${playerNames[0]} vs. **${playerNames[1]}**\n`;
        }
      }
    }
  });
  
  if (!hasPredictions) {
    alert("No predictions found. Please make some predictions first.");
    return;
  }
  
  // Create a download link
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  // Create a temporary link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tournamentName.replace(/[^a-z0-9]/gi, '_')}_predictions.txt`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  // Show a success message
  const msg = document.createElement('div');
  msg.textContent = 'Predictions downloaded!';
  msg.className = 'message message--success';
  msg.style.marginBottom = '10px';
  
  // Add to page
  const saveContainer = document.querySelector('.smogon-predictor-save');
  if (saveContainer) {
    saveContainer.parentNode.insertBefore(msg, saveContainer);
  } else {
    const form = document.querySelector('form');
    if (form) form.appendChild(msg);
  }
  
  // Remove after 3 seconds
  setTimeout(() => {
    msg.remove();
  }, 3000);
}