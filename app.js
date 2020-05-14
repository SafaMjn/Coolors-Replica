//#region global variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const hexTexts = document.querySelectorAll('.color h2');
const popupContainer = document.querySelector('.copy-container');
const adjustBtns = document.querySelectorAll('.adjust');
const lockBtns = document.querySelectorAll('.lock');
const closeAdjustBtns = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;

//local storage
let savedPalettes = [];
const saveBtn = document.querySelector('.save');
const submitSaveBtn = document.querySelector('.submit-save');
const closeSaveBtn = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//#endregion global variables
//#region event listeners
sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateTextUI(index);
  });
});

generateBtn.addEventListener('click', generateRandomColors);

hexTexts.forEach((hexText) => {
  hexText.addEventListener('click', () => {
    copyToClipboard(hexText);
  });
});

popupContainer.addEventListener('transitionend', () => {
  const popup = popupContainer.children[0];
  popupContainer.classList.remove('active');
  popup.classList.remove('active');
});

adjustBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    toggleAdjustmentPanel(index);
  });
});
closeAdjustBtns.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
});

lockBtns.forEach((button, index) => {
  button.addEventListener('click', (e) => {
    lockLayer(e, index);
  });
});

//local storage
saveBtn.addEventListener('click', openPalette);
closeSaveBtn.addEventListener('click', closePalette);

submitSaveBtn.addEventListener('click', savePalette);

libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

//#endregion event listeners

//calls
getLocal();
generateRandomColors();

//functions
function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  text.style.color = luminance > 0.75 ? '#1a1717' : '#fffafa';
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const hexText = colorDivs[index].children[0];
  //activeDiv.querySelector('h2');
  //const icons = activeDiv.querySelectorAll('.controls button');
  hexText.innerText = color.hex();
  checkTextContrast(color, hexText);
  checkTextContrast(color, adjustBtns[index]);
  checkTextContrast(color, lockBtns[index]);
}
function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  console.log(el.value);

  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  //popup animation
  const popup = popupContainer.children[0];
  popupContainer.classList.add('active');
  popup.classList.add('active');
}
function lockLayer(e, index) {
  const lockIcon = e.target.children[0];
  const currentBg = colorDivs[index];

  currentBg.classList.toggle('locked');
  lockIcon.classList.toggle('fa-lock');
  lockIcon.classList.toggle('fa-lock-open');
}
//#region Color generation functions
function generateHex() {
  return chroma.random();
}
function generateRandomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    //add new color to array
    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(randomColor.hex());
    }
    //add color to bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    //check contrast with text
    checkTextContrast(randomColor, hexText);

    //set slider values to picked color properties
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorSlider(color, hue, brightness, saturation);
  });

  //reset inputs
  resetInputs();
  //check contrast in adjust buttons and lock buttons
  adjustBtns.forEach((btn, index) => {
    checkTextContrast(initialColors[index], btn);
  });
  lockBtns.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
  });
}
//#endregion Color generation functions

//#region slider functions
function colorSlider(color, hue, brightness, saturation) {
  //saturation
  [minSat, maxSat] = [color.set('hsl.s', 0), color.set('hsl.s', 1)];
  const scaleSat = chroma.scale([minSat, color, maxSat]);
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)},
  ${scaleSat(1)})`;

  //brightness
  const midBright = color.set('hsl.l', 0.5);
  const scaleBright = chroma.scale(['black', midBright, 'white']);
  brightness.style.backgroundImage = `linear-gradient(to right,
  ${scaleBright(0)},
  ${scaleBright(0.5)},
  ${scaleBright(1)})`;

  //hue
  hue.style.backgroundImage = `linear-gradient(to right,#CC4B4B,#CCCC4B,#4BCC4B,#4BCCCC,#4B4BCC,#CC4BCC,#CC4B4B)`;
}

function hslControls(e) {
  const index =
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue');

  let sliders = e.target.parentElement.querySelectorAll('input[type=range]');

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  let bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

  colorDivs[index].style.backgroundColor = color;
  //update slider background
  colorSlider(color, hue, brightness, saturation);
}

function resetInputs() {
  sliders.forEach((slider) => {
    if (slider.classList.value === 'hue-input') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.classList.value === 'sat-input') {
      const satColor = initialColors[slider.getAttribute('data-sat')];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
    if (slider.classList.value === 'bright-input') {
      const brightColor = initialColors[slider.getAttribute('data-bright')];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
  });
}

function toggleAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}
//#endregion slider functions

//#region palette functions
function openPalette(e) {
  saveContainer.classList.add('active');
  saveContainer.children[0].classList.add('active');
}
function closePalette(e) {
  saveContainer.classList.remove('active');
  saveContainer.children[0].classList.remove('active');
}
function openLibrary(e) {
  libraryContainer.classList.add('active');
  libraryContainer.children[0].classList.add('active');
}
function closeLibrary(e) {
  libraryContainer.classList.remove('active');
  libraryContainer.children[0].classList.remove('active');
}
function generateLibraryPalette(paletteObj) {
  const palette = document.createElement('div');
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerHTML = paletteObj.name;
  const preview = document.createElement('div');
  preview.classList.add('small-preview');
  paletteObj.colors.forEach((color) => {
    const colorDiv = document.createElement('div');
    colorDiv.style.background = color;
    preview.appendChild(colorDiv);
  });
  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-btn');
  paletteBtn.classList.add(paletteObj.nb);
  paletteBtn.innerText = 'Select';

  //attach event to btn
  paletteBtn.addEventListener('click', (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    //reset sliders
    resetInputs();
    colorDivs.forEach((div, index) => {
      const color = chroma(div.children[0].innerText);
      const sliders = div.querySelectorAll('.sliders input');
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];

      colorSlider(color, hue, brightness, saturation);
    });
  });

  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
}
function savePalette(e) {
  saveContainer.classList.remove('active');
  saveContainer.children[0].classList.remove('active');
  const name = saveInput.value;
  const colors = [];
  hexTexts.forEach((hex) => {
    colors.push(hex.innerText);
  });

  //generate palette object
  let paletteNb = savedPalettes.length;
  const paletteObj = { name, colors, nb: paletteNb };
  savedPalettes.push(paletteObj);
  //save to local storage
  savetoLocal(paletteObj);
  saveInput.value = '';
  //generate the palette for library
  generateLibraryPalette(paletteObj);
}

function savetoLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem('palettes'));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem('palettes') === null) {
    //Local Palettes
    localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    // *2

    savedPalettes = [...paletteObjects];
    paletteObjects.forEach((paletteObj) => {
      //Generate the palette for Library
      generateLibraryPalette(paletteObj);
    });
  }
}
//#endregion palette functions
