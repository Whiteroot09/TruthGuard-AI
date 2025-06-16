// Global state
let currentPage = 'home';
let selectedImage = null;

// Page navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
    
    // Update nav active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.style.background = 'none';
        link.style.color = '#666';
    });
    
    // Highlight current nav item
    const navLinks = document.querySelectorAll('.nav-link');
    if (pageId === 'home' && navLinks[0]) {
        navLinks[0].style.background = 'rgba(79, 70, 229, 0.1)';
        navLinks[0].style.color = '#4f46e5';
    } else if (pageId === 'text-analysis' && navLinks[1]) {
        navLinks[1].style.background = 'rgba(79, 70, 229, 0.1)';
        navLinks[1].style.color = '#4f46e5';
    } else if (pageId === 'image-analysis' && navLinks[2]) {
        navLinks[2].style.background = 'rgba(79, 70, 229, 0.1)';
        navLinks[2].style.color = '#4f46e5';
    } else if (pageId === 'about-project' && navLinks[3]) {
        navLinks[3].style.background = 'rgba(79, 70, 229, 0.1)';
        navLinks[3].style.color = '#4f46e5';
    } else if (pageId === 'about-us' && navLinks[4]) {
        navLinks[4].style.background = 'rgba(79, 70, 229, 0.1)';
        navLinks[4].style.color = '#4f46e5';
    }
}

// Text Analysis Functions
async function analyzeText() {
    const textInput = document.getElementById('text-input');
    const analyzeBtn = document.getElementById('analyze-text-btn');
    const progressContainer = document.getElementById('text-progress');
    const progressFill = document.getElementById('text-progress-fill');
    const progressPercent = document.getElementById('text-progress-percent');
    const resultsPlaceholder = document.getElementById('text-results-placeholder');
    const resultsContent = document.getElementById('text-results');
    
    const text = textInput.value.trim();

    if (!text) return;

    let flaskResult = null;
    try {
        const res = await fetch('/post-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text}),
        });
        const data = await res.json();
        flaskResult = data;
    } catch (error) {
        console.error('Error sending data:', error);
        alert("Error sending data. Please try again.");
        return ;
    }

    // Start analysis
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<div class="loading-spinner"></div> Analyzing...';
    progressContainer.style.display = 'block';
    resultsPlaceholder.style.display = 'none';
    resultsContent.style.display = 'none';
    
    // Simulate processing steps
    const steps = [
        'Preprocessing text...',
        'Extracting features...',
        'Running BERT analysis...',
        'Applying Random Forest...',
        'Processing with SVM...',
        'Neural Network inference...',
        'Ensemble prediction...',
        'Finalizing results...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
        await sleep(800);
        const progress = ((i + 1) / steps.length) * 100;
        progressFill.style.width = progress + '%';
        progressPercent.textContent = Math.round(progress) + '%';
    }
    
    // --- COMMENT OUT MOCK RESULT GENERATION ---
    // const result = generateTextAnalysisResult();

    // --- USE REAL RESULT FROM FLASK ---
    // Prepare algorithms array for displayTextResults
    const algorithms = Object.entries(flaskResult.algorithms).map(([name, res]) => ({
        name: name,
        prediction: res.label.toLowerCase().includes('real') ? 'real' : 'fake',
        accuracy: '', // Not available from backend, leave blank or add if you have it
        confidence: res['Real %'] > res['Fake %'] ? res['Real %'] : res['Fake %']
    }));

    // Compose a result object compatible with displayTextResults
    const result = {
        prediction: flaskResult.final_result.toLowerCase().includes('real') ? 'real' : 'fake',
        confidence: Math.max(...algorithms.map(a => a.confidence)), // Use highest confidence
        algorithms: algorithms,
        features: {
            sentiment: 0,
            complexity: 0,
            credibility: 0
        }
    };

    displayTextResults(result);
    resultsContent.style.display = 'block';
    progressContainer.style.display = 'none';
    
    // Reset button
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-play"></i> Analyze Article';
}

function generateTextAnalysisResult() {
    const prediction = Math.random() > 0.5 ? 'real' : 'fake';
    const confidence = 75 + Math.random() * 20;
    
    return {
        prediction,
        confidence,
        algorithms: [
            {
                name: 'BERT Transformer',
                accuracy: 92.5,
                prediction: Math.random() > 0.4 ? 'real' : 'fake',
                confidence: 85 + Math.random() * 10
            },
            {
                name: 'Random Forest',
                accuracy: 88.3,
                prediction: Math.random() > 0.5 ? 'real' : 'fake',
                confidence: 78 + Math.random() * 15
            },
            {
                name: 'Support Vector Machine',
                accuracy: 86.7,
                prediction: Math.random() > 0.6 ? 'real' : 'fake',
                confidence: 72 + Math.random() * 18
            },
            {
                name: 'Neural Network',
                accuracy: 90.1,
                prediction: Math.random() > 0.45 ? 'real' : 'fake',
                confidence: 80 + Math.random() * 12
            }
        ],
        features: {
            sentiment: Math.random() * 100,
            complexity: Math.random() * 100,
            credibility: Math.random() * 100
        }
    };
}

function displayTextResults(result) {
    const resultsContent = document.getElementById('text-results');
    
    resultsContent.innerHTML = `
        <!-- Overall Result -->
        <div class="result-summary">
            <div class="result-icon ${result.prediction}">
                <i class="fas fa-${result.prediction === 'real' ? 'check-circle' : 'times-circle'}"></i>
            </div>
            <h3 class="result-title">
                ${result.prediction === 'real' ? 'REAL NEWS' : 'FAKE NEWS'}
            </h3>
            <p class="result-confidence">
                Confidence: ${result.confidence.toFixed(1)}%
            </p>
        </div>

        <!-- Algorithm Breakdown -->
        <div class="algorithms-section">
            <h4>Algorithm Analysis</h4>
            <div class="algorithms-list">
                ${result.algorithms.map(algo => `
                    <div class="algorithm-item">
                        <div class="algorithm-info">
                            <div class="algorithm-header">
                                <span class="algorithm-name">${algo.name}</span>
                                <span class="badge ${algo.prediction}">${algo.prediction.toUpperCase()}</span>
                            </div>
                            <div class="algorithm-details">
                                
                                <span>Confidence: ${algo.confidence.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        <!-- Feature Analysis section removed -->
    `;
}

// Image Analysis Functions
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    selectedImage = file;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const placeholder = document.getElementById('upload-placeholder');
        const preview = document.getElementById('image-preview');
        const previewImg = document.getElementById('preview-img');
        const imageName = document.getElementById('image-name');
        const analyzeBtn = document.getElementById('analyze-image-btn');
        
        placeholder.style.display = 'none';
        preview.style.display = 'block';
        previewImg.src = e.target.result;
        imageName.textContent = file.name;
        analyzeBtn.disabled = false;
        
        // Hide previous results
        document.getElementById('image-results-placeholder').style.display = 'none';
        document.getElementById('image-results').style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

async function analyzeImage() {
    const input = document.getElementById('image-input');
    const file = input.files[0];
    if (!file) return;

    // Show progress UI if you want
    document.getElementById('image-progress').style.display = 'block';
    document.getElementById('image-results').style.display = 'none';
    document.getElementById('image-results-placeholder').style.display = 'none';

    const formData = new FormData();
    formData.append('image', file);

    fetch('/analyze-image', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('image-progress').style.display = 'none';
        if (data.error) {
            document.getElementById('image-results').innerHTML = `<p style="color:red;">${data.error}</p>`;
        } else {
            document.getElementById('image-results').innerHTML = `
                <h4>Prediction: <span style="color:${data.prediction === 'fake' ? 'red' : 'green'}">${data.prediction.toUpperCase()}</span></h4>
                <p>Fake Probability: <b>${data.fake_prob}%</b></p>
                <p>Real Probability: <b>${data.real_prob}%</b></p>
            `;
        }
        document.getElementById('image-results').style.display = 'block';
    })
    .catch(err => {
        document.getElementById('image-progress').style.display = 'none';
        document.getElementById('image-results').innerHTML = `<p style="color:red;">Error: ${err}</p>`;
        document.getElementById('image-results').style.display = 'block';
    });
}

// Utility Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
});
