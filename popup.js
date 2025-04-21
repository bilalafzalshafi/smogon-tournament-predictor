// Load prediction history when popup opens
document.addEventListener('DOMContentLoaded', function() {
    loadPredictionHistory();
    
    // Set up button handlers
    document.getElementById('exportBtn').addEventListener('click', exportHistory);
    document.getElementById('clearBtn').addEventListener('click', clearHistory);
  });
  
  function loadPredictionHistory() {
    const historyElement = document.getElementById('history');
    
    chrome.storage.local.get('predictionHistory', function(data) {
      const history = data.predictionHistory || {};
      
      if (Object.keys(history).length === 0) {
        historyElement.innerHTML = '<p class="no-data">No prediction history found.</p>';
        return;
      }
      
      // Clear existing content
      historyElement.innerHTML = '';
      
      // Sort tournaments by date (newest first)
      const sortedTournaments = Object.entries(history)
        .sort((a, b) => new Date(b[1].date) - new Date(a[1].date));
      
      // Display each tournament
      for (const [tournamentId, tournament] of sortedTournaments) {
        const tournamentElement = document.createElement('div');
        tournamentElement.className = 'tournament';
        
        // Tournament name
        const nameElement = document.createElement('h2');
        nameElement.textContent = tournament.name;
        tournamentElement.appendChild(nameElement);
        
        // Date
        const dateElement = document.createElement('div');
        dateElement.className = 'date';
        const date = new Date(tournament.date);
        dateElement.textContent = `Predicted on: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        tournamentElement.appendChild(dateElement);
        
        // Predictions
        tournament.predictions.forEach(prediction => {
          const matchupElement = document.createElement('div');
          matchupElement.className = 'matchup';
          
          matchupElement.textContent = `${prediction.player1} vs ${prediction.player2} - Picked: `;
          
          const predictionElement = document.createElement('span');
          predictionElement.className = 'prediction';
          predictionElement.textContent = prediction.prediction;
          
          matchupElement.appendChild(predictionElement);
          tournamentElement.appendChild(matchupElement);
        });
        
        historyElement.appendChild(tournamentElement);
      }
    });
  }
  
  function exportHistory() {
    chrome.storage.local.get('predictionHistory', function(data) {
      const history = data.predictionHistory || {};
      
      if (Object.keys(history).length === 0) {
        alert('No prediction history to export.');
        return;
      }
      
      // Convert to JSON
      const historyJson = JSON.stringify(history, null, 2);
      
      // Create download link
      const blob = new Blob([historyJson], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'smogon_predictions.json';
      a.click();
      
      URL.revokeObjectURL(url);
    });
  }
  
  function clearHistory() {
    if (confirm('Are you sure you want to clear all prediction history?')) {
      chrome.storage.local.remove('predictionHistory', function() {
        loadPredictionHistory();
      });
    }
  }