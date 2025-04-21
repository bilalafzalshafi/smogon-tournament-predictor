// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a prediction form
    if (document.querySelector('form[data-xf-init="ajax-submit"]')) {
      console.log("Smogon Predictor: Prediction form detected");
      addPredictionButtons();
    }
  });
  
  function addPredictionButtons() {
    // Find the form submit row
    const submitRow = document.querySelector('.formSubmitRow');
    
    if (!submitRow) {
      console.error("Submit row not found");
      return;
    }
    
    // Create our button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'smogon-predictor-buttons';
    buttonContainer.style.marginBottom = '10px';
    
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
    
    // Insert before the submit button
    submitRow.parentNode.insertBefore(buttonContainer, submitRow);
  }
  
  function fillRandomPredictions() {
    // Find all lists of radio buttons
    // Based on your screenshot, choices are in ul.inputChoices
    const choiceLists = document.querySelectorAll('ul.inputChoices');
    
    choiceLists.forEach(list => {
      // Get all radio inputs in this list
      const radioButtons = list.querySelectorAll('input[type="radio"]');
      
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
    // Get tournament information
    const formTitle = document.querySelector('.p-body-header h1');
    const tournamentName = formTitle ? formTitle.textContent.trim() : "Tournament Prediction";
    const tournamentId = window.location.href;
    
    // Collect all predictions
    const predictions = [];
    const choiceLists = document.querySelectorAll('ul.inputChoices');
    
    choiceLists.forEach((list, index) => {
      // Try to get matchup information
      let matchupLabel = "";
      const labelElement = list.closest('dl').querySelector('dt');
      if (labelElement) {
        matchupLabel = labelElement.textContent.trim();
      }
      
      // Get player names from radio labels
      const radioLabels = list.querySelectorAll('label');
      const playerNames = Array.from(radioLabels).map(label => label.textContent.trim());
      
      // Get selected choice
      const selectedRadio = list.querySelector('input[type="radio"]:checked');
      const selectedIndex = selectedRadio ? Array.from(list.querySelectorAll('input[type="radio"]')).indexOf(selectedRadio) : -1;
      const prediction = selectedIndex >= 0 ? playerNames[selectedIndex] : "No selection";
      
      predictions.push({
        matchup: matchupLabel,
        player1: playerNames[0] || "Player 1",
        player2: playerNames[1] || "Player 2",
        prediction: prediction
      });
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
        msg.className = 'notice notice--success';
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