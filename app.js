//global variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const textHex = document.querySelectorAll('.color h2');
let initialColors;

//event listeners
sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

colorDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateTextUI(index);
  });
});

generateBtn.addEventListener('click', generateRandomColors);
//color generator
function generateHex() {
  return chroma.random();
}

function generateRandomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    initialColors.push(randomColor.hex());
    //add color to bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //check contrast with text and icons
    checkTextContrast(randomColor, hexText);
    const icons = div.querySelectorAll('.controls button');
    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }

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
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  text.style.color = luminance > 0.8 ? '#1a1717' : '#fffafa';
}

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

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
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
generateRandomColors();
