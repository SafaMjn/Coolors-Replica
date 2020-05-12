//global variables
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const textHex = document.querySelectorAll('.color h2');

//event listeners
sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

//color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function generateRandomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    //add color to bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //check contrast
    checkTextContrast(randomColor, hexText);
    //set slider values to picked color properties
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorSlider(color, hue, brightness, saturation);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  text.style.color = luminance > 0.5 ? '#1a1717' : '#fffafa';
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
    e.target.getAttribute('data-saturation') ||
    e.target.getAttribute('data-hue');

  let sliders = e.target.parentElement.querySelectorAll('input[type=range]');

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  let bgColorTxt = colorDivs[index].children[0];

  let color = chroma(bgColorTxt.innerHTML)
    .set('hsl.s', saturation.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);

  colorDivs[index].style.backgroundColor = color;
  bgColorTxt.innerHTML = chroma(color);
}

generateRandomColors();
