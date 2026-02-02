(function() {
    'use strict';
    const DEFAULT_VALUE = 200;
    let currentValue = parseInt(localStorage.getItem('stardust')) || DEFAULT_VALUE;
    currentValue = Math.max(0, Math.min(360, currentValue));
    function updateCssVariable(value) {
        document.documentElement.style.setProperty('--stardust', value);
    }
    updateCssVariable(currentValue);
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'stardust-toggle-btn';
    toggleBtn.innerHTML = `
        <svg width="1em" height="1em" class="text-[1.25rem]" data-icon="material-symbols:palette-outline">
            <symbol id="ai:material-symbols:palette-outline" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 22q-2.05 0-3.875-.788t-3.187-2.15t-2.15-3.187T2 12q0-2.075.813-3.9t2.2-3.175T8.25 2.788T12.2 2q2 0 3.775.688t3.113 1.9t2.125 2.875T22 11.05q0 2.875-1.75 4.413T16 17h-1.85q-.225 0-.312.125t-.088.275q0 .3.375.863t.375 1.287q0 1.25-.687 1.85T12 22m-5.5-9q.65 0 1.075-.425T8 11.5t-.425-1.075T6.5 10t-1.075.425T5 11.5t.425 1.075T6.5 13m3-4q.65 0 1.075-.425T11 7.5t-.425-1.075T9.5 6t-1.075.425T8 7.5t.425 1.075T9.5 9m5 0q.65 0 1.075-.425T16 7.5t-.425-1.075T14.5 6t-1.075.425T13 7.5t.425 1.075T14.5 9m3 4q.65 0 1.075-.425T19 11.5t-.425-1.075T17.5 10t-1.075.425T16 11.5t.425 1.075T17.5 13M12 20q.225 0 .363-.125t.137-.325q0-.35-.375-.825T11.75 17.3q0-1.05.725-1.675T14.25 15H16q1.65 0 2.825-.962T20 11.05q0-3.025-2.312-5.038T12.2 4Q8.8 4 6.4 6.325T4 12q0 3.325 2.338 5.663T12 20"></path>
            </symbol>
            <use href="#ai:material-symbols:palette-outline"></use>
        </svg>
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '360';
    slider.value = currentValue;
    slider.className = 'stardust-slider';

    const resetBtn = document.createElement('button');
    resetBtn.className = 'stardust-reset-btn';
    resetBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V2L8 6L12 10V7C15.31 7 18 9.69 18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13H4C4 17.42 7.58 21 12 21C16.42 21 20 17.42 20 13C20 8.58 16.42 5 12 5Z" fill="currentColor"/>
        </svg>
    `;
    resetBtn.title = `重置为${DEFAULT_VALUE}`;

    const valueDisplay = document.createElement('div');
    valueDisplay.className = 'stardust-value-display';
    valueDisplay.textContent = currentValue;

    const sliderControls = document.createElement('div');
    sliderControls.className = 'stardust-slider-controls';
    sliderControls.appendChild(resetBtn);
    sliderControls.appendChild(slider);
    sliderControls.appendChild(valueDisplay);

    const sliderPanel = document.createElement('div');
    sliderPanel.className = 'stardust-slider-panel';
    sliderPanel.appendChild(sliderControls);

    const container = document.createElement('div');
    container.className = 'stardust-container';
    container.appendChild(toggleBtn);
    container.appendChild(sliderPanel);

    // 207 background: linear-gradient(to right, var(--farallon-griedent-start), var(--farallon-griedent-end));
    const style = document.createElement('style');
    style.textContent = `

    @media screen and (min-width:768px) {
        .stardust-container {
            position: fixed;
            bottom: 50%;
            left: 15px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
    }

    @media screen and (max-width:768px) {
        .stardust-container {
            position: fixed;
            bottom: 25px;
            left: 15px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
    }
        
        .stardust-toggle-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #ffffff00;
            border: 0px solid #e5e7eb;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--farallon-griedent-start);
            font-size: 1.25rem;
            transition: all 0.3s ease;
            outline: none;
            padding: 0;
        }
        
        .stardust-toggle-btn:hover {
            background: #f8fafc;
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .stardust-toggle-btn:active {
            transform: scale(0.98);
        }
        
        .stardust-slider-panel {
            background: white;
            padding: 16px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid #e5e7eb;
            width: 240px;
            position: absolute;
            pointer-events: none;
            bottom: -20px;
            left: 40px;
        }
        
        .stardust-slider-panel.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
            pointer-events: auto;
        }
        
        .stardust-slider-controls {
            display: flex;
            align-items: center;
            gap: 12px;
            width: 100%;
        }
        
        .stardust-reset-btn {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            transition: all 0.2s ease;
            padding: 0;
            flex-shrink: 0;
        }
        
        .stardust-reset-btn:hover {
            background: #e5e7eb;
            color: #374151;
            transform: scale(1.05);
        }
        
        .stardust-reset-btn:active {
            transform: scale(0.95);
        }
        
        .stardust-slider {
            flex: 1;
            height: 12px;
            -webkit-appearance: none;
            background: var(--color-selection-bar); 
            border-radius: 8px;
            outline: none;
            margin: 0;
        }
        
        .stardust-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 10px;
            height: 20px;
            border-radius: 5px;
            background: var(--farallon-background-white);
            border: 0px solid var(--farallon-griedent-start);
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            transition: all 0.2s;
        }
        
        .stardust-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }
        
        .stardust-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: white;
            border: 2px solid #667eea;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .stardust-value-display {
            width: 40px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
            font-size: 14px;
            font-weight: 600;
            color: var(--farallon-griedent-start);
            background: var(--farallon-background-white);
            border-radius: 6px;
            border: 1px solid #e5e7eb;
            flex-shrink: 0;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(container);

    let isPanelVisible = false;
    
    function togglePanel() {
        isPanelVisible = !isPanelVisible;
        if (isPanelVisible) {
            sliderPanel.classList.add('show');
        } else {
            sliderPanel.classList.remove('show');
        }
    }

    function handleClickOutside(event) {
        if (!container.contains(event.target) && isPanelVisible) {
            sliderPanel.classList.remove('show');
            isPanelVisible = false;
        }
    }

    function updateValue(value) {
        valueDisplay.textContent = value;
        updateCssVariable(value);
        localStorage.setItem('stardust', value);
    }

    function resetValue() {
        const value = DEFAULT_VALUE;
        slider.value = value;
        updateValue(value);
    }

    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePanel();
    });
    
    slider.addEventListener('input', function() {
        const value = parseInt(this.value);
        updateValue(value);
    });
    
    resetBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        resetValue();
    });

    document.addEventListener('click', handleClickOutside);

    sliderPanel.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    console.log('Stardust滑块控制器已加载，当前值:', currentValue, '默认值:', DEFAULT_VALUE);
    
})();